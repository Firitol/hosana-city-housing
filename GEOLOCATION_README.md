# Hosana City Housing - Geolocation & Mapping System

A comprehensive geolocation-enabled housing management system built with Next.js, React-Leaflet, and Neon PostgreSQL.

## Features Overview

### Interactive Map Dashboard
- Real-time visualization of landmarks (hotels, markets, hospitals, schools, government offices)
- Householder location display with marker clustering
- Heatmap showing population concentration
- Smooth zoom and pan controls

### Landmark Management
- Pre-loaded 6 hotels around Hosana City center
- Admin interface to create, edit, and delete landmarks
- Search and filter by landmark type
- View ratings and contact information

### Location Intelligence
- Calculate distances between any two points
- Find nearby householders within configurable radius
- Proximity-based analytics and reporting
- Heatmap visualization of population density

### Location Management
- Interactive location picker with map interface
- Update householder coordinates
- Manual coordinate input with validation
- GPS coordinate history tracking

### Security & Audit
- Role-based access control (SUPER_ADMIN, MAYOR, MENDER_STAFF, AUDITOR)
- Comprehensive audit logging for all landmark changes
- User identification for all modifications
- Soft delete for data preservation

## Quick Start

### 1. Database Setup
```bash
# Run migration to create landmarks table and PostGIS functions
node scripts/run-geolocation-migration.js
```

### 2. Start Application
```bash
npm run dev
# Navigate to http://localhost:3000/map
```

### 3. View the Map
- See 6 pre-loaded hotels and sample householders
- Toggle layers using sidebar controls
- Click markers to view details
- Select landmarks to see nearby householders

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React Leaflet 4** - Interactive maps
- **Leaflet 1.9** - Mapping library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **TypeScript** - Type safety

### Backend
- **Node.js** - Runtime
- **Neon PostgreSQL** - Database with PostGIS
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Database Features
- **PostGIS** - Spatial database capabilities
- **Distance Functions** - Haversine formula calculations
- **Spatial Indexes** - GIST indexes for performance
- **Audit Logging** - Complete change tracking

## Key Files

### Libraries & Utilities
- `app/lib/geolocation.ts` - Core geolocation functions and database queries

### Components
- `app/components/map/MapContainer.tsx` - Base map wrapper
- `app/components/map/LandmarkMarkers.tsx` - Landmark display
- `app/components/map/HouseholderMarkers.tsx` - Householder display
- `app/components/map/HeatmapLayer.tsx` - Heatmap visualization
- `app/components/map/MapControls.tsx` - Layer toggle controls
- `app/components/LocationPicker.tsx` - Interactive location selector
- `app/components/HouseholderLocationForm.tsx` - Update locations

### Pages
- `app/map.tsx` - Main dashboard component
- `app/map/page.tsx` - Map route handler
- `app/admin/landmarks/page.tsx` - Admin landmark management

### API Routes
- `app/api/landmarks/route.ts` - List and create landmarks
- `app/api/landmarks/nearby/route.ts` - Nearby landmarks query
- `app/api/landmarks/[id]/route.ts` - Landmark details and delete
- `app/api/map/heatmap/route.ts` - Heatmap data
- `app/api/map/nearby-householders/route.ts` - Proximity queries
- `app/api/map/householders-in-bounds/route.ts` - Bounds queries

## API Reference

### Landmarks

#### List All Landmarks
```
GET /api/landmarks

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Victory Hotel",
      "landmark_type": "HOTEL",
      "latitude": 7.5505,
      "longitude": 37.8548,
      "rating": 4.2,
      "address": "Main Street",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Landmark (Admin)
```
POST /api/landmarks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Hospital Name",
  "landmark_type": "HOSPITAL",
  "latitude": 7.5500,
  "longitude": 37.8550,
  "address": "Street Address",
  "phone": "+251912345678",
  "rating": 4.5,
  "description": "Optional description"
}
```

#### Get Landmark by ID
```
GET /api/landmarks/{id}

Response: Single landmark object
```

#### Delete Landmark (Admin)
```
DELETE /api/landmarks/{id}
Authorization: Bearer YOUR_TOKEN
```

### Location Queries

#### Get Nearby Landmarks
```
GET /api/landmarks/nearby
  ?latitude=7.54978
  &longitude=37.85374
  &radius=2.0

Response:
{
  "success": true,
  "data": [
    {
      ...landmark,
      "distance_km": 0.523
    }
  ]
}
```

#### Get Heatmap Data
```
GET /api/map/heatmap

Response:
{
  "success": true,
  "data": [
    { "lat": 7.5500, "lng": 37.8550, "weight": 5 },
    { "lat": 7.5505, "lng": 37.8548, "weight": 3 }
  ]
}
```

#### Get Nearby Householders
```
GET /api/map/nearby-householders
  ?landmark_id=uuid
  &radius=1.0

