# Geolocation-Enabled Housing Management System - Setup Guide

## Overview

The Hosana City Housing Management System now includes comprehensive geolocation features with interactive mapping, landmark management, and proximity-based analytics.

## What's New

### Database Enhancements
- **Landmarks Table** - Store hotels, markets, hospitals, schools, government offices, and religious sites
- **PostGIS Support** - Geographic spatial queries and distance calculations
- **Audit Logging** - Track all landmark modifications
- **Spatial Indexes** - Optimized queries for location-based searches

### Components & Features
- **Interactive Map Dashboard** - View landmarks and householders on a map
- **Layer Controls** - Toggle landmarks, householders, and heatmap visibility
- **Proximity Analytics** - Find nearby householders for selected landmarks
- **Location Picker** - Select coordinates using map interface
- **Heatmap Visualization** - View concentration of householders

### API Routes
- `GET /api/landmarks` - List all landmarks
- `POST /api/landmarks` - Create landmark (admin only)
- `DELETE /api/landmarks/[id]` - Delete landmark (admin only)
- `GET /api/landmarks/nearby` - Find nearby landmarks
- `GET /api/map/heatmap` - Get heatmap data
- `GET /api/map/nearby-householders` - Find nearby householders from landmark
- `GET /api/map/householders-in-bounds` - Find householders in map bounds

## Setup Instructions

### 1. Verify Database URL

Ensure your Neon PostgreSQL DATABASE_URL is set:

```bash
# Check environment variables
echo $DATABASE_URL
# Should output: postgresql://user:password@host/db?sslmode=require
```

### 2. Run Database Migrations

Execute the geolocation migration script to create tables and functions:

```bash
# From project root
node scripts/run-geolocation-migration.js
```

Expected output:
```
Starting geolocation migration...
Found X SQL statements to execute
✓ Statement 1 completed
...
✅ Migration completed!
✓ All tables created successfully
```

### 3. Verify Database Setup

Connect to Neon and verify tables exist:

```sql
-- Check landmarks table
SELECT COUNT(*) FROM landmarks WHERE is_active = true;

-- Check audit logs table
SELECT COUNT(*) FROM landmark_audit_logs;

-- Check if sample data was inserted
SELECT name, landmark_type, latitude, longitude FROM landmarks LIMIT 5;
```

### 4. Start the Application

```bash
npm run dev
# Application will start on http://localhost:3000
```

### 5. Access Map Features

#### View Interactive Map
- Navigate to `/map` to view the geolocation dashboard
- Map centered on Hosana City (7.54978, 37.85374)
- 6 hotel landmarks pre-loaded

#### Control Map Layers
- **Landmarks Toggle** - Show/hide hotels and other landmarks
- **Filter by Type** - Filter landmarks by category (HOTEL, MARKET, etc.)
- **Householders Toggle** - Show/hide householder locations
- **Heatmap Toggle** - View concentration heatmap

#### Interact with Map
- **Click Landmarks** - View landmark details and nearby householders
- **Click Householders** - View householder information
- **Sidebar Display** - Selected item details appear in left panel

#### Admin Landmark Management
- Navigate to `/admin/landmarks` (admin only)
- Create new landmarks with coordinates
- Edit existing landmarks
- Delete landmarks (soft delete)
- Bulk import from CSV (future enhancement)

## Database Schema

### Landmarks Table
```sql
CREATE TABLE landmarks (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    landmark_type VARCHAR(50) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    location GEOMETRY(Point, 4326),
    address TEXT,
    phone VARCHAR(20),
    rating FLOAT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Landmark Audit Logs Table
```sql
CREATE TABLE landmark_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    landmark_id UUID REFERENCES landmarks(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP
);
```

## Utility Functions

### Distance Calculation
```typescript
import { calculateDistance } from '@/app/lib/geolocation';

// Client-side calculation (Haversine formula)
const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
console.log(`Distance: ${distanceKm} km`);
```

### Get Nearby Landmarks
```typescript
import { getNearbyLandmarks } from '@/app/lib/geolocation';

const nearby = await getNearbyLandmarks(7.54978, 37.85374, 2.0); // 2km radius
console.log(`Found ${nearby.length} landmarks within 2km`);
```

### Get Nearby Householders
```typescript
import { getNearbyHouseholders } from '@/app/lib/geolocation';

const householders = await getNearbyHouseholders(landmarkId, 1.0); // 1km radius
console.log(`Found ${householders.length} householders within 1km`);
```

### Update Householder Location
```typescript
import { updateHouseholderLocation } from '@/app/lib/geolocation';

const updated = await updateHouseholderLocation(householderId, 7.5500, 37.8550);
console.log(`Updated location for ${updated.name}`);
```

## Sample Data

### Pre-loaded Hotels (Landmarks)
1. **Victory Hotel Hossana** - 7.5505, 37.8548 (Rating: 4.2/5)
2. **Lemma International Hotel** - 7.5489, 37.8560 (Rating: 4.2/5)
3. **Hotel Shambalala** - 7.5578, 37.8578 (Rating: 3.7/5)
4. **Ediget Hotel** - 7.5512, 37.8525 (Rating: 3.9/5)
5. **Woze Star Hotel** - 7.5530, 37.8505 (Rating: 3.7/5)
6. **Beteket Hotel** - 7.5520, 37.8530 (Rating: 3.5/5)

### Hosana Center Coordinates
```
Latitude:  7.54978
Longitude: 37.85374
Elevation: 2177m above sea level
```

## API Examples

### Get All Landmarks
```bash
curl http://localhost:3000/api/landmarks
```

### Create Landmark (Admin)
```bash
curl -X POST http://localhost:3000/api/landmarks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Hospital",
    "landmark_type": "HOSPITAL",
    "latitude": 7.5500,
    "longitude": 37.8550,
    "address": "Main Street",
    "rating": 4.5
  }'
