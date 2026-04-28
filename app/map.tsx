'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Landmark, Householder } from '@/app/lib/geolocation';
import MapControls from '@/app/components/map/MapControls';

const Map = dynamic(() => import('@/app/components/map/MapContainer'), {
  loading: () => <div className='w-full h-full flex items-center justify-center text-white'>Loading map...</div>,
  ssr: false,
});

const LandmarkMarkers = dynamic(() => import('@/app/components/map/LandmarkMarkers'), {
  ssr: false,
});

const HouseholderMarkers = dynamic(() => import('@/app/components/map/HouseholderMarkers'), {
  ssr: false,
});

const HeatmapLayer = dynamic(() => import('@/app/components/map/HeatmapLayer'), {
  ssr: false,
});

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

export default function MapPage() {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [householders, setHouseholders] = useState<Householder[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showHouseholders, setShowHouseholders] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const [landmarkTypes, setLandmarkTypes] = useState<Landmark['landmark_type'][]>([]);
  const [selectedLandmarkTypes, setSelectedLandmarkTypes] = useState<Landmark['landmark_type'][]>([]);

  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [selectedHouseholder, setSelectedHouseholder] = useState<Householder | null>(null);
  const [nearbyHouseholders, setNearbyHouseholders] = useState<Householder[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch landmarks
        const landmarksRes = await fetch('/api/landmarks');
        if (landmarksRes.ok) {
          const data = await landmarksRes.json();
          setLandmarks(data.data);

          // Get unique landmark types
          const types = Array.from(
            new Set(data.data.map((l: Landmark) => l.landmark_type))
          ) as Landmark['landmark_type'][];
          setLandmarkTypes(types);
          setSelectedLandmarkTypes(types);
        }

        // Fetch heatmap data
        const heatmapRes = await fetch('/api/map/heatmap');
        if (heatmapRes.ok) {
          const data = await heatmapRes.json();
          setHeatmapData(data.data);
        }

        // Fetch all householders from API (if available)
        const householdersRes = await fetch('/api/householders');
        if (householdersRes.ok) {
          const data = await householdersRes.json();
          setHouseholders(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle landmark selection
  const handleLandmarkClick = async (landmark: Landmark) => {
    setSelectedLandmark(landmark);

    try {
      const res = await fetch(
        `/api/map/nearby-householders?landmark_id=${landmark.id}&radius=1`
      );
      if (res.ok) {
        const data = await res.json();
        setNearbyHouseholders(data.data);
      }
    } catch (error) {
      console.error('Error fetching nearby householders:', error);
    }
  };

  // Filter landmarks by selected types
  const filteredLandmarks = landmarks.filter((l) => selectedLandmarkTypes.includes(l.landmark_type));

  if (loading) {
    return <div className='w-full h-screen flex items-center justify-center bg-gray-900 text-white'>Loading...</div>;
  }

  return (
    <div className='flex h-screen bg-gray-900'>
      {/* Sidebar */}
      <div className='w-80 bg-gray-800 text-white overflow-y-auto p-4 border-r border-gray-700 shadow-lg'>
        <h1 className='text-2xl font-bold mb-2'>Hosana Housing Map</h1>
        <p className='text-sm text-gray-400 mb-6'>Geolocation & Analytics Dashboard</p>

        <MapControls
          showLandmarks={showLandmarks}
          showHouseholders={showHouseholders}
          showHeatmap={showHeatmap}
          onToggleLandmarks={setShowLandmarks}
          onToggleHouseholders={setShowHouseholders}
          onToggleHeatmap={setShowHeatmap}
          landmarkTypes={landmarkTypes}
          selectedLandmarkTypes={selectedLandmarkTypes}
          onLandmarkTypeChange={setSelectedLandmarkTypes}
        />

        {/* Statistics */}
        <div className='mt-6 grid grid-cols-2 gap-4'>
          <div className='bg-gray-700 rounded-lg p-3'>
            <p className='text-xs text-gray-400'>Landmarks</p>
            <p className='text-2xl font-bold'>{landmarks.length}</p>
          </div>
          <div className='bg-gray-700 rounded-lg p-3'>
            <p className='text-xs text-gray-400'>Householders</p>
            <p className='text-2xl font-bold'>{householders.length}</p>
          </div>
        </div>

        {/* Selected Landmark Info */}
        {selectedLandmark && (
          <div className='mt-6 bg-gradient-to-br from-amber-700 to-amber-800 rounded-lg p-4 border border-amber-600'>
            <h3 className='font-semibold text-lg mb-3 text-white'>{selectedLandmark.name}</h3>
            <div className='space-y-2 text-sm'>
              <p className='text-amber-100'>
                <strong>Type:</strong> {selectedLandmark.landmark_type}
              </p>
              {selectedLandmark.rating && (
                <p className='text-amber-100'>
                  <strong>Rating:</strong> {selectedLandmark.rating}/5
                </p>
              )}
              {selectedLandmark.address && (
                <p className='text-amber-100'>
                  <strong>Address:</strong> {selectedLandmark.address}
                </p>
              )}
              {selectedLandmark.phone && (
                <p className='text-amber-100'>
                  <strong>Phone:</strong> {selectedLandmark.phone}
                </p>
              )}
            </div>

            {/* Nearby Householders */}
            {nearbyHouseholders.length > 0 && (
              <div className='mt-4 pt-4 border-t border-amber-600'>
                <h4 className='font-semibold mb-3 text-white'>
                  Nearby Householders ({nearbyHouseholders.length})
                </h4>
                <div className='space-y-2 max-h-64 overflow-y-auto'>
                  {nearbyHouseholders.map((householder) => (
                    <div
                      key={householder.id}
                      className='bg-amber-600 hover:bg-amber-500 p-2 rounded cursor-pointer transition'
                      onClick={() => setSelectedHouseholder(householder)}
                    >
                      <p className='font-medium text-sm text-white'>{householder.name}</p>
                      <p className='text-xs text-amber-100'>{householder.house_number}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Householder Info */}
        {selectedHouseholder && (
          <div className='mt-6 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg p-4 border border-blue-600'>
            <h3 className='font-semibold text-lg mb-3 text-white'>{selectedHouseholder.name}</h3>
            <div className='space-y-2 text-sm'>
              <p className='text-blue-100'>
                <strong>House:</strong> {selectedHouseholder.house_number}
              </p>
              <p className='text-blue-100'>
                <strong>Kebele:</strong> {selectedHouseholder.kebele}
              </p>
              {selectedHouseholder.father_name && (
                <p className='text-blue-100'>
                  <strong>Father:</strong> {selectedHouseholder.father_name}
                </p>
              )}
              {selectedHouseholder.email && (
                <p className='text-blue-100'>
                  <strong>Email:</strong> {selectedHouseholder.email}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className='flex-1 relative'>
        <Map>
          {showLandmarks && (
            <LandmarkMarkers landmarks={filteredLandmarks} onMarkerClick={handleLandmarkClick} />
          )}
          {showHouseholders && (
            <HouseholderMarkers householders={householders} onMarkerClick={setSelectedHouseholder} />
          )}
          {showHeatmap && <HeatmapLayer data={heatmapData} visible={showHeatmap} />}
        </Map>
      </div>
    </div>
  );
}
