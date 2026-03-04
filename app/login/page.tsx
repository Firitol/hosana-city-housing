'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { Users, MapPin, FileText, LogOut, Plus, Search } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [stats, setStats] = useState({ totalHouseholds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('hosana_token');
      const response = await fetch('/api/householders', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setStats({ totalHouseholds: data.length });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Hosana City Housing System</h1>
              <p className="text-sm text-gray-500">{user?.role === 'MAYOR' ? 'Office - Full Access' : user?.role === 'MENDER_STAFF' ? `Mender Staff - ${user?.assignedMender}` : 'Administrator'}</p>
            </div>
            <div className="flex items-center gap-4">
              <select value={locale} onChange={(e) => { localStorage.setItem('hosana_locale', e.target.value); window.location.reload(); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
              </select>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.username}</p>
                </div>
                <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Logout"><LogOut className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500 mb-1">Total Households</p><p className="text-3xl font-bold text-gray-800">{loading ? '...' : stats.totalHouseholds}</p></div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500 mb-1">Total Menders</p><p className="text-3xl font-bold text-gray-800">3</p></div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><MapPin className="w-6 h-6 text-green-600" /></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2></div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/householders" className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"><Users className="w-6 h-6 text-blue-600" /><div><p className="font-medium text-gray-800">Householders</p><p className="text-sm text-gray-500">View & Manage</p></div></Link>
            <Link href="/householders/new" className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"><Plus className="w-6 h-6 text-green-600" /><div><p className="font-medium text-gray-800">Add New</p><p className="text-sm text-gray-500">Add New Record</p></div></Link>
            <Link href="/map" className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition"><MapPin className="w-6 h-6 text-red-600" /><div><p className="font-medium text-gray-800">Emergency Map</p><p className="text-sm text-gray-500">View Locations</p></div></Link>
            <Link href="/search" className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"><Search className="w-6 h-6 text-purple-600" /><div><p className="font-medium text-gray-800">Search</p><p className="text-sm text-gray-500">Find Records</p></div></Link>
          </div>
        </div>
      </main>
    </div>
  );
}
