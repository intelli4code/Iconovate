'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from './dashboard/loading';
import { useLoading } from '@/contexts/loading-context';

export default function RootPage() {
  const router = useRouter();
  const { showLoader } = useLoading();

  useEffect(() => {
    showLoader();
    router.replace('/dashboard');
  }, [router, showLoader]);

  return <Loading />;
}
