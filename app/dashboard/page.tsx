'use client';

// ✅ Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Users, MapPin, FileText, LogOut, Plus, Search, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalHouseholds: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('hosana_token');
      const response = await fetch('/api/householder', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setStats({ totalHouseholds: data.length || 0 });
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Home className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Hosana City Housing System</h1>
                <p className="text-sm text-gray-500">
                  {user?.role === 'SUPER_ADMIN' ? 'Office - Full Access' : 
                   user?.role === 'MAYOR' ? 'Mayor Office - Read Access' :
                   user?.role === 'MENDER_STAFF' ? `Mender Staff - ${user?.assignedMender}` : 
                   'Auditor - Read & Audit Access'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Households</p>
                <p className="text-3xl font-bold text-gray-800">
                  {loading ? '...' : stats.totalHouseholds}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Menders</p>
                <p className="text-3xl font-bold text-gray-800">3</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Kebeles</p>
                <p className="text-3xl font-bold text-gray-800">5</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">System Status</p>
                <p className="text-3xl font-bold text-green-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/householder"
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">Householders</p>
                <p className="text-sm text-gray-500">View & Manage</p>
              </div>
            </Link>

            <Link
              href="/householder/new"
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
            >
              <Plus className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">Add New</p>
                <p className="text-sm text-gray-500">Add New Record</p>
              </div>
            </Link>

            <Link
              href="/map"
              className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition"
            >
              <MapPin className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-medium text-gray-800">Emergency Map</p>
                <p className="text-sm text-gray-500">View Locations</p>
              </div>
            </Link>

            <Link
              href="/search"
              className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
            >
              <Search className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-800">Search</p>
                <p className="text-sm text-gray-500">Find Records</p>
              </div>
            </Link>
          </div>

          {/* Admin Only Actions */}
          {user?.role === 'SUPER_ADMIN' && (
            <div className="p-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Administration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                >
                  <Users className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-800">User Management</p>
                    <p className="text-sm text-gray-500">Approve & Manage Users</p>
                  </div>
                </Link>

                <Link
                  href="/admin/audit"
                  className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition"
                >
                  <FileText className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-800">Audit Logs</p>
                    <p className="text-sm text-gray-500">View System Activity</p>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm py-8">
          <p>© 2024 Hosana City Administration - Housing Management System</p>
          <p className="mt-1">All rights reserved | Authorized access only</p>
        </div>
      </main>
    </div>
  );
}
