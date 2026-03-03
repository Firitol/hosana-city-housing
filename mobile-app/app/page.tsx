'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, MapPin, FileText, Edit, Trash2, 
  Phone, Mail, Download, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

interface Householder {
  id: string;
  name: string;
  father_name?: string;
  house_number: string;
  mender: string;
  kebele: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  file_path?: string;
  file_name?: string;
  notes?: string;
  created_at: string;
}

export default function HouseholdersPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [householders, setHouseholders] = useState<Householder[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMender, setSelectedMender] = useState('all');
  const [selectedKebele, setSelectedKebele] = useState('all');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHouseholders();
    }
  }, [isAuthenticated, search, selectedMender, selectedKebele]);

  const fetchHouseholders = async () => {
    try {
      const token = localStorage.getItem('hosana_token');
      let url = '/api/householders?';
      
      if (search) url += `query=${search}&`;
      if (selectedMender !== 'all') url += `mender=${selectedMender}&`;
      if (selectedKebele !== 'all') url += `kebele=${selectedKebele}&`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setHouseholders(data);
    } catch (error) {
      console.error('Failed to fetch householders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(locale === 'am' 
      ? `የ${name}ን መረጃ ማጥፋት ይፈልጋሉ?` 
      : `Are you sure you want to delete ${name}'s record?`
    )) {
      return;
    }

    try {
      const token = localStorage.getItem('hosana_token');
      await fetch(`/api/householders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchHouseholders();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleExport = () => {
    // Export to CSV
    const headers = ['Name', 'House Number', 'Mender', 'Kebele', 'Phone', 'Created At'];
    const csv = [
      headers.join(','),
      ...householders.map(h => [
        h.name,
        h.house_number,
        h.mender,
        h.kebele,
        h.phone || '',
        h.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `householders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {t('householders.title')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {locale === 'am' 
                  ? 'የቤተሰብ መረጃዎችን ያስተዳድሩ' 
                  : 'Manage household information'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                {t('common.export')}
              </button>
              <Link
                href="/householders/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                {t('householders.add_new')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('householders.search_placeholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <select
              value={selectedMender}
              onChange={(e) => setSelectedMender(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">{locale === 'am' ? 'ሁሉም መንደሮች' : 'All Menders'}</option>
              <option value="Mender 1">{t('menders.mender_1')}</option>
              <option value="Mender 2">{t('menders.mender_2')}</option>
              <option value="Mender 3">{t('menders.mender_3')}</option>
            </select>
            <select
              value={selectedKebele}
              onChange={(e) => setSelectedKebele(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">{locale === 'am' ? 'ሁሉም ከበሌዎች' : 'All Kebeles'}</option>
              <option value="Kebele 01">Kebele 01</option>
              <option value="Kebele 02">Kebele 02</option>
              <option value="Kebele 03">Kebele 03</option>
              <option value="Kebele 04">Kebele 04</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('householders.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('householders.house_number')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('householders.mender')} / {t('householders.kebele')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('householders.phone')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('emergency.locate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('householders.documents')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('common.edit')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {t('common.loading')}
                    </td>
                  </tr>
                ) : householders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {t('householders.no_records')}
                    </td>
                  </tr>
                ) : (
                  householders.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{h.name}</p>
                          {h.father_name && (
                            <p className="text-sm text-gray-500">{h.father_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {h.house_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{h.mender}</div>
                        <div className="text-gray-500">{h.kebele}</div>
                      </td>
                      <td className="px-6 py-4">
                        {h.phone && (
                          <a
                            href={`tel:${h.phone}`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Phone className="w-4 h-4" />
                            {h.phone}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {h.latitude && h.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${h.latitude},${h.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            {t('emergency.urgent')}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {h.file_path ? (
                          <a
                            href={h.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            {h.file_name || 'View'}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/householders/${h.id}/edit`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {(user?.role === 'SUPER_ADMIN' || user?.role === 'MAYOR') && (
                            <button
                              onClick={() => handleDelete(h.id, h.name)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination would go here */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          {locale === 'am' 
            ? `ጠቅላላ ${householders.length} መረጃዎች` 
            : `Total ${householders.length} records`}
        </div>
      </div>
    </div>
  );
}