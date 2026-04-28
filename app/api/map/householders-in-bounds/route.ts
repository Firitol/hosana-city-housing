import { NextRequest, NextResponse } from 'next/server';
import * as geolocation from '@/app/lib/geolocation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const swLat = parseFloat(searchParams.get('swLat') || '0');
    const swLng = parseFloat(searchParams.get('swLng') || '0');
    const neLat = parseFloat(searchParams.get('neLat') || '0');
    const neLng = parseFloat(searchParams.get('neLng') || '0');

    if (swLat === 0 || swLng === 0 || neLat === 0 || neLng === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid bounding box coordinates' },
        { status: 400 }
      );
    }

    const householders = await geolocation.getHouseholdersInBounds(swLat, swLng, neLat, neLng);

    return NextResponse.json({ success: true, data: householders });
  } catch (error) {
    console.error('Error fetching householders in bounds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch householders in bounds' },
      { status: 500 }
    );
  }
}
