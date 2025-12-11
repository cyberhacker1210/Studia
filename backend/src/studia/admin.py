from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import traceback
import os
from .database import supabase

router = APIRouter()

# Mot de passe admin
ADMIN_PASSWORD = os.getenv("ADMIN_SECRET", "studia123").strip()


class AnalyticsEvent(BaseModel):
    user_id: str
    event_type: str
    event_data: Dict[str, Any] = {}


@router.post("/track")
async def track_event(event: AnalyticsEvent):
    if not supabase: return {"status": "error"}
    try:
        supabase.table('analytics_events').insert({
            "user_id": event.user_id,
            "event_type": event.event_type,
            "event_data": event.event_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        }).execute()
        return {"status": "ok"}
    except Exception:
        return {"status": "error"}


@router.get("/dashboard")
async def get_admin_stats(x_admin_password: Optional[str] = Header(None)):
    # 1. Vérif Auth
    if not x_admin_password or x_admin_password.strip() != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="Mot de passe incorrect")

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    stats = {
        "total_users": 0, "dau": 0, "wau": 0, "avg_session_time": "0m",
        "top_feature": "-", "retention_j1": "-", "recent_activity": []
    }

    try:
        now = datetime.now(timezone.utc)
        seven_days_ago = (now - timedelta(days=7)).isoformat()

        # --- STATS GLOBALES ---
        try:
            users_res = supabase.table('users').select('id, email', count='exact').execute()
            stats["total_users"] = users_res.count if users_res.count else 0

            # Création d'un dictionnaire ID -> Email pour l'affichage
            user_map = {u['id']: u.get('email', 'Inconnu') for u in users_res.data}
        except:
            user_map = {}

        # --- RECUPERATION LOGS (Derniers 50 événements) ---
        logs_res = supabase.table('analytics_events') \
            .select('*') \
            .order('created_at', desc=True) \
            .limit(50) \
            .execute()

        raw_logs = logs_res.data

        # --- TRAITEMENT DU JOURNAL D'ACTIVITÉ ---
        activity_feed = []
        for log in raw_logs:
            # On formate pour le frontend
            user_email = user_map.get(log['user_id'], 'Utilisateur Inconnu')

            # On nettoie le type d'événement pour l'affichage
            action_name = log['event_type']
            details = ""

            if log['event_type'] == 'feature_use':
                feat = log['event_data'].get('feature', '')
                action_name = f"Utilisation : {feat}"
                details = log['event_data'].get('path', '')
            elif log['event_type'] == 'session_end':
                action_name = "Fin de session"
                sec = log['event_data'].get('duration_seconds', 0)
                details = f"Durée : {sec}s"

            activity_feed.append({
                "id": log['id'],
                "time": log['created_at'],
                "user": user_email,
                "action": action_name,
                "details": details
            })

        stats["recent_activity"] = activity_feed

        # --- CALCULS STATS (Code existant simplifié) ---
        # (On garde le calcul DAU/WAU pour avoir quand même les chiffres globaux)
        active_day = set()
        active_week = set()

        # Pour les stats, on a besoin d'un historique plus large, on refait une requête light si besoin
        # Ou on utilise les 50 derniers logs comme approximation pour l'instant
        for log in raw_logs:
            try:
                d = datetime.fromisoformat(log['created_at'].replace('Z', '+00:00'))
                active_week.add(log['user_id'])
                if d >= (now - timedelta(days=1)): active_day.add(log['user_id'])
            except:
                continue

        stats["dau"] = len(active_day)
        stats["wau"] = len(active_week)

        return stats

    except Exception as e:
        print(f"❌ Error Dashboard: {e}")
        return stats