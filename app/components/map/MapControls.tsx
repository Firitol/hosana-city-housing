'use client';

import { useState } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Landmark } from '@/app/lib/geolocation';

interface MapControlsProps {
  showLandmarks: boolean;
  showHouseholders: boolean;
  showHeatmap: boolean;
  onToggleLandmarks: (show: boolean) => void;
  onToggleHouseholders: (show: boolean) => void;
  onToggleHeatmap: (show: boolean) => void;
  landmarkTypes: Landmark['landmark_type'][];
  selectedLandmarkTypes: Landmark['landmark_type'][];
  onLandmarkTypeChange: (types: Landmark['landmark_type'][]) => void;
}

export default function MapControls({
  showLandmarks,
  showHouseholders,
  showHeatmap,
  onToggleLandmarks,
  onToggleHouseholders,
  onToggleHeatmap,
  landmarkTypes,
  selectedLandmarkTypes,
  onLandmarkTypeChange,
}: MapControlsProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleLandmarkType = (type: Landmark['landmark_type']) => {
    if (selectedLandmarkTypes.includes(type)) {
      onLandmarkTypeChange(selectedLandmarkTypes.filter((t) => t !== type));
    } else {
      onLandmarkTypeChange([...selectedLandmarkTypes, type]);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-lg p-4 max-w-sm'>
      <div
        className='flex items-center justify-between cursor-pointer mb-4'
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className='font-semibold text-lg'>Map Layers</h3>
        <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className='space-y-4'>
          {/* Landmarks Toggle */}
          <div className='border-b pb-4'>
            <button
              onClick={() => onToggleLandmarks(!showLandmarks)}
              className='flex items-center justify-between w-full p-2 hover:bg-gray-100 rounded'
            >
              <span className='font-medium text-sm'>Landmarks</span>
              {showLandmarks ? <Eye className='w-4 h-4' /> : <EyeOff className='w-4 h-4' />}
            </button>

            {showLandmarks && landmarkTypes.length > 0 && (
              <div className='mt-2 ml-2 space-y-2'>
                {landmarkTypes.map((type) => (
                  <label key={type} className='flex items-center text-sm cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={selectedLandmarkTypes.includes(type)}
                      onChange={() => toggleLandmarkType(type)}
                      className='w-4 h-4 mr-2'
                    />
                    <span className='text-gray-700'>{type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Householders Toggle */}
          <div className='border-b pb-4'>
            <button
              onClick={() => onToggleHouseholders(!showHouseholders)}
              className='flex items-center justify-between w-full p-2 hover:bg-gray-100 rounded'
            >
              <span className='font-medium text-sm'>Householders</span>
              {showHouseholders ? <Eye className='w-4 h-4' /> : <EyeOff className='w-4 h-4' />}
            </button>
          </div>

          {/* Heatmap Toggle */}
          <div>
            <button
              onClick={() => onToggleHeatmap(!showHeatmap)}
              className='flex items-center justify-between w-full p-2 hover:bg-gray-100 rounded'
            >
              <span className='font-medium text-sm'>Heatmap</span>
              {showHeatmap ? <Eye className='w-4 h-4' /> : <EyeOff className='w-4 h-4' />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
