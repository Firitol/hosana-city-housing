'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, Navigation, AlertTriangle } from 'lucide-react';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl: icon.src, shadowUrl: iconShadow.src, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ lat, lng }: { lat: number; lng: number }) { const map = useMap(); useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]); return null; }

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [center, setCenter] = useState<[number, number]>([7.55, 37.85]);
  const [marker, setMarker] = useState<{ lat: number; lng: number; name: string; address: string } | null>(null);
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
    if (marker) window.open(`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-[1000]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-6 h-6 text-gray-700" /></button>
          <div className="flex-1"><h1 className="text-lg font-bold text-gray-800">{marker ? 'Emergency Location' : 'Hosana City Map'}</h1>{marker?.address && <p className="text-sm text-gray-500">{marker.address}</p>}</div>
          {marker && <button onClick={handleNavigate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><Navigation className="w-4 h-4" />Navigate</button>}
        </div>
      </header>
      <div className="h-[calc(100vh-73px)] w-full">
        <MapContainer center={center} zoom={15} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {marker && <><Marker position={[marker.lat, marker.lng]}><Popup><div className="p-2"><p className="font-bold">{marker.name}</p><p className="text-sm text-gray-600">{marker.address}</p><button onClick={handleNavigate} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">🧭 Navigate</button></div></Popup></Marker><MapUpdater lat={marker.lat} lng={marker.lng} /></>}
        </MapContainer>
      </div>
    </div>
  );
}
