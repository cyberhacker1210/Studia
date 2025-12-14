import os
import json
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
# pip install pywebpush
from pywebpush import webpush, WebPushException
from .database import supabase

router = APIRouter()

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_CLAIMS = {
    "sub": os.getenv("VAPID_SUBJECT", "mailto:admin@studia.com")
}


class PushSubscription(BaseModel):
    user_id: str
    endpoint: str
    keys: dict


@router.post("/subscribe")
async def subscribe(sub: PushSubscription):
    try:
        supabase.table('push_subscriptions').upsert({
            "user_id": sub.user_id,
            "endpoint": sub.endpoint,
            "p256dh": sub.keys['p256dh'],
            "auth": sub.keys['auth']
        }, on_conflict="endpoint").execute()
        return {"status": "subscribed"}
    except Exception as e:
        print(f"❌ Sub Error: {e}")
        return {"status": "error"}


def send_push_notification(sub_info, message_body):
    try:
        if not VAPID_PRIVATE_KEY: return False
        webpush(
            subscription_info=sub_info,
            data=json.dumps(message_body),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        return True
    except WebPushException as ex:
        print(f"Push failed: {ex}")
        return False


@router.post("/cron/daily-reminder")
async def send_daily_reminders(background_tasks: BackgroundTasks):
    try:
        # On récupère tous les abonnés (en prod, filtrer par inactivité)
        subs_res = supabase.table('push_subscriptions').select('*').execute()

        count = 0
        for sub in subs_res.data:
            sub_info = {
                "endpoint": sub['endpoint'],
                "keys": {"p256dh": sub['p256dh'], "auth": sub['auth']}
            }
            payload = {
                "title": "🔥 Ta série est en danger !",
                "body": "Reviens vite faire un quiz pour garder ta flamme allumée.",
                "url": "/workspace"
            }
            background_tasks.add_task(send_push_notification, sub_info, payload)
            count += 1

        return {"status": "reminders_sent", "count": count}

    except Exception as e:
        return {"status": "error", "detail": str(e)}