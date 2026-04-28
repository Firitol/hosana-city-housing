'use client';

import { useState, useEffect } from 'react';
import { Landmark } from '@/app/lib/geolocation';
import { Plus, Trash2, Edit2, MapPin } from 'lucide-react';

export default function LandmarksAdminPage() {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    landmark_type: 'HOTEL' as Landmark['landmark_type'],
    latitude: 7.54978,
    longitude: 37.85374,
    address: '',
    phone: '',
    rating: 3.5,
    description: '',
  });

  useEffect(() => {
    fetchLandmarks();
  }, []);

  const fetchLandmarks = async () => {
    try {
      const response = await fetch('/api/landmarks');
      if (response.ok) {
        const data = await response.json();
        setLandmarks(data.data);
      }
    } catch (error) {
      console.error('Error fetching landmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/landmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setLandmarks([...landmarks, data.data]);
        setFormData({
          name: '',
          landmark_type: 'HOTEL',
          latitude: 7.54978,
          longitude: 37.85374,
          address: '',
          phone: '',
          rating: 3.5,
          description: '',
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating landmark:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this landmark?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/landmarks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLandmarks(landmarks.filter((l) => l.id !== id));
      }
    } catch (error) {
      console.error('Error deleting landmark:', error);
    }
  };

  if (loading) {
    return <div className='p-8'>Loading...</div>;
  }

  return (
    <div className='p-8'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <MapPin className='w-8 h-8' />
            Landmark Management
          </h1>
          <p className='text-gray-600'>Manage landmarks and reference points across Hosana</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg'
        >
          <Plus className='w-5 h-5' />
          Add Landmark
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Add New Landmark</h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Name</label>
                <input
                  type='text'
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Landmark name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Type</label>
                <select
                  value={formData.landmark_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      landmark_type: e.target.value as Landmark['landmark_type'],
                    })
                  }
                  className='w-full px-3 py-2 border rounded-lg'
                >
                  <option value='HOTEL'>Hotel</option>
                  <option value='MARKET'>Market</option>
                  <option value='HOSPITAL'>Hospital</option>
                  <option value='SCHOOL'>School</option>
                  <option value='GOVERNMENT'>Government</option>
                  <option value='RELIGIOUS'>Religious</option>
                  <option value='OTHER'>Other</option>
                </select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Latitude</label>
                <input
                  type='number'
                  step='0.00001'
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Longitude</label>
                <input
                  type='number'
                  step='0.00001'
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: parseFloat(e.target.value) })
                  }
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>Address</label>
              <input
                type='text'
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className='w-full px-3 py-2 border rounded-lg'
                placeholder='Street address'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Phone</label>
                <input
                  type='tel'
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='+251...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Rating (0-5)</label>
                <input
                  type='number'
                  step='0.1'
                  min='0'
                  max='5'
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className='w-full px-3 py-2 border rounded-lg'
                rows={3}
                placeholder='Additional details'
              />
            </div>

            <div className='flex gap-3'>
              <button
                type='submit'
                className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg'
              >
                Create Landmark
              </button>
              <button
                type='button'
                onClick={() => setShowForm(false)}
                className='flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Landmarks Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b'>
            <tr>
              <th className='px-6 py-3 text-left text-sm font-semibold'>Name</th>
              <th className='px-6 py-3 text-left text-sm font-semibold'>Type</th>
              <th className='px-6 py-3 text-left text-sm font-semibold'>Coordinates</th>
              <th className='px-6 py-3 text-left text-sm font-semibold'>Rating</th>
              <th className='px-6 py-3 text-left text-sm font-semibold'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {landmarks.map((landmark) => (
              <tr key={landmark.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 font-medium'>{landmark.name}</td>
                <td className='px-6 py-4'>
                  <span className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm'>
                    {landmark.landmark_type}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm text-gray-600'>
                  {landmark.latitude.toFixed(4)}, {landmark.longitude.toFixed(4)}
                </td>
                <td className='px-6 py-4'>{landmark.rating ? landmark.rating + '/5' : '-'}</td>
                <td className='px-6 py-4 flex gap-2'>
                  <button className='p-2 hover:bg-gray-100 rounded-lg' title='Edit'>
                    <Edit2 className='w-4 h-4 text-gray-600' />
                  </button>
                  <button
                    onClick={() => handleDelete(landmark.id)}
                    className='p-2 hover:bg-red-100 rounded-lg'
                    title='Delete'
                  >
                    <Trash2 className='w-4 h-4 text-red-600' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {landmarks.length === 0 && (
        <div className='text-center py-12'>
          <MapPin className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-600 mb-4'>No landmarks found</p>
          <button
            onClick={() => setShowForm(true)}
            className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg'
          >
            <Plus className='w-5 h-5' />
            Create First Landmark
          </button>
        </div>
      )}
    </div>
  );
}
