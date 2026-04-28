'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Landmark } from '@/app/lib/geolocation';
import { useMemo } from 'react';

const LANDMARK_ICONS: Record<Landmark['landmark_type'], string> = {
  HOTEL: '🏨',
  MARKET: '🏪',
  HOSPITAL: '🏥',
  SCHOOL: '🏫',
  GOVERNMENT: '🏛️',
  RELIGIOUS: '⛪',
  OTHER: '📍',
};

interface LandmarkMarkersProps {
  landmarks: Landmark[];
  onMarkerClick?: (landmark: Landmark) => void;
}

export default function LandmarkMarkers({ landmarks, onMarkerClick }: LandmarkMarkersProps) {
  const markerIcons = useMemo(() => {
    return Object.entries(LANDMARK_ICONS).reduce(
      (acc, [type, emoji]) => {
        acc[type] = L.divIcon({
          html: `<div style="font-size: 30px; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">${emoji}</div>`,
          className: 'landmark-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });
        return acc;
      },
      {} as Record<string, L.Icon>
    );
  }, []);

  return (
    <>
      {landmarks.map((landmark) => (
        <Marker
          key={landmark.id}
          position={[landmark.latitude, landmark.longitude]}
          icon={markerIcons[landmark.landmark_type]}
          eventHandlers={{
            click: () => onMarkerClick?.(landmark),
          }}
        >
          <Popup>
            <div className='p-3 min-w-max'>
              <h4 className='font-semibold text-sm'>{landmark.name}</h4>
              <p className='text-xs text-gray-600'>{landmark.landmark_type}</p>
              {landmark.rating && <p className='text-xs'>Rating: {landmark.rating}/5</p>}
              {landmark.address && <p className='text-xs text-gray-500'>{landmark.address}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
