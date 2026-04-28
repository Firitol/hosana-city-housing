import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface Landmark {
  id: string;
  name: string;
  landmark_type: 'HOTEL' | 'MARKET' | 'HOSPITAL' | 'SCHOOL' | 'GOVERNMENT' | 'RELIGIOUS' | 'OTHER';
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  rating?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Householder {
  id: string;
  name: string;
  father_name?: string;
  house_number: string;
  mender: string;
  kebele: string;
  latitude?: number;
  longitude?: number;
  phone_encrypted?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface NearbyLandmark extends Landmark {
  distance_km: number;
}

export interface NearbyHouseholder extends Householder {
  distance_km: number;
}

// Haversine formula for distance calculation (client-side fallback)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return Math.round(distance * 1000) / 1000; // Round to 3 decimal places
}

// Get all landmarks
export async function getAllLandmarks(): Promise<Landmark[]> {
  try {
    const landmarks = await sql`
      SELECT id, name, landmark_type, latitude, longitude, address, phone, rating, description, is_active, created_at, updated_at
      FROM landmarks
      WHERE is_active = true
      ORDER BY name ASC
    `;
    return landmarks as Landmark[];
  } catch (error) {
    console.error('Error fetching landmarks:', error);
    return [];
  }
}

// Get landmark by ID
export async function getLandmarkById(id: string): Promise<Landmark | null> {
  try {
    const result = await sql`
      SELECT id, name, landmark_type, latitude, longitude, address, phone, rating, description, is_active, created_at, updated_at
      FROM landmarks
      WHERE id = ${id}
    `;
    return result[0] as Landmark || null;
  } catch (error) {
    console.error('Error fetching landmark:', error);
    return null;
  }
}

// Get nearby landmarks (using server-side database function)
export async function getNearbyLandmarks(
  latitude: number,
  longitude: number,
  radiusKm: number = 2.0
): Promise<NearbyLandmark[]> {
  try {
    const landmarks = await sql`
      SELECT 
        id, name, landmark_type, latitude, longitude, address, phone, rating, description, is_active, created_at, updated_at,
        calculate_distance_km(${latitude}, ${longitude}, latitude, longitude) as distance_km
      FROM landmarks
      WHERE is_active = true
      AND calculate_distance_km(${latitude}, ${longitude}, latitude, longitude) <= ${radiusKm}
      ORDER BY distance_km ASC
    `;
    return landmarks as NearbyLandmark[];
  } catch (error) {
    console.error('Error fetching nearby landmarks:', error);
    return [];
  }
}

// Get nearby householders from a landmark
export async function getNearbyHouseholders(
  landmarkId: string,
  radiusKm: number = 1.0
): Promise<NearbyHouseholder[]> {
  try {
    const householders = await sql`
      SELECT 
        h.id, h.name, h.father_name, h.house_number, h.mender, h.kebele, h.latitude, h.longitude, h.email, h.created_at, h.updated_at,
        calculate_distance_km(l.latitude, l.longitude, h.latitude, h.longitude) as distance_km
      FROM householders h, landmarks l
      WHERE l.id = ${landmarkId}
      AND h.is_deleted = false
      AND h.latitude IS NOT NULL
      AND h.longitude IS NOT NULL
      AND calculate_distance_km(l.latitude, l.longitude, h.latitude, h.longitude) <= ${radiusKm}
      ORDER BY distance_km ASC
    `;
    return householders as NearbyHouseholder[];
  } catch (error) {
    console.error('Error fetching nearby householders:', error);
    return [];
  }
}

// Get heatmap data (coordinates with counts)
export async function getHeatmapData(): Promise<Array<{ lat: number; lng: number; weight: number }>> {
  try {
    const result = await sql`
      SELECT 
        latitude as lat, longitude as lng,
        COUNT(*) as weight
      FROM householders
      WHERE is_deleted = false
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      GROUP BY latitude, longitude
    `;
    return result as Array<{ lat: number; lng: number; weight: number }>;
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return [];
  }
}

// Create landmark
export async function createLandmark(
  name: string,
  landmarkType: Landmark['landmark_type'],
  latitude: number,
  longitude: number,
  address?: string,
  phone?: string,
  rating?: number,
  description?: string
): Promise<Landmark | null> {
  try {
    const result = await sql`
      INSERT INTO landmarks (name, landmark_type, latitude, longitude, address, phone, rating, description)
      VALUES (${name}, ${landmarkType}, ${latitude}, ${longitude}, ${address || null}, ${phone || null}, ${rating || null}, ${description || null})
      RETURNING id, name, landmark_type, latitude, longitude, address, phone, rating, description, is_active, created_at, updated_at
    `;
    return result[0] as Landmark || null;
  } catch (error) {
    console.error('Error creating landmark:', error);
    return null;
  }
}

// Update landmark
export async function updateLandmark(
  id: string,
  updates: Partial<Landmark>
): Promise<Landmark | null> {
  try {
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        setClauses.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClauses.length === 0) return null;

    values.push(id);

    const query = `
      UPDATE landmarks
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, name, landmark_type, latitude, longitude, address, phone, rating, description, is_active, created_at, updated_at
    `;

    const result = await sql.query(query, values);
    return result.rows[0] as Landmark || null;
  } catch (error) {
    console.error('Error updating landmark:', error);
    return null;
  }
}

// Delete landmark (soft delete)
export async function deleteLandmark(id: string): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE landmarks
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return true;
  } catch (error) {
    console.error('Error deleting landmark:', error);
    return false;
  }
}

// Update householder location
export async function updateHouseholderLocation(
  householderId: string,
  latitude: number,
  longitude: number
): Promise<Householder | null> {
  try {
    const result = await sql`
      UPDATE householders
      SET latitude = ${latitude}, longitude = ${longitude}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${householderId}
      RETURNING id, name, father_name, house_number, mender, kebele, latitude, longitude, email, created_at, updated_at
    `;
    return result[0] as Householder || null;
  } catch (error) {
    console.error('Error updating householder location:', error);
    return null;
  }
}

// Get householders within a bounding box
export async function getHouseholdersInBounds(
  swLat: number,
  swLng: number,
  neLat: number,
  neLng: number
): Promise<Householder[]> {
  try {
    const householders = await sql`
      SELECT id, name, father_name, house_number, mender, kebele, latitude, longitude, email, created_at, updated_at
      FROM householders
      WHERE is_deleted = false
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND latitude >= ${swLat}
      AND latitude <= ${neLat}
      AND longitude >= ${swLng}
      AND longitude <= ${neLng}
      ORDER BY name ASC
    `;
    return householders as Householder[];
  } catch (error) {
    console.error('Error fetching householders in bounds:', error);
    return [];
  }
}
