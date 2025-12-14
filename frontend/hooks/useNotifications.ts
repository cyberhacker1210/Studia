'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications() {
  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && user) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, [user]);

  const subscribe = async () => {
    if (!user || !VAPID_PUBLIC_KEY) {
        alert("Clé VAPID manquante. Impossible de s'abonner.");
        return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Envoyer au backend
      await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          endpoint: sub.endpoint,
          keys: sub.toJSON().keys
        })
      });

      setIsSubscribed(true);
      alert("🔔 Notifications activées ! Vous recevrez un rappel si vous oubliez de réviser.");
    } catch (e) {
      console.error("Erreur abo push:", e);
      alert("Impossible d'activer les notifications (bloqué par le navigateur ?)");
    }
  };

  return { isSubscribed, subscribe };
}