import { NextRequest, NextResponse } from 'next/server';
import * as geolocation from '@/app/lib/geolocation';

export async function GET(request: NextRequest) {
  try {
    const heatmapData = await geolocation.getHeatmapData();
    return NextResponse.json({ success: true, data: heatmapData });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch heatmap data' },
      { status: 500 }
    );
  }
}
