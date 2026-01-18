'use client';

import Link from 'next/link';
import { ReactNode, Children, isValidElement } from 'react';
import { useNavigationTracking } from '../../hooks/useNavigationTracking';
import { usePageTracking } from '../../hooks/usePageTracking';

interface TrackedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
  [key: string]: any;
}

// Extract text content from React children for accessibility tracking
function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).filter(Boolean).join(' ');
  }
  if (isValidElement(children)) {
    // Check for common text-bearing props
    const props = children.props as Record<string, unknown>;
    if (props.children) {
      return extractTextFromChildren(props.children as ReactNode);
    }
    // Check for alt text on images
    if (props.alt && typeof props.alt === 'string') {
      return props.alt;
    }
  }
  return '';
}

// Derive a descriptive label from the href path
function getLabelFromHref(href: string): string {
  const path = href.replace(/^\//, '').split('/')[0] || 'Home';
  return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
}

export default function TrackedLink({ href, children, className, onClick, 'aria-label': ariaLabel, ...props }: TrackedLinkProps) {
  const { pageLoadTime } = usePageTracking();
  const { trackNavigationClick } = useNavigationTracking(pageLoadTime);

  const handleClick = () => {
    // Priority: aria-label > extracted text > href-derived label
    let linkText = ariaLabel || extractTextFromChildren(children).trim();
    if (!linkText) {
      linkText = getLabelFromHref(href);
    }
    trackNavigationClick(href, linkText);
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} aria-label={ariaLabel} {...props}>
      {children}
    </Link>
  );
}
