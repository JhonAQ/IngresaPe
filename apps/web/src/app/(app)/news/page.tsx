import { Suspense } from 'react';
import { NewsClient } from '../../../components/news/NewsClient';
import { DashboardSkeleton } from '../../../components/ui/skeleton';

export const metadata = {
  title: 'News — Centro de Control de Admisión UNSA',
  description:
    'Cuenta regresiva, alertas oficiales, documentos, materiales y herramientas para tu proceso de admisión UNSA.',
};

export default function NewsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <NewsClient />
    </Suspense>
  );
}
