'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Householder } from '@/app/lib/geolocation';

interface HouseholderMarkersProps {
  householders: Householder[];
  onMarkerClick?: (householder: Householder) => void;
  color?: string;
}

export default function HouseholderMarkers({
  householders,
  onMarkerClick,
  color = 'blue',
}: HouseholderMarkersProps) {
  const icon = L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <>
      {householders.map((householder) => (
        <Marker
          key={householder.id}
          position={[householder.latitude || 0, householder.longitude || 0]}
          icon={icon}
          eventHandlers={{
            click: () => onMarkerClick?.(householder),
          }}
        >
          <Popup>
            <div className='p-3 min-w-max'>
              <h4 className='font-semibold text-sm'>{householder.name}</h4>
              <p className='text-xs text-gray-600'>House: {householder.house_number}</p>
              <p className='text-xs text-gray-600'>Kebele: {householder.kebele}</p>
              {householder.email && <p className='text-xs text-blue-600'>{householder.email}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
