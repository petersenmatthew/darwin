'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useNavigationTracking } from '../../hooks/useNavigationTracking';
import { usePageTracking } from '../../hooks/usePageTracking';

interface TrackedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

export default function TrackedLink({ href, children, className, onClick, ...props }: TrackedLinkProps) {
  const { pageLoadTime } = usePageTracking();
  const { trackNavigationClick } = useNavigationTracking(pageLoadTime);

  const handleClick = () => {
    const linkText = typeof children === 'string' ? children : 'Link';
    trackNavigationClick(href, linkText);
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
