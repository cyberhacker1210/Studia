from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import traceback
import os
from supabase import create_client, Client

# On réinitialise le client ici pour éviter les imports circulaires avec main.py
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter()

# --- SÉCURITÉ (Liste blanche d'emails admin) ---
ADMIN_EMAILS = ["ton_email@gmail.com", "admin@studia.com"]  # Remplace par le tien !


class AnalyticsEvent(BaseModel):
    user_id: str
    event_type: str
    event_data: Dict[str, Any] = {}


@router.post("/track")
async def track_event(event: AnalyticsEvent):
    """Enregistre un événement frontend (ex: clic, login, fin de session)"""
    try:
        supabase.table('analytics_events').insert({
            "user_id": event.user_id,
            "event_type": event.event_type,
            "event_data": event.event_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        }).execute()
        return {"status": "ok"}
    except Exception as e:
        print(f"❌ Analytics Error: {e}")
        # On ne bloque pas le front pour une erreur de tracking
        return {"status": "error", "detail": str(e)}


@router.get("/dashboard")
async def get_admin_stats(user_email: Optional[str] = Header(None)):
    """Calcule toutes les stats pour le dashboard"""

    # Sécurité basique (décommente pour activer)
    # if user_email not in ADMIN_EMAILS:
    #     raise HTTPException(status_code=403, detail="Accès non autorisé")

    try:
        now = datetime.now(timezone.utc)
        one_day_ago = (now - timedelta(days=1)).isoformat()
        seven_days_ago = (now - timedelta(days=7)).isoformat()

        # 1. Total Utilisateurs
        users_res = supabase.table('users').select('id', count='exact').execute()
        total_users = users_res.count if users_res.count else 0

        # 2. Récupération des logs récents (Optimisation: faire des RPC SQL en prod pour scalabilité)
        # On limite à 1000 logs pour ne pas exploser la mémoire du serveur gratuit
        logs_res = supabase.table('analytics_events') \
            .select('*') \
            .gte('created_at', seven_days_ago) \
            .limit(1000) \
            .execute()

        logs = logs_res.data

        active_users_day = set()
        active_users_week = set()
        feature_counts = {}
        total_duration = 0
        session_count = 0

        # Calcul Python (plus simple à implémenter rapidement que des requêtes SQL complexes)
        for log in logs:
            try:
                log_date = datetime.fromisoformat(log['created_at'].replace('Z', '+00:00'))

                # DAU / WAU
                active_users_week.add(log['user_id'])

                # Vérif si c'est dans les dernières 24h
                if log_date >= (now - timedelta(days=1)):
                    active_users_day.add(log['user_id'])

                # Features les plus utilisées
                if log['event_type'] == 'feature_use':
                    feat = log['event_data'].get('feature', 'unknown')
                    feature_counts[feat] = feature_counts.get(feat, 0) + 1

                # Temps moyen (basé sur les événements 'session_end')
                if log['event_type'] == 'session_end':
                    duration = log['event_data'].get('duration_seconds', 0)
                    if 0 < duration < 14400:  # Exclure bugs > 4h
                        total_duration += duration
                        session_count += 1
            except Exception:
                continue  # Skip log mal formé

        # 3. Rétention (Simulation J+1 simplifiée)
        retention_d1 = "N/A"
        if len(active_users_week) > 0:
            # Formule approximative pour la démo : DAU / WAU * 100 (Proxy de la fréquence)
            retention_score = (len(active_users_day) / len(active_users_week)) * 100
            retention_d1 = f"{round(retention_score)}%"

        # Top Feature
        top_feature = max(feature_counts, key=feature_counts.get) if feature_counts else "Aucune"

        # Temps moyen
        avg_time = round(total_duration / session_count) if session_count > 0 else 0
        avg_time_str = f"{avg_time // 60}m {avg_time % 60}s"

        return {
            "total_users": total_users,
            "dau": len(active_users_day),
            "wau": len(active_users_week),
            "avg_session_time": avg_time_str,
            "top_feature": top_feature,
            "retention_j1": retention_d1,
            "retention_j7": "Calcul..."  # Nécessite historique plus long
        }

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))