'use client';

import { ReactNode, FormEvent, useRef } from 'react';
import { useFormTracking } from '../../hooks/useFormTracking';
import { usePageTracking } from '../../hooks/usePageTracking';

interface TrackedFormProps {
  id: string;
  name?: string;
  children: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
  [key: string]: any;
}

export default function TrackedForm({ 
  id, 
  name, 
  children, 
  onSubmit, 
  className,
  ...props 
}: TrackedFormProps) {
  const { pageLoadTime } = usePageTracking();
  const formRef = useRef<HTMLFormElement>(null);
  
  const {
    trackFieldFocus,
    trackFieldUnfocus,
    trackFieldCompleted,
    trackFieldSkipped,
    trackFormError,
    trackFormSubmitted,
  } = useFormTracking({
    formId: id,
    formName: name || id,
    pageLoadTime,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackFormSubmitted();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  // Enhance form fields with tracking
  const enhanceChildren = (children: ReactNode): ReactNode => {
    if (typeof children === 'string' || typeof children === 'number') {
      return children;
    }

    if (Array.isArray(children)) {
      return children.map((child, index) => (
        <div key={index}>{enhanceChildren(child)}</div>
      ));
    }

    if (children && typeof children === 'object' && 'props' in children) {
      const child = children as any;
      const { type, props: childProps } = child;

      if (type === 'input' || type === 'textarea' || type === 'select') {
        const fieldName = childProps.name || childProps.id || 'unknown';
        const fieldType = childProps.type || 'text';

        return {
          ...child,
          props: {
            ...childProps,
            onFocus: (e: any) => {
              trackFieldFocus(fieldName, fieldType);
              if (childProps.onFocus) {
                childProps.onFocus(e);
              }
            },
            onBlur: (e: any) => {
              const hasValue = e.target.value && e.target.value.trim() !== '';
              
              // Track unfocus event
              trackFieldUnfocus(fieldName, fieldType, hasValue);
              
              if (hasValue) {
                trackFieldCompleted(fieldName, fieldType, true);
              } else if (childProps.required) {
                trackFieldSkipped(fieldName, fieldType);
              }
              if (childProps.onBlur) {
                childProps.onBlur(e);
              }
            },
          },
        };
      }

      if (child.props && child.props.children) {
        return {
          ...child,
          props: {
            ...child.props,
            children: enhanceChildren(child.props.children),
          },
        };
      }
    }

    return children;
  };

  return (
    <form
      ref={formRef}
      id={id}
      className={className}
      onSubmit={handleSubmit}
      {...props}
    >
      {enhanceChildren(children)}
    </form>
  );
}
