'use client';

import { useRef, useState } from 'react';
import { trackEvent, getPageName } from '../amplitude';

interface FormTrackingOptions {
  formId: string;
  formName?: string;
  pageLoadTime?: number;
}

export const useFormTracking = (options: FormTrackingOptions) => {
  const { formId, formName, pageLoadTime } = options;
  const formStartTime = useRef<number | null>(null);
  const hasTrackedStart = useRef<boolean>(false);
  const focusedFields = useRef<Set<string>>(new Set());
  const completedFields = useRef<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const trackFormStart = () => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      formStartTime.current = Date.now();
      const timeSincePageLoad = pageLoadTime 
        ? Date.now() - pageLoadTime 
        : undefined;

      trackEvent('form_started', {
        form_id: formId,
        form_name: formName || formId,
        time_since_page_load: timeSincePageLoad,
        page_name: getPageName(),
      });
    }
  };

  const trackFieldFocus = (fieldName: string, fieldType?: string) => {
    trackFormStart();
    
    if (!focusedFields.current.has(fieldName)) {
      focusedFields.current.add(fieldName);
      const timeSincePageLoad = pageLoadTime 
        ? Date.now() - pageLoadTime 
        : undefined;

      trackEvent('form_field_focused', {
        form_id: formId,
        field_name: fieldName,
        field_type: fieldType || 'text',
        time_since_page_load: timeSincePageLoad,
        page_name: getPageName(),
      });
    }
  };

  const trackFieldCompleted = (fieldName: string, fieldType?: string, hasValue: boolean = true) => {
    if (!completedFields.current.has(fieldName)) {
      completedFields.current.add(fieldName);
      const timeSincePageLoad = pageLoadTime 
        ? Date.now() - pageLoadTime 
        : undefined;

      trackEvent('form_field_completed', {
        form_id: formId,
        field_name: fieldName,
        field_type: fieldType || 'text',
        has_value: hasValue,
        time_since_page_load: timeSincePageLoad,
        page_name: getPageName(),
      });
    }
  };

  const trackFieldSkipped = (fieldName: string, fieldType?: string) => {
    if (!completedFields.current.has(fieldName) && focusedFields.current.has(fieldName)) {
      const timeSincePageLoad = pageLoadTime 
        ? Date.now() - pageLoadTime 
        : undefined;

      trackEvent('form_field_skipped', {
        form_id: formId,
        field_name: fieldName,
        field_type: fieldType || 'text',
        has_value: false,
        time_since_page_load: timeSincePageLoad,
        page_name: getPageName(),
      });
    }
  };

  const trackFormError = (fieldName: string, errorMessage: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
    const timeSincePageLoad = pageLoadTime 
      ? Date.now() - pageLoadTime 
      : undefined;

    trackEvent('form_error', {
      form_id: formId,
      field_name: fieldName,
      error_message: errorMessage,
      time_since_page_load: timeSincePageLoad,
      page_name: getPageName(),
    });
  };

  const trackFormSubmitted = () => {
    const timeSincePageLoad = pageLoadTime 
      ? Date.now() - pageLoadTime 
      : undefined;
    const timeToComplete = formStartTime.current 
      ? Date.now() - formStartTime.current 
      : undefined;

    trackEvent('form_submitted', {
      form_id: formId,
      form_name: formName || formId,
      time_since_page_load: timeSincePageLoad,
      time_to_complete: timeToComplete,
      page_name: getPageName(),
    });
  };

  const trackFormAbandoned = (fieldsCompleted: number, fieldsTotal: number) => {
    const timeOnForm = formStartTime.current 
      ? Date.now() - formStartTime.current 
      : undefined;

    trackEvent('form_abandoned', {
      form_id: formId,
      form_name: formName || formId,
      fields_completed: fieldsCompleted,
      fields_total: fieldsTotal,
      time_on_form: timeOnForm,
      page_name: getPageName(),
    });
  };

  return {
    trackFormStart,
    trackFieldFocus,
    trackFieldCompleted,
    trackFieldSkipped,
    trackFormError,
    trackFormSubmitted,
    trackFormAbandoned,
    errors,
  };
};
