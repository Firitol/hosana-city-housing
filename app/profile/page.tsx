import { Suspense } from 'react';
import ProfilePageClient from '../profile';

export const dynamic = 'force-dynamic';

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function ProfileRoutePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProfilePageClient />
    </Suspense>
  );
}
export { default } from '../profile';
