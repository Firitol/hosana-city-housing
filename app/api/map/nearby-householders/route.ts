import { NextRequest, NextResponse } from 'next/server';
import * as geolocation from '@/app/lib/geolocation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const landmarkId = searchParams.get('landmark_id');
    const radius = parseFloat(searchParams.get('radius') || '1');

    if (!landmarkId) {
      return NextResponse.json(
        { success: false, error: 'landmark_id is required' },
        { status: 400 }
      );
    }

    const householders = await geolocation.getNearbyHouseholders(landmarkId, radius);

    return NextResponse.json({ success: true, data: householders });
  } catch (error) {
    console.error('Error fetching nearby householders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch nearby householders' },
      { status: 500 }
    );
  }
}
