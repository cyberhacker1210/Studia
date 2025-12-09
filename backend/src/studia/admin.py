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
    # 1. Vérification Auth
    if not x_admin_password or x_admin_password.strip() != ADMIN_PASSWORD:
        print(f"⛔️ Rejeté: '{x_admin_password}' != '{ADMIN_PASSWORD}'")
        raise HTTPException(status_code=403, detail="Mot de passe incorrect")

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    # Initialisation des valeurs par défaut (pour éviter le crash)
    stats = {
        "total_users": 0,
        "dau": 0,
        "wau": 0,
        "avg_session_time": "0m 0s",
        "top_feature": "Aucune",
        "retention_j1": "N/A",
        "retention_j7": "N/A"
    }

    try:
        now = datetime.now(timezone.utc)
        seven_days_ago = (now - timedelta(days=7)).isoformat()

        # 2. Récupération Utilisateurs (Peut échouer si table vide)
        try:
            users_res = supabase.table('users').select('id', count='exact').execute()
            stats["total_users"] = users_res.count if users_res.count else 0
        except Exception as e:
            print(f"⚠️ Erreur Users: {e}")

        # 3. Récupération Logs (Peut échouer si table vide)
        logs = []
        try:
            logs_res = supabase.table('analytics_events') \
                .select('*') \
                .gte('created_at', seven_days_ago) \
                .limit(1000) \
                .execute()
            logs = logs_res.data
        except Exception as e:
            print(f"⚠️ Erreur Logs: {e}")

        # 4. Calculs (Pure Python - Moins risqué mais on blinde quand même)
        if logs:
            active_users_day = set()
            active_users_week = set()
            feature_counts = {}
            total_duration = 0
            session_count = 0

            for log in logs:
                try:
                    # Gestion robuste des dates (formats variés)
                    created_at = log.get('created_at', '')
                    if created_at.endswith('Z'):
                        created_at = created_at[:-1] + '+00:00'

                    log_date = datetime.fromisoformat(created_at)

                    # WAU
                    active_users_week.add(log['user_id'])

                    # DAU
                    if log_date >= (now - timedelta(days=1)):
                        active_users_day.add(log['user_id'])

                    # Features
                    if log.get('event_type') == 'feature_use':
                        feat = log.get('event_data', {}).get('feature', 'unknown')
                        feature_counts[feat] = feature_counts.get(feat, 0) + 1

                    # Durée
                    if log.get('event_type') == 'session_end':
                        duration = log.get('event_data', {}).get('duration_seconds', 0)
                        if isinstance(duration, (int, float)) and 0 < duration < 14400:
                            total_duration += duration
                            session_count += 1
                except Exception as e:
                    # On ignore juste la ligne mal formée
                    continue

            # Mise à jour des stats
            stats["dau"] = len(active_users_day)
            stats["wau"] = len(active_users_week)

            if feature_counts:
                stats["top_feature"] = max(feature_counts, key=feature_counts.get)

            if session_count > 0:
                avg_time = round(total_duration / session_count)
                stats["avg_session_time"] = f"{avg_time // 60}m {avg_time % 60}s"

            if len(active_users_week) > 0:
                retention_val = (len(active_users_day) / len(active_users_week)) * 100
                stats["retention_j1"] = f"{round(retention_val)}%"

        return stats

    except Exception as e:
        # Erreur fatale (ne devrait pas arriver avec les try/except internes)
        print(f"❌ CRITICAL DASHBOARD ERROR: {traceback.format_exc()}")
        # On renvoie les stats partielles au lieu de planter
        return stats