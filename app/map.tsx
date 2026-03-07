'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Navigation } from 'lucide-react';

const LeafletMap = dynamic(() => import('../components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
});

interface MarkerData {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [center, setCenter] = useState<[number, number]>([7.55, 37.85]);
  const [marker, setMarker] = useState<MarkerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lat = searchParams?.get('lat');
    const lng = searchParams?.get('lng');
    const name = searchParams?.get('name');
    const address = searchParams?.get('address');

    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setCenter([latNum, lngNum]);
        setMarker({ lat: latNum, lng: lngNum, name: name || 'Location', address: address || '' });
      }
    }

    setLoading(false);
  }, [searchParams]);

  const handleNavigate = () => {
    if (!marker) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-[1000]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">
              {marker ? 'Emergency Location' : 'Hosana City Map'}
            </h1>
            {marker?.address && <p className="text-sm text-gray-500">{marker.address}</p>}
          </div>
          {marker && (
            <button
              onClick={handleNavigate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Navigation className="w-4 h-4" />
              Navigate
            </button>
          )}
        </div>
      </header>

      <div className="h-[calc(100vh-73px)] w-full">
        <LeafletMap center={center} marker={marker} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}