Response:
{
  "success": true,
  "data": [
    {
      ...householder,
      "distance_km": 0.234
    }
  ]
}
```

#### Get Householders in Bounds
```
GET /api/map/householders-in-bounds
  ?swLat=7.54&swLng=37.84
  &neLat=7.55&neLng=37.86

Response:
{
  "success": true,
  "data": [householders in bounding box]
}
```

## Database Schema

### landmarks
```sql
id              UUID PRIMARY KEY
name            VARCHAR(100) UNIQUE NOT NULL
landmark_type   VARCHAR(50) NOT NULL (HOTEL|MARKET|HOSPITAL|SCHOOL|GOVERNMENT|RELIGIOUS|OTHER)
latitude        FLOAT NOT NULL
longitude       FLOAT NOT NULL
location        GEOMETRY(Point, 4326) - PostGIS geometry
address         TEXT
phone           VARCHAR(20)
rating          FLOAT
description     TEXT
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### landmark_audit_logs
```sql
id              BIGSERIAL PRIMARY KEY
landmark_id     UUID REFERENCES landmarks(id)
user_id         UUID REFERENCES users(id)
action          VARCHAR(50) NOT NULL (CREATE|UPDATE|DELETE)
old_values      JSONB
new_values      JSONB
timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## Usage Examples

### View Map
1. Navigate to `/map`
2. See all landmarks and householders
3. Use sidebar controls to toggle layers
4. Click any marker for details

### Add New Landmark
1. Go to `/admin/landmarks` (admin only)
2. Click "Add Landmark"
3. Fill in landmark details
4. Click "Create Landmark"

### Update Householder Location
1. Open householder record
2. Click "Pick Location" button
3. Either click on map or enter coordinates
4. Click "Confirm Location"
5. Click "Save Location"

### Find Nearby Householders
1. Click a landmark on the map
2. View "Nearby Householders" section
3. Click householder to view details

### View Heatmap
1. Go to `/map`
2. In sidebar, toggle "Heatmap"
3. Circles show concentration of householders
4. Size and color indicate density

## Configuration

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
JWT_SECRET=your-secret-key
JWT_EXPIRY=8h
```

### Map Center
Default: Hosana City (7.54978, 37.85374)
Configurable in `app/components/map/MapContainer.tsx`

### Zoom Levels
- Default zoom: 14 (street level)
- Min zoom: 1 (world)
- Max zoom: 19 (building details)

### Search Radius
- Nearby landmarks: 2km default
- Nearby householders: 1km default
- Adjustable via API parameters

## Performance

### Optimization Techniques
- Spatial indexes on location columns
- Client-side marker clustering
- Lazy loading of map tiles
- Component-level code splitting

### Database Queries
- Indexed distance calculations
- Bounding box queries use spatial indexes
- Filtered queries on `is_active` flag
- Prepared statements for security

### Rendering
- Dynamic imports for map components (SSR: false)
- Memoization of marker components
- Efficient re-renders with React state management

## Security

### Access Control
- **SUPER_ADMIN**: Full access (create, edit, delete landmarks)
- **MAYOR**: Read-only access
- **MENDER_STAFF**: Read landmarks, update householder locations
- **AUDITOR**: Read-only access

### Authentication
- JWT token required for create/delete operations
- Token verification on all protected routes
- Role checking before sensitive operations

### Data Protection
- Soft deletes preserve historical data
- Audit logging for all modifications
- User identification on all changes
- Encrypted phone numbers for householders

## Troubleshooting

### Map Not Loading
- Clear browser cache
- Check browser console for errors
- Verify `/api/landmarks` returns data
- Ensure Leaflet CSS is loaded

### Markers Not Showing
- Verify landmarks have valid coordinates
- Check that `is_active = true` in database
- Clear map cache: F5 to refresh
- Check browser console for JS errors

### Heatmap Not Visible
- Toggle heatmap in sidebar controls
- Verify householders have coordinates
- Check `/api/map/heatmap` endpoint
- Ensure weight values are present

### Location Picker Issues
- Ensure map container has height
- Check Leaflet is properly initialized
- Verify coordinates are in valid range
- Clear browser storage if stuck

## Contributing

When adding new geolocation features:

1. Update `app/lib/geolocation.ts` with utility functions
2. Create API routes in `app/api/`
3. Add components in `app/components/map/`
4. Update database schema if needed
5. Run migrations
6. Add documentation

## License

Part of Hosana City Housing Management System.
All rights reserved.

## Support

For issues or questions:
1. Check GEOLOCATION_SETUP.md for detailed setup
2. Review API examples above
3. Check browser console for errors
4. Verify database connectivity
5. Review audit logs for changes
