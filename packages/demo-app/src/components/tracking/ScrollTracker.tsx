'use client';

import { useEffect } from 'react';
import { useScrollTracking } from '../../hooks/useScrollTracking';
import { usePageTracking } from '../../hooks/usePageTracking';

export default function ScrollTracker() {
  const { pageLoadTime } = usePageTracking();
  useScrollTracking(pageLoadTime);

  return null; // This component doesn't render anything
}
