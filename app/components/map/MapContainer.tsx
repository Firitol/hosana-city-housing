'use client';

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ReactNode } from 'react';

const HOSANA_CENTER = [7.54978, 37.85374] as const;

interface MapProps {
  children?: ReactNode;
  zoom?: number;
  center?: [number, number];
  className?: string;
}

export default function Map({ children, zoom = 14, center = HOSANA_CENTER, className = '' }: MapProps) {
  return (
    <MapContainer
      center={center as L.LatLngExpression}
      zoom={zoom}
      scrollWheelZoom={true}
      className={`w-full h-full ${className}`}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <ZoomControl position='topleft' />
      {children}
    </MapContainer>
  );
}
