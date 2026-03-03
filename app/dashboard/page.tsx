'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { 
  Users, MapPin, FileText, LogOut, Plus, Search, 
  Map, Shield, Activity, Download
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalHouseholds: number;
  totalMenders: number;
  totalKebeles: number;
  recentActivity: any[];
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

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
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {t('common.app_name')}
              </h1>
              <p className="text-sm text-gray-500">
                {user?.role === 'MAYOR' 
                  ? locale === 'am' ? 'ጽ/ቤት - ሁሉንም መረጃ ማየት ይችላሉ' 
                  : 'Office - Full Access'
                  : user?.role === 'MENDER_STAFF'
                  ? `${locale === 'am' ? 'መንደር ሠራተኛ -' : 'Mender Staff -'} ${user?.assignedMender}`
                  : locale === 'am' ? 'አስተዳዳሪ' : 'Administrator'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <select
                value={locale}
                onChange={(e) => {
                  localStorage.setItem('hosana_locale', e.target.value);
                  window.location.reload();
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
              </select>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.username}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title={t('auth.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('dashboard.total_households')}</p>
                <p className="text-3xl font-bold text-gray-800">
                  {loading ? '...' : stats?.totalHouseholds || 0}
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
                <p className="text-sm text-gray-500 mb-1">{t('dashboard.total_menders')}</p>
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
                <p className="text-sm text-gray-500 mb-1">{t('dashboard.total_kebeles')}</p>
                <p className="text-3xl font-bold text-gray-800">12</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('dashboard.recent_activity')}</p>
                <p className="text-3xl font-bold text-gray-800">
                  {loading ? '...' : stats?.recentActivity?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              {t('dashboard.quick_actions')}
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/householders"
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">{t('householders.title')}</p>
                <p className="text-sm text-gray-500">{locale === 'am' ? 'ማየት እና ማስተካከል' : 'View & Manage'}</p>
              </div>
            </Link>

            <Link
              href="/householders/new"
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
            >
              <Plus className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">{t('householders.add_new')}</p>
                <p className="text-sm text-gray-500">{locale === 'am' ? 'አዲስ መረጃ መጨመር' : 'Add New Record'}</p>
              </div>
            </Link>

            <Link
              href="/emergency"
              className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition"
            >
              <Map className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-medium text-gray-800">{t('emergency.title')}</p>
                <p className="text-sm text-gray-500">{locale === 'am' ? 'አስቸኳይ ካርታ' : 'Emergency Map'}</p>
              </div>
            </Link>

            <Link
              href="/audit"
              className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
            >
              <FileText className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-800">{t('audit.title')}</p>
                <p className="text-sm text-gray-500">{locale === 'am' ? 'ኦዲት መዝገቦች' : 'Audit Logs'}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {t('dashboard.recent_activity')}
            </h2>
            <Link
              href="/audit"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {locale === 'am' ? 'ሁሉንም ይመልከቱ' : 'View All'} →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('audit.action')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('audit.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('audit.timestamp')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      {t('common.loading')}
                    </td>
                  </tr>
                ) : stats?.recentActivity?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      {t('householders.no_records')}
                    </td>
                  </tr>
                ) : (
                  stats?.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.action === 'LOGIN_SUCCESS' ? 'bg-green-100 text-green-700' :
                          activity.action === 'CREATE_HOUSEHOLDER' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {activity.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}