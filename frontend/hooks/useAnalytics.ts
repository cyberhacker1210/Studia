'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 🛑 EMAILS À EXCLURE DES ANALYTICS
const EXCLUDED_EMAILS = [
    "ton_email@gmail.com",
    "admin@studia.com",
    "leolintello21@gmail.com" // Ajoute le tien ici
];

export function useAnalytics() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const startTime = useRef<number>(Date.now());

  const sendEvent = (eventType: string, eventData: any) => {
      if (!user?.id) return;

      const userEmail = user.primaryEmailAddress?.emailAddress;

      // 🛑 VÉRIFICATION D'EXCLUSION
      if (userEmail && EXCLUDED_EMAILS.includes(userEmail)) {
          console.log("🚫 Analytics ignorés (Admin détecté)");
          return;
      }

      const payload = {
          user_id: user.id,
          event_type: eventType,
          event_data: {
              ...eventData,
              user_email: userEmail,
              user_name: user.fullName || user.firstName || 'Anonyme'
          }
      };

      try {
          if (navigator.sendBeacon) {
              const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
              navigator.sendBeacon(`${API_URL}/api/analytics/track`, blob);
          } else {
              fetch(`${API_URL}/api/analytics/track`, {
                  method: 'POST',
                  body: JSON.stringify(payload),
                  headers: {'Content-Type': 'application/json'},
                  keepalive: true,
                  mode: 'cors',
                  credentials: 'omit'
              }).catch(() => {});
          }
      } catch (e) {
          // Silence
      }
  };

  // ... (Le reste des useEffects reste identique)
  useEffect(() => {
    if (!isLoaded || !user) return;
    let feature = null;
    if (pathname.includes('/quiz')) feature = 'Quiz';
    else if (pathname.includes('/flashcards')) feature = 'Flashcards';
    else if (pathname.includes('/capture')) feature = 'Capture';
    else if (pathname.includes('/mastery')) feature = 'Parcours';
    else if (pathname === '/workspace') feature = 'Dashboard';

    if (feature) sendEvent('feature_use', { feature, path: pathname });
  }, [pathname, isLoaded, user?.id]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      sendEvent('session_end', { duration_seconds: duration });
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [isLoaded, user?.id]);
}