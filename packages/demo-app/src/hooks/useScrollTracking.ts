'use client';

import { useEffect, useRef } from 'react';
import { trackEvent, getPageName } from '../amplitude';

export const useScrollTracking = (pageLoadTime?: number) => {
  const trackedDepths = useRef<Set<number>>(new Set());
  const milestones = [25, 50, 75, 100];

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercent = scrollableHeight > 0 
        ? Math.round((scrollTop / scrollableHeight) * 100)
        : 0;

      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !trackedDepths.current.has(milestone)) {
          trackedDepths.current.add(milestone);
          const timeSincePageLoad = pageLoadTime 
            ? Date.now() - pageLoadTime 
            : undefined;

          trackEvent('scroll_depth_reached', {
            scroll_depth: milestone,
            scroll_depth_percent: milestone,
            time_since_page_load: timeSincePageLoad,
            page_name: getPageName(),
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pageLoadTime]);

  return { trackedDepths: trackedDepths.current };
};
