from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import traceback
# ✅ IMPORT CENTRALISÉ
from .database import supabase

router = APIRouter()

ADMIN_EMAILS = ["ton_email@gmail.com", "admin@studia.com"]


class AnalyticsEvent(BaseModel):
    user_id: str
    event_type: str
    event_data: Dict[str, Any] = {}


@router.post("/track")
async def track_event(event: AnalyticsEvent):
    if not supabase:
        return {"status": "error", "detail": "Database not configured"}

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
        return {"status": "error", "detail": str(e)}


@router.get("/dashboard")
async def get_admin_stats(user_email: Optional[str] = Header(None)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    try:
        now = datetime.now(timezone.utc)
        one_day_ago = (now - timedelta(days=1)).isoformat()
        seven_days_ago = (now - timedelta(days=7)).isoformat()

        # 1. Total Utilisateurs
        users_res = supabase.table('users').select('id', count='exact').execute()
        total_users = users_res.count if users_res.count else 0

        # 2. Logs récents
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
            except Exception:
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