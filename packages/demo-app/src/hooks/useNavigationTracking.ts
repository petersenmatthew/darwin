'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, getPageName } from '../amplitude';

// Global navigation history to track page navigation
const navigationHistory: string[] = [];
const lastBackButtonTrack = new Map<string, number>();
const TRACKING_WINDOW_MS = 1000; // Only track once per second

export const useNavigationTracking = (pageLoadTime?: number) => {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const currentPathnameRef = useRef<string | null>(null);
  const isNavigatingBack = useRef<boolean>(false);

  useEffect(() => {
    const currentPathname = pathname || getPageName();
    const now = Date.now();

    // Track back button clicks via popstate event
    const handlePopState = () => {
      // Mark that we're navigating back
      isNavigatingBack.current = true;
      
      // Capture the page we're currently on (before pathname updates)
      const pageWeAreLeaving = currentPathnameRef.current || currentPathname;
      
      // The page we're navigating TO is in window.location (updated immediately by browser)
      const pageWeAreGoingTo = typeof window !== 'undefined' 
        ? window.location.pathname 
        : currentPathname;

      // Only track if we haven't tracked this back navigation recently
      const trackingKey = `${pageWeAreLeaving}_${pageWeAreGoingTo}`;
      const lastTracked = lastBackButtonTrack.get(trackingKey);
      
      if (!lastTracked || (now - lastTracked) > TRACKING_WINDOW_MS) {
        const timeSincePageLoad = pageLoadTime 
          ? Date.now() - pageLoadTime 
          : undefined;

        trackEvent('back_button_clicked', {
          page_name: pageWeAreLeaving, // The page we're leaving FROM
          previous_page: pageWeAreGoingTo, // The page we're navigating back TO
          time_since_page_load: timeSincePageLoad,
        });

        lastBackButtonTrack.set(trackingKey, now);
        
        // Clean up old tracking entries
        lastBackButtonTrack.forEach((timestamp, key) => {
          if (now - timestamp > 300000) { // 5 minutes
            lastBackButtonTrack.delete(key);
          }
        });
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Update navigation history when pathname changes
    if (previousPathname.current !== null && previousPathname.current !== currentPathname) {
      if (isNavigatingBack.current) {
        // This is a back navigation - don't add to history, just reset flag
        isNavigatingBack.current = false;
      } else {
        // This is a forward navigation (via link click)
        // Add the previous page to history stack
        if (navigationHistory.length === 0 || navigationHistory[navigationHistory.length - 1] !== previousPathname.current) {
          navigationHistory.push(previousPathname.current);
        }
      }
    }

    // Update refs for next navigation
    previousPathname.current = currentPathname;
    currentPathnameRef.current = currentPathname;

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, pageLoadTime]);

  const trackNavigationClick = (href: string, linkText?: string) => {
    const timeSincePageLoad = pageLoadTime 
      ? Date.now() - pageLoadTime 
      : undefined;

    trackEvent('navigation_clicked', {
      link_href: href,
      link_text: linkText || href,
      time_since_page_load: timeSincePageLoad,
      page_name: getPageName(),
    });
  };

  return { trackNavigationClick };
};
