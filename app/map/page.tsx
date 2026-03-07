import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

const MapClientPage = dynamicImport(() => import('../map'), {
  ssr: false,
});

function MapRouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function MapRoutePage() {
  return (
    <Suspense fallback={<MapRouteLoading />}>
      <MapClientPage />
    </Suspense>
  );
}
