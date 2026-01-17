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
  const fieldChangeTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
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
    
    // Track focus every time (allow multiple focus events)
    const timeSincePageLoad = pageLoadTime 
      ? Date.now() - pageLoadTime 
      : undefined;

    const eventData = {
      form_id: formId,
      field_name: fieldName,
      field_type: fieldType || 'text',
      time_since_page_load: timeSincePageLoad,
      page_name: getPageName(),
    };

    // Track the event
    trackEvent('form_field_focused', eventData);

    // Mark field as focused (for tracking completion/skipped)
    focusedFields.current.add(fieldName);
  };

  const trackFieldUnfocus = (fieldName: string, fieldType?: string, hasValue?: boolean) => {
    const timeSincePageLoad = pageLoadTime 
      ? Date.now() - pageLoadTime 
      : undefined;

    trackEvent('form_field_unfocused', {
      form_id: formId,
      field_name: fieldName,
      field_type: fieldType || 'text',
      has_value: hasValue !== undefined ? hasValue : false,
      time_since_page_load: timeSincePageLoad,
      page_name: getPageName(),
    });
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

  const trackFieldChanged = (fieldName: string, fieldType?: string, value?: string) => {
    trackFormStart();
    
    // Clear existing timeout for this field
    const existingTimeout = fieldChangeTimeouts.current.get(fieldName);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Debounce the change event (track after 500ms of no changes)
    const timeout = setTimeout(() => {
      const timeSincePageLoad = pageLoadTime 
        ? Date.now() - pageLoadTime 
        : undefined;

      trackEvent('form_field_changed', {
        form_id: formId,
        field_name: fieldName,
        field_type: fieldType || 'text',
        has_value: value !== undefined && value.trim() !== '',
        value_length: value?.length || 0,
        time_since_page_load: timeSincePageLoad,
        page_name: getPageName(),
      });

      fieldChangeTimeouts.current.delete(fieldName);
    }, 500); // 500ms debounce

    fieldChangeTimeouts.current.set(fieldName, timeout);
  };

  return {
    trackFormStart,
    trackFieldFocus,
    trackFieldUnfocus,
    trackFieldChanged,
    trackFieldCompleted,
    trackFieldSkipped,
    trackFormError,
    trackFormSubmitted,
    trackFormAbandoned,
    errors,
  };
};
