import { Suspense } from 'react';
import SearchPageClient from '../search';

export const dynamic = 'force-dynamic';

function SearchRouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function SearchRoutePage() {
  return (
    <Suspense fallback={<SearchRouteLoading />}>
      <SearchPageClient />
    </Suspense>
  );
}
