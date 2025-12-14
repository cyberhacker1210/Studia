'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useAnalytics() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const startTime = useRef<number>(Date.now());

  // Helper pour envoyer les données proprement
  const sendEvent = (eventType: string, eventData: any) => {
      // 🛡️ SÉCURITÉ : Si pas d'ID, on n'envoie rien
      if (!user?.id) return;

      const payload = {
          user_id: user.id,
          event_type: eventType,
          // 🛡️ SÉCURITÉ : On s'assure que event_data est un objet valide
          event_data: eventData || {}
      };

      try {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

          if (navigator.sendBeacon) {
              navigator.sendBeacon(`${API_URL}/api/analytics/track`, blob);
          } else {
              fetch(`${API_URL}/api/analytics/track`, {
                  method: 'POST',
                  body: JSON.stringify(payload),
                  headers: {'Content-Type': 'application/json'},
                  keepalive: true
              }).catch(() => {});
          }
      } catch (e) {
          console.error("Analytics Error", e);
      }
  };

  // 1. Tracker la navigation
  useEffect(() => {
    if (!isLoaded || !user) return;

    let feature = null;
    if (pathname.includes('/quiz')) feature = 'Quiz';
    else if (pathname.includes('/flashcards')) feature = 'Flashcards';
    else if (pathname.includes('/capture')) feature = 'Capture';
    else if (pathname.includes('/mastery')) feature = 'Parcours';
    else if (pathname === '/workspace') feature = 'Dashboard';

    if (feature) {
      sendEvent('feature_use', { feature, path: pathname });
    }
  }, [pathname, isLoaded, user?.id]); // On dépend de user.id, pas de l'objet user entier

  // 2. Tracker la fin de session
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