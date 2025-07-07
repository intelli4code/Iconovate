"use client";

import Link, { type LinkProps } from 'next/link';
import { useLoading } from '@/contexts/loading-context';
import { usePathname } from 'next/navigation';
import type React from 'react';

interface LoadingLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function LoadingLink({ children, ...props }: LoadingLinkProps) {
  const { showLoader } = useLoading();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't show loader if navigating to the same page or it's a hash link
    if (props.href === pathname || String(props.href).startsWith('#')) {
      return;
    }
    showLoader();
  };

  return (
    <Link onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
