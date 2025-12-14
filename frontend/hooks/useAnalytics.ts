'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export function useAnalytics() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const startTime = useRef<number>(Date.now());

  const sendEvent = (eventType: string, eventData: any) => {
      if (!user?.id) return;

      const payload = {
          user_id: user.id,
          event_type: eventType,
          event_data: eventData || {}
      };

      try {
          // ✅ ON APPELLE NOTRE PROXY LOCAL (Pas de CORS)
          const endpoint = '/api/proxy/track';

          if (navigator.sendBeacon) {
              const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
              navigator.sendBeacon(endpoint, blob);
          } else {
              fetch(endpoint, {
                  method: 'POST',
                  body: JSON.stringify(payload),
                  headers: {'Content-Type': 'application/json'},
                  keepalive: true
              }).catch(() => {});
          }
      } catch (e) {
          // Silence
      }
  };

  // ... (Reste des useEffects inchangés)
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