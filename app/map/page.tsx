import { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

const MapClientPage = nextDynamic(() => import('../map'), {
  ssr: false,
});

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function MapRoutePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MapClientPage />
    </Suspense>
  );
}
