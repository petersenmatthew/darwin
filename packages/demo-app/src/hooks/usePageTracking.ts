'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, getPageName } from '../amplitude';

// Global tracking to prevent duplicates across component instances
const trackedPages = new Map<string, number>();
const abandonedPages = new Map<string, number>();
const TRACKING_WINDOW_MS = 1000; // Only track once per second per page

export const usePageTracking = () => {
  const pathname = usePathname();
  const pageLoadTime = useRef<number>(Date.now());
  const hasTrackedPageView = useRef<boolean>(false);
  const hasTrackedAbandonment = useRef<boolean>(false);
  const trackedPathname = useRef<string | null>(null);
  const abandonmentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentPathname = pathname || getPageName();
    const now = Date.now();
    
    // Reset tracking if pathname changed
    if (trackedPathname.current !== currentPathname) {
      hasTrackedPageView.current = false;
      hasTrackedAbandonment.current = false;
      trackedPathname.current = currentPathname;
      pageLoadTime.current = now;
      
      // Clear any existing abandonment timer
      if (abandonmentTimeoutRef.current) {
        clearTimeout(abandonmentTimeoutRef.current);
        abandonmentTimeoutRef.current = null;
      }
    }

    // Track page view only once per pathname change
    if (!hasTrackedPageView.current) {
      // Check if we've tracked this page recently (within tracking window)
      const lastTracked = trackedPages.get(currentPathname);
      if (!lastTracked || (now - lastTracked) > TRACKING_WINDOW_MS) {
        trackEvent('page_viewed', {
          page_name: currentPathname,
        });
        trackedPages.set(currentPathname, now);
        hasTrackedPageView.current = true;
        pageLoadTime.current = now;
        
        // Clean up old entries from the map (older than 5 minutes)
        trackedPages.forEach((timestamp, page) => {
          if (now - timestamp > 300000) {
            trackedPages.delete(page);
          }
        });
      }
    }

    // Track page refresh - debounced to prevent duplicate events
    let lastRefreshTrack = 0;
    const handleBeforeUnload = () => {
      const now = Date.now();
      // Prevent duplicate refresh events within 100ms
      if (now - lastRefreshTrack < 100) return;
      lastRefreshTrack = now;

      const timeOnPage = now - pageLoadTime.current;
      trackEvent('page_refresh', {
        page_name: pathname || getPageName(),
        time_on_page: timeOnPage,
      });
    };

    // Track page abandonment (after 30 seconds of inactivity)
    const resetAbandonmentTimer = () => {
      if (abandonmentTimeoutRef.current) {
        clearTimeout(abandonmentTimeoutRef.current);
        abandonmentTimeoutRef.current = null;
      }

      // Only set timer if we haven't already tracked abandonment for this page
      if (!hasTrackedAbandonment.current) {
        abandonmentTimeoutRef.current = setTimeout(() => {
          const currentPage = pathname || getPageName();
          const timeOnPage = Date.now() - pageLoadTime.current;
          const now = Date.now();
          
          // Check if we've already tracked abandonment for this page recently
          const lastAbandoned = abandonedPages.get(currentPage);
          if (!lastAbandoned || (now - lastAbandoned) > TRACKING_WINDOW_MS) {
            trackEvent('page_abandoned', {
              page_name: currentPage,
              time_on_page: timeOnPage,
            });
            abandonedPages.set(currentPage, now);
            hasTrackedAbandonment.current = true;
            
            // Clean up old entries from the map (older than 5 minutes)
            abandonedPages.forEach((timestamp, page) => {
              if (now - timestamp > 300000) {
                abandonedPages.delete(page);
              }
            });
          }
        }, 30000); // 30 seconds
      }
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
