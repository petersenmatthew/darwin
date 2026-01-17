'use client';

import * as amplitude from '@amplitude/analytics-browser';

const AMPLITUDE_API_KEY = "a5083b95e11ada160a4775cadac7177d";

export const initAmplitude = () => {
  if (typeof window === 'undefined') return;

  amplitude.init(AMPLITUDE_API_KEY, {
    defaultTracking: {
      sessions: true,
      pageViews: true,
      formInteractions: true,
      fileDownloads: true,
    },
  });
};

export const trackEvent = (
  eventName: string,
  eventProperties?: Record<string, any>
) => {
  amplitude.track(eventName, eventProperties);
};

