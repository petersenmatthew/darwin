'use client';

import { useEffect, useRef } from 'react';
import { trackEvent, initializeSession, getSessionId, getUserId, getPageName } from '../amplitude';

export const useSessionTracking = () => {
  const sessionStartTime = useRef<number | null>(null);
  const pagesViewed = useRef<number>(0);
  const hasTrackedStart = useRef<boolean>(false);

  useEffect(() => {
    // Initialize session if not already done
    if (!hasTrackedStart.current) {
      initializeSession();
      sessionStartTime.current = Date.now();
      pagesViewed.current = 1;

      // Track session started
      trackEvent('session_started', {
        page_name: getPageName(),
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      });

      hasTrackedStart.current = true;
    } else {
      pagesViewed.current += 1;
    }

    // Track session ended on page unload
    const handleBeforeUnload = () => {
      const sessionDuration = sessionStartTime.current 
        ? Date.now() - sessionStartTime.current 
        : undefined;

      trackEvent('session_ended', {
        page_name: getPageName(),
        session_duration: sessionDuration,
        pages_viewed: pagesViewed.current,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    sessionId: getSessionId(),
    userId: getUserId(),
    sessionStartTime: sessionStartTime.current,
  };
};
