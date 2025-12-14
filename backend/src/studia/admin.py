from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import traceback
import os
from .database import supabase

router = APIRouter()

# --- CONFIG ---
raw_env = os.getenv("ADMIN_EMAILS") or os.getenv("ADMIN_EMAIL") or ""
raw_env = raw_env.replace('"', '').replace("'", "")
ADMIN_EMAILS = [email.strip().lower() for email in raw_env.split(",") if email.strip()]
ADMIN_PASSWORD = os.getenv("ADMIN_SECRET", "studia123").strip()

print(f"🔐 Admin Password Configured: {ADMIN_PASSWORD[:3]}***")


# --- ENDPOINTS ---

@router.post("/track")
async def track_event(request: Request):
    """
    Endpoint Analytics Robuste (Accepte Request brute pour éviter 422 Pydantic)
    """
    try:
        # 1. Lire le JSON brut
        body = await request.json()

        # 2. Validation manuelle simple
        user_id = body.get('user_id')
        event_type = body.get('event_type')
        event_data = body.get('event_data', {})

        if not user_id or not event_type:
            # On ignore silencieusement les requêtes mal formées
            return {"status": "ignored", "reason": "missing_fields"}

        # 3. Traitement spécial Premium
        if event_type == 'premium_interest':
            email = event_data.get('email')
            if email and supabase:
                supabase.table('premium_interests').upsert({
                    "user_id": user_id,
                    "email": email,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }, on_conflict="user_id").execute()
                return {"status": "ok", "saved": "premium"}

        # 4. Insert Analytics standard
        if supabase:
            supabase.table('analytics_events').insert({
                "user_id": user_id,
                "event_type": event_type,
                "event_data": event_data,
                "created_at": datetime.now(timezone.utc).isoformat()
            }).execute()

        return {"status": "ok"}

    except Exception as e:
        print(f"❌ Analytics Error: {e}")
        # On renvoie toujours 200 OK au client pour ne pas faire d'erreur console rouge
        # L'analytique ne doit jamais casser l'expérience utilisateur
        return {"status": "error", "detail": str(e)}


@router.get("/dashboard")
async def get_admin_stats(x_admin_password: Optional[str] = Header(None)):
    # 1. Auth
    if not x_admin_password or x_admin_password.strip() != ADMIN_PASSWORD:
        print(f"⛔️ Rejeté: '{x_admin_password}' != '{ADMIN_PASSWORD}'")
        raise HTTPException(status_code=403, detail="Mot de passe incorrect")

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    # 2. Stats avec Fallback (ne plante jamais)
    stats = {
        "total_users": 0, "dau": 0, "wau": 0, "avg_session_time": "0m 0s",
        "top_feature": "-", "retention_j1": "-", "recent_activity": []
    }

    try:
        now = datetime.now(timezone.utc)
        seven_days_ago = (now - timedelta(days=7)).isoformat()

        # Users
        try:
            users_res = supabase.table('users').select('id, email', count='exact').execute()
            stats["total_users"] = users_res.count if users_res.count else 0
            user_map = {u['id']: u.get('email', 'Inconnu') for u in users_res.data}
        except:
            user_map = {}

        # Logs
        logs = []
        try:
            logs_res = supabase.table('analytics_events') \
                .select('*') \
                .gte('created_at', seven_days_ago) \
                .order('created_at', desc=True) \
                .limit(1000) \
                .execute()
            logs = logs_res.data
        except:
            pass

        if logs:
            active_day = set()
            active_week = set()
            feature_counts = {}
            total_duration = 0
            session_count = 0
            activity_feed = []

            for i, log in enumerate(logs):
                try:
                    # Parsing date robuste
                    ts = log.get('created_at', '')
                    if ts.endswith('Z'): ts = ts[:-1] + '+00:00'
                    log_date = datetime.fromisoformat(ts)

                    uid = log.get('user_id')
                    etype = log.get('event_type')
                    edata = log.get('event_data', {}) or {}

                    # Stats Globales
                    active_week.add(uid)
                    if log_date >= (now - timedelta(days=1)): active_day.add(uid)

                    if etype == 'feature_use':
                        feat = edata.get('feature', 'unknown')
                        feature_counts[feat] = feature_counts.get(feat, 0) + 1

                    if etype == 'session_end':
                        dur = edata.get('duration_seconds', 0)
                        if isinstance(dur, (int, float)) and 0 < dur < 14400:
                            total_duration += dur
                            session_count += 1

                    # Feed (50 derniers)
                    if i < 50:
                        email = user_map.get(uid, 'Utilisateur')
                        details = ""
                        if etype == 'feature_use':
                            details = edata.get('feature', '')
                        elif etype == 'session_end':
                            details = f"{edata.get('duration_seconds')}s"

                        activity_feed.append({
                            "id": log.get('id'),
                            "time": ts,
                            "user": email,
                            "action": etype,
                            "details": details
                        })

                except Exception:
                    continue

            stats["dau"] = len(active_day)
            stats["wau"] = len(active_week)
            stats["recent_activity"] = activity_feed

            if feature_counts:
                stats["top_feature"] = max(feature_counts, key=feature_counts.get)

            if session_count > 0:
                avg = round(total_duration / session_count)
                stats["avg_session_time"] = f"{avg // 60}m {avg % 60}s"

            if len(active_week) > 0:
                ret = (len(active_day) / len(active_week)) * 100
                stats["retention_j1"] = f"{round(ret)}%"

        return stats

    except Exception as e:
        print(f"❌ CRITICAL DASHBOARD ERROR: {traceback.format_exc()}")
        return stats