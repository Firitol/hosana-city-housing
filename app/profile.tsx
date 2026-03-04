'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileText,
  Navigation,
  Edit,
  User,
  Home,
  Clipboard,
  AlertTriangle,
} from 'lucide-react';

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
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [householder, setHouseholder] = useState<Householder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams?.get('id');
    if (id) {
      fetchProfile(id);
    } else {
      setError('No householder ID provided');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchProfile = async (id: string) => {
    try {
      const token = localStorage.getItem('hosana_token');
      const response = await fetch(`/api/householders?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load profile');
      }
      
      const data = await response.json();
      // If API returns array, take first item
      setHouseholder(Array.isArray(data) ? data[0] : data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (!householder?.phone) {
      alert('Phone number not available');
      return;
    }
    window.location.href = `tel:${householder.phone}`;
  };

  const handleEmail = () => {
    if (!householder?.email) {
      alert('Email address not available');
      return;
    }
    window.location.href = `mailto:${householder.email}`;
  };

  const handleNavigate = () => {
    if (!householder?.latitude || !householder?.longitude) {
      alert('GPS coordinates not available');
      return;
    }

    const url = `https://www.google.com/maps?q=${householder.latitude},${householder.longitude}`;
    window.open(url, '_blank');
  };

  const handleViewDocument = () => {
    if (!householder?.file_path) {
      alert('No document uploaded');
      return;
    }
    window.open(householder.file_path, '_blank');
  };

  const handleEdit = () => {
    router.push(`/householders/${householder?.id}/edit`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copied to clipboard`);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert(`${label} copied to clipboard`);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !householder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-blue-700 rounded-lg transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white ml-4 flex-1 text-center">
              Profile Details
            </h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-white">{householder.name}</h2>
            {householder.father_name && (
              <p className="text-white/80 mt-1">{householder.father_name}</p>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Emergency Button */}
        {householder.latitude && householder.longitude && (
          <button
            onClick={handleNavigate}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl p-4 mb-6 flex items-center justify-center transition"
          >
            <AlertTriangle className="w-6 h-6 mr-3" />
            <span className="font-bold text-lg">EMERGENCY LOCATION</span>
          </button>
        )}

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
            </div>

            <InfoRow
              icon={<User className="w-4 h-4 text-gray-500" />}
              label="Full Name"
              value={householder.name}
              onCopy={() => copyToClipboard(householder.name, 'Name')}
            />

            {householder.father_name && (
              <InfoRow
                icon={<User className="w-4 h-4 text-gray-500" />}
                label="Father's Name"
                value={householder.father_name}
              />
            )}

            {householder.phone && (
              <InfoRow
                icon={<Phone className="w-4 h-4 text-gray-500" />}
                label="Phone Number"
                value={householder.phone}
                actionText="Call"
                onAction={handleCall}
                onCopy={() => copyToClipboard(householder.phone!, 'Phone')}
              />
            )}

            {householder.email && (
              <InfoRow
                icon={<Mail className="w-4 h-4 text-gray-500" />}
                label="Email"
                value={householder.email}
                actionText="Email"
                onAction={handleEmail}
              />
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center mb-4">
              <Home className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Address Information</h3>
            </div>

            <InfoRow
              icon={<MapPin className="w-4 h-4 text-gray-500" />}
              label="House Number"
              value={householder.house_number}
              onCopy={() => copyToClipboard(householder.house_number, 'House Number')}
            />

            <InfoRow
              icon={<MapPin className="w-4 h-4 text-gray-500" />}
              label="Mender"
              value={householder.mender}
            />

            <InfoRow
              icon={<MapPin className="w-4 h-4 text-gray-500" />}
              label="Kebele"
              value={householder.kebele}
            />

            {householder.latitude && householder.longitude && (
              <InfoRow
                icon={<MapPin className="w-4 h-4 text-gray-500" />}
                label="GPS Coordinates"
                value={`${householder.latitude}, ${householder.longitude}`}
                actionText="Navigate"
                onAction={handleNavigate}
              />
            )}
          </div>
        </div>

        {/* Documents */}
        {householder.file_path && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">Documents</h3>
              </div>

              <button
                onClick={handleViewDocument}
                className="w-full flex items-center bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition"
              >
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                <div className="flex-1 text-left">
                  <p className="text-gray-800 font-medium">
                    {householder.file_name || 'Document'}
                  </p>
                  <p className="text-gray-500 text-sm">Tap to view</p>
                </div>
                <Navigation className="w-5 h-5 text-blue-600" />
              </button>
            </div>
          </div>
        )}

        {/* Notes */}
        {householder.notes && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center mb-4">
                <Clipboard className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">Notes</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{householder.notes}</p>
            </div>
          </div>
        )}

        {/* Edit Button */}
        <button
          onClick={handleEdit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 mb-8 flex items-center justify-center transition"
        >
          <Edit className="w-5 h-5 mr-2" />
          <span className="font-bold">Edit Profile</span>
        </button>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mb-8">
          <p>Created: {new Date(householder.created_at).toLocaleDateString()}</p>
          <p>Updated: {new Date(householder.updated_at).toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  );
}

// Info Row Component
function InfoRow({
  icon,
  label,
  value,
  actionText,
  onAction,
  onCopy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  actionText?: string;
  onAction?: () => void;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <div className="w-8">{icon}</div>
      <div className="flex-1 ml-2">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-gray-800 font-medium">{value}</p>
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition"
        >
          Copy
        </button>
      )}
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="ml-2 px-3 py-1 text-green-600 hover:bg-green-50 rounded text-xs font-medium transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
