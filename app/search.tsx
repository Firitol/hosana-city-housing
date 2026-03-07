'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X, MapPin, Phone, FileText, Plus, AlertTriangle, Upload, Loader2 } from 'lucide-react';

interface Householder {
  id: string;
  name: string;
  father_name?: string;
  house_number: string;
  mender: string;
  kebele: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  file_path?: string;
  file_name?: string;
  created_at: string;
}

const MENDERS = ['All', 'Mender 1', 'Mender 2', 'Mender 3'];
const KEBELES = ['All', 'Kebele 01', 'Kebele 02', 'Kebele 03', 'Kebele 04', 'Kebele 05'];

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMender, setSelectedMender] = useState('All');
  const [selectedKebele, setSelectedKebele] = useState('All');
  const [householders, setHouseholders] = useState<Householder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHouseholders();
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, selectedMender, selectedKebele]);

  const fetchHouseholders = async () => {
    try {
      const token = localStorage.getItem('hosana_token');
      let url = '/api/householder?';
      
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
      if (selectedMender !== 'All') url += `mender=${encodeURIComponent(selectedMender)}&`;
      if (selectedKebele !== 'All') url += `kebele=${encodeURIComponent(selectedKebele)}&`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      setHouseholders(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMender('All');
    setSelectedKebele('All');
  };

  const handleEmergency = (householder: Householder) => {
    if (!householder.latitude || !householder.longitude) {
      alert('GPS coordinates not available for this householder');
      return;
    }

    if (confirm(`Open map for ${householder.name}?`)) {
      router.push(
        `/map?lat=${householder.latitude}&lng=${householder.longitude}&name=${encodeURIComponent(householder.name)}&address=${encodeURIComponent(householder.house_number + ', ' + householder.mender)}`
      );
    }
  };

  const handleCall = (phone?: string) => {
    if (!phone) {
      alert('Phone number not available');
      return;
    }
    window.location.href = `tel:${phone}`;
  };


  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('hosana_token');
    if (!token) {
      alert('Please login again');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/householder/upload-csv', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'CSV upload failed');
      }

      const details = [`Inserted: ${data.inserted}`, `Failed: ${data.failed}`];
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        details.push(`Errors: ${data.errors.slice(0, 3).join(' | ')}`);
      }
      alert(`CSV upload complete. ${details.join(' | ')}`);

      fetchHouseholders();
    } catch (error: any) {
      alert(error.message || 'CSV upload failed');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploading(false);
    }
  };

  const handleViewDocument = (filePath?: string) => {
    if (!filePath) {
      alert('No document available');
      return;
    }
    window.open(filePath, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-800">Search Householders</h1>
            <button
              onClick={() => router.push('/registration')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-3">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or house number..."
              className="flex-1 bg-transparent outline-none text-gray-800"
            />
            {searchQuery.length > 0 && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 space-y-4">
              {/* Mender Filter */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Mender</p>
                <div className="flex flex-wrap gap-2">
                  {MENDERS.map((mender) => (
                    <button
                      key={mender}
                      onClick={() => setSelectedMender(mender)}
                      className={`px-4 py-2 rounded-lg transition ${
                        selectedMender === mender
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {mender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kebele Filter */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Kebele</p>
                <div className="flex flex-wrap gap-2">
                  {KEBELES.map((kebele) => (
                    <button
                      key={kebele}
                      onClick={() => setSelectedKebele(kebele)}
                      className={`px-4 py-2 rounded-lg transition ${
                        selectedKebele === kebele
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {kebele}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Results */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      ) : householders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No householders found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {householders.map((h) => (
              <div
                key={h.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/profile?id=${h.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{h.name}</h3>
                    {h.father_name && (
                      <p className="text-sm text-gray-500">{h.father_name}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEmergency(h);
                    }}
                    className="bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                    <MapPin className="w-3 h-3 text-gray-500 mr-1" />
                    <span className="text-gray-600">{h.house_number}</span>
                  </div>
                  <div className="bg-blue-100 px-2 py-1 rounded text-xs">
                    <span className="text-blue-600">{h.mender}</span>
                  </div>
                  <div className="bg-green-100 px-2 py-1 rounded text-xs">
                    <span className="text-green-600">{h.kebele}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  {h.phone && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCall(h.phone);
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition text-sm text-green-700"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </button>
                  )}
                  {h.file_path && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDocument(h.file_path);
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-sm text-blue-700"
                    >
                      <FileText className="w-4 h-4" />
                      Docs
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Results Count */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            {householders.length} result{householders.length !== 1 ? 's' : ''} found
          </div>
        </main>
      )}
    </div>
  );
}
