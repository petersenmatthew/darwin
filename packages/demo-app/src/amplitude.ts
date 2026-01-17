'use client';

import * as amplitude from '@amplitude/analytics-browser';

const AMPLITUDE_API_KEY = "a5083b95e11ada160a4775cadac7177d";

// Session and user management
let sessionId: string | null = null;
let userId: string | null = null;
let sessionStartTime: number | null = null;
let isAmplitudeInitialized = false;

export const initAmplitude = () => {
  if (typeof window === 'undefined') return;

  // Prevent duplicate initialization that could cause loops
  if (isAmplitudeInitialized) return;
  isAmplitudeInitialized = true;

  amplitude.init(AMPLITUDE_API_KEY, {
    fetchRemoteConfig: true,
    defaultTracking: {
      sessions: true,
      pageViews: true,
      formInteractions: true,
      fileDownloads: true,
    },
  });

  // Initialize session
  initializeSession();
};

let isSessionInitialized = false;

export const initializeSession = () => {
  if (typeof window === 'undefined') return;

  // Prevent duplicate session initialization
  if (isSessionInitialized) return;
  isSessionInitialized = true;

  // Get or create session ID
  sessionId = sessionStorage.getItem('analytics_session_id') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('analytics_session_id', sessionId);

  // Get or create user ID
  userId = localStorage.getItem('analytics_user_id') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('analytics_user_id', userId);

  // Track session start time
  sessionStartTime = Date.now();
};

export const getSessionId = (): string => {
  if (!sessionId) {
    initializeSession();
  }
  return sessionId || 'unknown';
};

export const getUserId = (): string => {
  if (!userId) {
    initializeSession();
  }
  return userId || 'unknown';
};

export const getPageName = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  return window.location.pathname || 'unknown';
};

export interface EventData {
  event: string;
  [key: string]: any;
}

export const trackEvent = async (
  eventName: string,
  eventProperties?: Record<string, any>
) => {
  if (typeof window === 'undefined') return;

  // Ensure session is initialized
  if (!sessionId) {
    initializeSession();
  }

  // Get current page name
  const pageName = getPageName();

  // Create event data with required properties
  const eventData: EventData = {
    event: eventName,
    session_id: getSessionId(),
    user_id: getUserId(),
    timestamp: Date.now(),
    page_name: pageName,
    ...eventProperties,
  };

  // Send to Amplitude
  amplitude.track(eventName, eventData);

  // Also send to local JSON file via API
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      console.error('Failed to write event to JSON file:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Failed to write event to JSON file:', error);
  }
};

export const trackEventWithTiming = async (
  eventName: string,
  eventProperties?: Record<string, any>,
  pageLoadTime?: number
) => {
  const props = {
    ...eventProperties,
  };

  if (pageLoadTime !== undefined) {
    props.time_since_page_load = Date.now() - pageLoadTime;
  }

  await trackEvent(eventName, props);
};

