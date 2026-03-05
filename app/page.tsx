'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ✅ Only redirect after loading is complete
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // ✅ Show loading only while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Hosana City Housing System</h1>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Fallback content if redirect fails
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Hosana City Housing System</h1>
        <p className="mb-4">Redirecting...</p>
        <button
          onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
          className="px-6 py-2 bg-white text-blue-900 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          Continue manually
        </button>
      </div>
    </div>
  );
}
