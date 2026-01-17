'use client';

import { useEffect, useRef } from 'react';
import { trackEvent, getPageName } from '../amplitude';

export const useScrollTracking = (pageLoadTime?: number) => {
  const lastScrollTop = useRef<number>(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercent = scrollableHeight > 0 
        ? Math.round((scrollTop / scrollableHeight) * 100)
        : 0;

      // Determine scroll direction
      const scrollDirection = scrollTop > lastScrollTop.current ? 'down' : 'up';
      lastScrollTop.current = scrollTop;

      // Clear any pending timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Track scroll event when user stops scrolling (after 300ms of no scroll)
      scrollTimeout.current = setTimeout(() => {
        const timeSincePageLoad = pageLoadTime 
          ? Date.now() - pageLoadTime 
          : undefined;

        trackEvent('scroll', {
          scroll_direction: scrollDirection,
          scroll_position: scrollTop,
          scroll_percent: scrollPercent,
          time_since_page_load: timeSincePageLoad,
          page_name: getPageName(),
        });
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [pageLoadTime]);
};
