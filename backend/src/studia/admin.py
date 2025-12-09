from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import traceback
import os
from .database import supabase

router = APIRouter()

# ✅ SÉCURITÉ : Mot de passe simple
# Défaut "studia123" si tu oublies de le mettre dans Render
ADMIN_PASSWORD = os.getenv("ADMIN_SECRET", "studia123")


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
    # 🔒 VÉRIFICATION DU MOT DE PASSE
    if x_admin_password != ADMIN_PASSWORD:
        print(f"⛔️ Mot de passe incorrect : {x_admin_password}")
        raise HTTPException(status_code=403, detail="Mot de passe incorrect")

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    try:
        now = datetime.now(timezone.utc)
        seven_days_ago = (now - timedelta(days=7)).isoformat()

        users_res = supabase.table('users').select('id', count='exact').execute()
        total_users = users_res.count if users_res.count else 0

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

        for log in logs:
            try:
                log_date = datetime.fromisoformat(log['created_at'].replace('Z', '+00:00'))
                active_users_week.add(log['user_id'])
                if log_date >= (now - timedelta(days=1)):
                    active_users_day.add(log['user_id'])

                if log['event_type'] == 'feature_use':
                    feat = log['event_data'].get('feature', 'unknown')
                    feature_counts[feat] = feature_counts.get(feat, 0) + 1

                if log['event_type'] == 'session_end':
                    duration = log['event_data'].get('duration_seconds', 0)
                    if 0 < duration < 14400:
                        total_duration += duration
                        session_count += 1
            except:
                continue

        retention_d1 = "N/A"
        if len(active_users_week) > 0:
            retention_score = (len(active_users_day) / len(active_users_week)) * 100
            retention_d1 = f"{round(retention_score)}%"

        top_feature = max(feature_counts, key=feature_counts.get) if feature_counts else "Aucune"
        avg_time = round(total_duration / session_count) if session_count > 0 else 0
        avg_time_str = f"{avg_time // 60}m {avg_time % 60}s"

        return {
            "total_users": total_users,
            "dau": len(active_users_day),
            "wau": len(active_users_week),
            "avg_session_time": avg_time_str,
            "top_feature": top_feature,
            "retention_j1": retention_d1,
            "retention_j7": "Calcul..."
        }

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))