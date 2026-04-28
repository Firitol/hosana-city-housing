import { NextRequest, NextResponse } from 'next/server';
import * as geolocation from '@/app/lib/geolocation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseFloat(searchParams.get('radius') || '2');

    if (latitude === 0 || longitude === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid latitude or longitude' },
        { status: 400 }
      );
    }

    const landmarks = await geolocation.getNearbyLandmarks(latitude, longitude, radius);

    return NextResponse.json({ success: true, data: landmarks });
  } catch (error) {
    console.error('Error fetching nearby landmarks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch nearby landmarks' },
      { status: 500 }
    );
  }
}
