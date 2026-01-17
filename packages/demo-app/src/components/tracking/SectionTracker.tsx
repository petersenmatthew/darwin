'use client';

import { useEffect, useRef } from 'react';
import { trackEvent, getPageName } from '../../amplitude';
import { usePageTracking } from '../../hooks/usePageTracking';

interface SectionTrackerProps {
  sectionId: string;
  sectionName?: string;
  children: React.ReactNode;
  className?: string;
}

export default function SectionTracker({ 
  sectionId, 
  sectionName, 
  children, 
  className 
}: SectionTrackerProps) {
  const { pageLoadTime } = usePageTracking();
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasTracked = useRef<boolean>(false);

  useEffect(() => {
    if (!sectionRef.current || hasTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true;
            const timeSincePageLoad = pageLoadTime 
              ? Date.now() - pageLoadTime 
              : undefined;

            trackEvent('section_viewed', {
              section_id: sectionId,
              section_name: sectionName || sectionId,
              time_since_page_load: timeSincePageLoad,
              page_name: getPageName(),
            });

            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [sectionId, sectionName, pageLoadTime]);

  return (
    <div ref={sectionRef} id={sectionId} className={className}>
      {children}
    </div>
  );
}
