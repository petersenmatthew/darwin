'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, getPageName } from '../amplitude';

export const useNavigationTracking = (pageLoadTime?: number) => {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    // Track back button clicks
    const handlePopState = () => {
      const timeSincePageLoad = pageLoadTime 
        ? Date.now() - pageLoadTime 
        : undefined;

      trackEvent('back_button_clicked', {
        page_name: pathname || getPageName(),
        previous_page: previousPathname.current || 'unknown',
        time_since_page_load: timeSincePageLoad,
      });
    };

    window.addEventListener('popstate', handlePopState);

    // Update previous pathname
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
    }

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
