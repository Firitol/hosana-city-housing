'use client';

import { useState } from 'react';
import LocationPicker from './LocationPicker';
import { MapPin, Save, Loader } from 'lucide-react';

interface HouseholderLocationFormProps {
  householderId: string;
  initialLat?: number;
  initialLng?: number;
  householderName: string;
  onLocationUpdate?: (latitude: number, longitude: number) => void;
}

export default function HouseholderLocationForm({
  householderId,
  initialLat,
  initialLng,
  householderName,
  onLocationUpdate,
}: HouseholderLocationFormProps) {
  const [latitude, setLatitude] = useState(initialLat || 7.54978);
  const [longitude, setLongitude] = useState(initialLng || 37.85374);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/householder/${householderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      });

      if (response.ok) {
        setMessage('Location updated successfully!');
        onLocationUpdate?.(latitude, longitude);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      setMessage('Error updating location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
        <MapPin className='w-5 h-5' />
        Update Location for {householderName}
      </h3>

      <div className='space-y-4'>
        {/* Current Coordinates Display */}
        <div className='grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Current Latitude
            </label>
            <p className='text-lg font-mono'>{latitude.toFixed(6)}</p>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Current Longitude
            </label>
            <p className='text-lg font-mono'>{longitude.toFixed(6)}</p>
          </div>
        </div>

        {/* Location Picker Button */}
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialLat={latitude}
          initialLng={longitude}
        />

        {/* Manual Input */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Latitude
            </label>
            <input
              type='number'
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              step='0.00001'
              placeholder='7.54978'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Longitude
            </label>
            <input
              type='number'
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              step='0.00001'
              placeholder='37.85374'
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg'
        >
          {loading ? (
            <>
              <Loader className='w-4 h-4 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <Save className='w-4 h-4' />
              Save Location
            </>
          )}
        </button>

        {/* Message */}
        {message && (
          <p
            className={`text-sm p-3 rounded ${
              message.includes('success')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
