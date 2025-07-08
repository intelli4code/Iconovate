'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/dashboard/loading';
import { useLoading } from '@/contexts/loading-context';

// This page's content has been moved to the root page.tsx
// This component now just redirects to the root.
export default function DeprecatedHomePage() {
  const router = useRouter();
  const { showLoader } = useLoading();

  useEffect(() => {
    showLoader();
    router.replace('/');
  }, [router, showLoader]);

  return <Loading />;
}
