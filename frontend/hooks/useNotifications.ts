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
  const [loading, setLoading] = useState(false); // Ajout état loading

  // Vérifier l'état au chargement
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
    if (!user) return alert("Vous devez être connecté.");
    if (!VAPID_PUBLIC_KEY) return alert("Erreur config : Clé VAPID manquante.");

    setLoading(true);

    try {
      // 1. Demander la permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setLoading(false);
        return alert("Permission refusée. Activez les notifications dans les paramètres du navigateur.");
      }

      // 2. Récupérer le SW
      const reg = await navigator.serviceWorker.ready;

      // 3. S'abonner au push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      console.log("✅ Push Subscription:", sub);

      // 4. Envoyer au backend
      const res = await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          endpoint: sub.endpoint,
          keys: sub.toJSON().keys
        })
      });

      if (res.ok) {
          setIsSubscribed(true);
          // Test local immédiat
          new Notification("🔔 Notifications activées !", {
              body: "Vous recevrez désormais des rappels pour maintenir votre série.",
              icon: "/icons/icon-192x192.png"
          });
      } else {
          throw new Error("Erreur serveur");
      }

    } catch (e: any) {
      console.error("Erreur Abonnement:", e);
      alert(`Erreur : ${e.message}`);
    } finally {
        setLoading(false);
    }
  };

  return { isSubscribed, subscribe, loading };
}