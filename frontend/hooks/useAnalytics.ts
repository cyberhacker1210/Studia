'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useAnalytics() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const startTime = useRef<number>(Date.now());

  // 1. Tracker les changements de page
  useEffect(() => {
    if (!isLoaded || !user || !user.id) return;

    const trackFeature = async () => {
      let feature = null;
      if (pathname.includes('/quiz')) feature = 'Quiz';
      else if (pathname.includes('/flashcards')) feature = 'Flashcards';
      else if (pathname.includes('/capture')) feature = 'Capture';
      else if (pathname.includes('/mastery')) feature = 'Parcours';
      else if (pathname === '/workspace') feature = 'Dashboard';

      if (feature) {
        const payload = {
          user_id: user.id,
          event_type: 'feature_use',
          event_data: { feature, path: pathname }
        };

        // Envoi sécurisé sans bloquer l'UI
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(`${API_URL}/api/analytics/track`, blob);
        } else {
            // Mode "no-cors" pour éviter les erreurs bloquantes dans la console
            // (Note: on ne verra pas la réponse, mais ça envoie la requête)
            fetch(`${API_URL}/api/analytics/track`, {
                method: 'POST',
                body: JSON.stringify(payload),
                mode: 'no-cors',
                headers: {'Content-Type': 'text/plain'}
            }).catch(() => {});
        }
      }
    };

    trackFeature();
  }, [pathname, user, isLoaded]);

  // 2. Tracker la durée
  useEffect(() => {
    if (!isLoaded || !user || !user.id) return;

    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);

      const payload = {
        user_id: user.id,
        event_type: 'session_end',
        event_data: { duration_seconds: duration }
      };

      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (navigator.sendBeacon) {
          navigator.sendBeacon(`${API_URL}/api/analytics/track`, blob);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user, isLoaded]);
}