```

### Get Nearby Landmarks
```bash
curl "http://localhost:3000/api/landmarks/nearby?latitude=7.54978&longitude=37.85374&radius=2"
```

### Get Heatmap Data
```bash
curl http://localhost:3000/api/map/heatmap
```

### Get Nearby Householders
```bash
curl "http://localhost:3000/api/map/nearby-householders?landmark_id=LANDMARK_UUID&radius=1"
```

## File Structure

```
app/
├── lib/
│   └── geolocation.ts              # Core utilities and functions
├── api/
│   ├── landmarks/
│   │   ├── route.ts                # List and create landmarks
│   │   ├── nearby/
│   │   │   └── route.ts            # Get nearby landmarks
│   │   └── [id]/
│   │       └── route.ts            # Get and delete landmark
│   └── map/
│       ├── heatmap/
│       │   └── route.ts            # Heatmap data
│       ├── nearby-householders/
│       │   └── route.ts            # Nearby householders
│       └── householders-in-bounds/
│           └── route.ts            # Householders in bounds
├── components/
│   ├── map/
│   │   ├── MapContainer.tsx        # Base map wrapper
│   │   ├── LandmarkMarkers.tsx     # Landmark markers
│   │   ├── HouseholderMarkers.tsx  # Householder markers
│   │   ├── HeatmapLayer.tsx        # Heatmap visualization
│   │   └── MapControls.tsx         # Layer controls
│   ├── LocationPicker.tsx          # Interactive location selector
│   └── HouseholderLocationForm.tsx # Update householder location
├── admin/
│   └── landmarks/
│       └── page.tsx                # Landmark management UI
├── map.tsx                         # Main map dashboard
└── map/
    └── page.tsx                    # Map page route

scripts/
├── add-geolocation.sql             # Migration SQL
└── run-geolocation-migration.js    # Migration runner
```

## Troubleshooting

### PostgreSQL Extension Not Available
If you see errors about PostGIS:
```
ERROR: extension "postgis" does not exist
```

This is normal on some Neon instances. The migration will work without PostGIS by using the fallback Haversine calculation.

### Landmarks Not Showing on Map
1. Check database connection: `node scripts/run-geolocation-migration.js`
2. Verify landmarks exist: `SELECT COUNT(*) FROM landmarks;`
3. Check browser console for fetch errors
4. Verify API response: Visit `/api/landmarks` directly

### Map Not Loading
1. Ensure you're in a browser that supports Leaflet
2. Check that leaflet CSS is loaded: Look for `leaflet.css` in dev tools
3. Clear browser cache and reload
4. Check console for errors with `react-leaflet`

### Heatmap Not Showing
1. Toggle heatmap in map controls (eye icon)
2. Verify householders have coordinates set
3. Check `/api/map/heatmap` endpoint for data

## Performance Optimization

### Database Indexes
- `landmarks.location` - GIST spatial index
- `householders.location` - GIST spatial index  
- `landmarks.landmark_type` - B-tree index
- `landmarks.is_active` - B-tree index

### Query Optimization
- Queries filtered by `is_active = true` use indexes
- Spatial indexes automatically used for distance queries
- Householders in bounds uses index on coordinates

### Client-Side Caching
- Map layers fetched once on page load
- Use SWR for automatic revalidation
- Local state management for UI controls

## Security Considerations

### Admin-Only Features
- Create landmarks: Requires `SUPER_ADMIN` role
- Delete landmarks: Requires `SUPER_ADMIN` role
- Audit logs: Tracked for all modifications

### User Roles
- `SUPER_ADMIN` - Full access to all features
- `MAYOR` - View-only access to map
- `MENDER_STAFF` - View map and update householder locations
- `AUDITOR` - View-only access

### Data Privacy
- Phone numbers encrypted in householders table
- Email addresses stored but not displayed on map
- Coordinates always visible to authorized users

## Future Enhancements

1. **Route Optimization** - Calculate optimal routes between landmarks
2. **Bulk Import** - CSV/GeoJSON import for landmarks
3. **Custom Markers** - User-uploaded marker icons
4. **Offline Mode** - Download map tiles for offline use
5. **Mobile App** - React Native version with GPS
6. **Advanced Analytics** - Population density, coverage analysis
7. **Real-time Updates** - WebSocket updates for live data
8. **3D Map View** - 3D terrain visualization

## Support & Documentation

- Map Component: `app/components/map/`
- Utilities: `app/lib/geolocation.ts`
- API Documentation: Check individual route files
- Configuration: `.env.local` for DATABASE_URL

## License

This geolocation system is part of the Hosana City Housing Management System.
All rights reserved.
