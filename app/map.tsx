'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, Navigation, AlertTriangle } from 'lucide-react';

// Fix for Leaflet default icon in Next.js
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map view when location changes
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [center, setCenter] = useState<[number, number]>([7.55, 37.85]); // Default: Hosana
  const [marker, setMarker] = useState<{ lat: number; lng: number; name: string; address: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get location from URL params (for emergency navigation)
    const lat = searchParams?.get('lat');
    const lng = searchParams?.get('lng');
    const name = searchParams?.get('name');
    const address = searchParams?.get('address');

    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setCenter([latNum, lngNum]);
        setMarker({
          lat: latNum,
          lng: lngNum,
          name: name || 'Location',
          address: address || '',
        });
      }
    }
    
    // Try to get user's current location for fallback
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!marker) {
            setCenter([position.coords.latitude, position.coords.longitude]);
          }
          setLoading(false);
        },
        () => setLoading(false),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLoading(false);
    }
  }, [searchParams, marker]);

  const handleEmergencyCall = () => {
    // In production, integrate with emergency services API
    alert('🚨 Emergency services notified for:\n\n' + 
          (marker?.name || 'Unknown') + '\n' + 
          (marker?.address || 'Unknown location'));
  };

  const handleNavigate = () => {
    if (marker) {
      // Open Google Maps for navigation
      const url = `https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-[1000]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">
              {marker ? 'Emergency Location' : 'Hosana City Map'}
            </h1>
            {marker?.address && (
              <p className="text-sm text-gray-500">{marker.address}</p>
            )}
          </div>
          {marker && (
            <div className="flex gap-2">
              <button
                onClick={handleEmergencyCall}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Emergency</span>
              </button>
              <button
                onClick={handleNavigate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">Navigate</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Map Container */}
      <div className="h-[calc(100vh-73px)] w-full">
        <MapContainer
          center={center}
          zoom={15}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marker for target location */}
          {marker && (
            <>
              <Marker position={[marker.lat, marker.lng]}>
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <p className="font-bold text-gray-800">{marker.name}</p>
                    <p className="text-sm text-gray-600">{marker.address}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleEmergencyCall}
                        className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                      >
                        🚨 Emergency
                      </button>
                      <button
                        onClick={handleNavigate}
                        className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                      >
                        🧭 Navigate
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
              <MapUpdater lat={marker.lat} lng={marker.lng} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Mobile Emergency Bar */}
      {marker && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 sm:hidden z-[1000]">
          <div className="flex gap-3">
            <button
              onClick={handleEmergencyCall}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
            >
              <AlertTriangle className="w-5 h-5" />
              Emergency
            </button>
            <button
              onClick={handleNavigate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              <Navigation className="w-5 h-5" />
              Navigate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
