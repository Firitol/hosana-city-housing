'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, X } from 'lucide-react';

const Map = dynamic(() => import('./map/MapContainer'), {
  ssr: false,
  loading: () => <div className='w-full h-96 flex items-center justify-center'>Loading map...</div>,
});

interface LocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [latitude, setLatitude] = useState(initialLat || 7.54978);
  const [longitude, setLongitude] = useState(initialLng || 37.85374);
  const mapRef = useRef<any>(null);

  const handleMapClick = (e: any) => {
    if (e.latlng) {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
    }
  };

  const handleConfirm = () => {
    onLocationSelect(latitude, longitude);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg'
      >
        <MapPin className='w-4 h-4' />
        Pick Location
      </button>
    );
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-2xl w-96 overflow-hidden'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='font-semibold text-lg'>Select Location</h3>
          <button
            onClick={() => setIsOpen(false)}
            className='p-1 hover:bg-gray-100 rounded'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='h-96'>
          <Map center={[latitude, longitude]} zoom={14}>
            {/* Map interaction is handled by L.Map click events */}
          </Map>
        </div>

        <div className='p-4 border-t space-y-3'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm font-medium mb-1'>Latitude</label>
              <input
                type='number'
                value={latitude.toFixed(6)}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className='w-full px-3 py-2 border rounded-lg'
                step='0.00001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Longitude</label>
              <input
                type='number'
                value={longitude.toFixed(6)}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className='w-full px-3 py-2 border rounded-lg'
                step='0.00001'
              />
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={() => setIsOpen(false)}
              className='flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
