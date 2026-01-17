'use client';

import { useRef } from 'react';
import { trackEvent, getPageName } from '../amplitude';

interface ElementTrackingOptions {
  elementId: string;
  elementType?: string;
  pageLoadTime?: number;
}

export const useElementTracking = (options: ElementTrackingOptions) => {
  const { elementId, elementType, pageLoadTime } = options;
  const hoveredRef = useRef<boolean>(false);

  const trackHover = () => {
    if (!hoveredRef.current) {
      hoveredRef.current = true;
      const timeSincePageLoad = pageLoadTime 
        ? Date.now() - pageLoadTime 
        : undefined;

      trackEvent('element_hovered', {
        element_id: elementId,
        element_type: elementType || 'element',
        time_since_page_load: timeSincePageLoad,
        page_name: getPageName(),
      });
    }
  };

  const trackButtonClick = (buttonText?: string, additionalProps?: Record<string, any>) => {
    const timeSincePageLoad = pageLoadTime 
      ? Date.now() - pageLoadTime 
      : undefined;

    trackEvent('button_clicked', {
      button_id: elementId,
      button_text: buttonText || elementId,
      time_since_page_load: timeSincePageLoad,
      page_name: getPageName(),
      ...additionalProps,
    });
  };

  return {
    trackHover,
    trackButtonClick,
  };
};
