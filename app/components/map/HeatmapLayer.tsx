'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Dynamically import HeatmapJS
let HeatmapJS: any = null;

async function loadHeatmap() {
  if (typeof window !== 'undefined' && !HeatmapJS) {
    const heatmapjs = await import('heatmap.js');
    HeatmapJS = heatmapjs.default || heatmapjs;
  }
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

interface HeatmapLayerProps {
  data: HeatmapPoint[];
  visible: boolean;
}

export default function HeatmapLayer({ data, visible }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!visible || data.length === 0) {
      return;
    }

    // Create a simple heatmap using circle markers
    const heatmapGroup = L.featureGroup();

    data.forEach((point) => {
      const radius = Math.sqrt(point.weight) * 3; // Scale weight to radius
      const intensity = Math.min(point.weight / 10, 1); // Normalize weight to 0-1

      L.circleMarker([point.lat, point.lng], {
        radius: Math.max(3, radius),
        fillColor: `hsl(0, 100%, ${100 - intensity * 50}%)`,
        color: `hsl(0, 100%, ${100 - intensity * 70}%)`,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6,
      }).addTo(heatmapGroup);
    });

    heatmapGroup.addTo(map);

    return () => {
      map.removeLayer(heatmapGroup);
    };
  }, [map, data, visible]);

  return null;
}
