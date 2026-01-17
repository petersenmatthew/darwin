'use client';

import { ReactNode, MouseEvent } from 'react';
import { useElementTracking } from '../../hooks/useElementTracking';
import { usePageTracking } from '../../hooks/usePageTracking';

interface TrackedButtonProps {
  id?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}

export default function TrackedButton({ 
  id, 
  children, 
  onClick, 
  className, 
  type = 'button',
  ...props 
}: TrackedButtonProps) {
  const { pageLoadTime } = usePageTracking();
  const buttonId = id || `button_${Math.random().toString(36).substr(2, 9)}`;
  const { trackButtonClick } = useElementTracking({
    elementId: buttonId,
    elementType: 'button',
    pageLoadTime,
  });

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const buttonText = typeof children === 'string' ? children : 'Button';
    trackButtonClick(buttonText);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      id={buttonId}
      type={type}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
