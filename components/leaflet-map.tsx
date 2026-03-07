'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface MarkerData {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return null;
}

export default function LeafletMap({
  center,
  marker,
  onNavigate,
}: {
  center: [number, number];
  marker: MarkerData | null;
  onNavigate: () => void;
}) {
  useEffect(() => {
    const defaultIcon = L.icon({
      iconUrl: icon.src,
      shadowUrl: iconShadow.src,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  return (
    <MapContainer center={center} zoom={15} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {marker && (
        <>
          <Marker position={[marker.lat, marker.lng]}>
            <Popup>
              <div className="p-2">
                <p className="font-bold">{marker.name}</p>
                <p className="text-sm text-gray-600">{marker.address}</p>
                <button
                  onClick={onNavigate}
                  className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                >
                  🧭 Navigate
                </button>
              </div>
            </Popup>
          </Marker>
          <MapUpdater lat={marker.lat} lng={marker.lng} />
        </>
      )}
    </MapContainer>
  );
}
