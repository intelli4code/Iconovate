
import { Suspense } from 'react';
import DesignerPageContent from './designer-page-content';
import Loading from '../dashboard/loading';

export default function DesignerDashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DesignerPageContent />
    </Suspense>
  );
}
