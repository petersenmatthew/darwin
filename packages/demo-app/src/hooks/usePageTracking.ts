'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, getPageName } from '../amplitude';

export const usePageTracking = () => {
  const pathname = usePathname();
  const pageLoadTime = useRef<number>(Date.now());
  const hasTrackedPageView = useRef<boolean>(false);
  const abandonmentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Track page view
    if (!hasTrackedPageView.current) {
      trackEvent('page_viewed', {
        page_name: pathname || getPageName(),
      });
      hasTrackedPageView.current = true;
      pageLoadTime.current = Date.now();
    }

    // Track page refresh
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - pageLoadTime.current;
      trackEvent('page_refresh', {
        page_name: pathname || getPageName(),
        time_on_page: timeOnPage,
      });
    };

    // Track page abandonment (after 30 seconds of inactivity)
    const resetAbandonmentTimer = () => {
      if (abandonmentTimeoutRef.current) {
        clearTimeout(abandonmentTimeoutRef.current);
      }

      abandonmentTimeoutRef.current = setTimeout(() => {
        const timeOnPage = Date.now() - pageLoadTime.current;
        trackEvent('page_abandoned', {
          page_name: pathname || getPageName(),
          time_on_page: timeOnPage,
        });
      }, 30000); // 30 seconds
    };

    // Reset abandonment timer on user activity
    const handleActivity = () => {
      resetAbandonmentTimer();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    resetAbandonmentTimer();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (abandonmentTimeoutRef.current) {
        clearTimeout(abandonmentTimeoutRef.current);
      }
    };
  }, [pathname]);

  return { pageLoadTime: pageLoadTime.current };
};
