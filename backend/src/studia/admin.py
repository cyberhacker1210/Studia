from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import traceback
import os
from .database import supabase

router = APIRouter()

# --- DEBUG & CHARGEMENT ROBUSTE ---
# 1. On cherche avec "S" et sans "S"
raw_env = os.getenv("ADMIN_EMAILS") or os.getenv("ADMIN_EMAIL") or ""

# 2. On nettoie (enlève les guillemets si l'utilisateur en a mis dans Render)
raw_env = raw_env.replace('"', '').replace("'", "")

# 3. On transforme en liste
ADMIN_EMAILS = [email.strip().lower() for email in raw_env.split(",") if email.strip()]

# 4. ON AFFICHE CE QUE LE SERVEUR VOIT (Regarde tes logs après déploiement)
print("=" * 30)
print(f"🔍 DEBUG ANALYTICS CONFIG")
print(f"➡️  Valeur brute reçue : '{raw_env}'")
print(f"➡️  Liste finale Admins : {ADMIN_EMAILS}")
print("=" * 30)


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
    # Normalisation
    clean_email = user_email.strip().lower() if user_email else ""

    print(f"👤 Tentative: '{clean_email}'")

    # Sécurité
    if clean_email not in ADMIN_EMAILS:
        print(f"⛔️ REJETÉ. L'email '{clean_email}' n'est pas dans {ADMIN_EMAILS}")
        raise HTTPException(status_code=403, detail="Accès non autorisé")

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
            except Exception:
                continue

        retention_d1 = "N/A"
        if len(active_users_week) > 0:
            retention_score =