'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useAnalytics() {
  const pathname = usePathname();
  const { user } = useUser();
  const startTime = useRef<number>(Date.now());

  // 1. Tracker les changements de page (Navigation)
  useEffect(() => {
    if (!user) return;

    const trackFeature = async () => {
      let feature = null;
      if (pathname.includes('/quiz')) feature = 'Quiz';
      else if (pathname.includes('/flashcards')) feature = 'Flashcards';
      else if (pathname.includes('/capture')) feature = 'Capture';
      else if (pathname.includes('/mastery')) feature = 'Parcours';
      else if (pathname === '/workspace') feature = 'Dashboard';

      if (feature) {
        // Utilise sendBeacon si dispo, sinon fetch
        const data = JSON.stringify({
          user_id: user.id,
          event_type: 'feature_use',
          event_data: { feature, path: pathname }
        });

        if (navigator.sendBeacon) {
            navigator.sendBeacon(`${API_URL}/api/analytics/track`, data);
        } else {
            fetch(`${API_URL}/api/analytics/track`, { method: 'POST', body: data, headers: {'Content-Type': 'application/json'}});
        }
      }
    };

    trackFeature();
  }, [pathname, user]);

  // 2. Tracker la durée de session (à la fermeture)
  useEffect(() => {
    if (!user) return;

    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);

      const data = JSON.stringify({
        user_id: user.id,
        event_type: 'session_end',
        event_data: { duration_seconds: duration }
      });

      if (navigator.sendBeacon) {
          navigator.sendBeacon(`${API_URL}/api/analytics/track`, data);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user]);
}