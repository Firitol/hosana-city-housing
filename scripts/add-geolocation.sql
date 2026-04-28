-- Add geospatial capabilities to Neon
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Landmarks Table (Hotels, Markets, etc.)
CREATE TABLE landmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    landmark_type VARCHAR(50) NOT NULL CHECK (landmark_type IN ('HOTEL', 'MARKET', 'HOSPITAL', 'SCHOOL', 'GOVERNMENT', 'RELIGIOUS', 'OTHER')),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    location GEOMETRY(Point, 4326),
    address TEXT,
    phone VARCHAR(20),
    rating FLOAT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for landmarks
CREATE INDEX idx_landmarks_location ON landmarks USING GIST(location);
CREATE INDEX idx_landmarks_type ON landmarks(landmark_type);

-- Update householders table with PostGIS geometry column
ALTER TABLE householders ADD COLUMN location GEOMETRY(Point, 4326);

-- Create spatial index for householders
CREATE INDEX idx_householders_location ON householders USING GIST(location);

-- Create function to calculate distance between two points in kilometers
CREATE OR REPLACE FUNCTION calculate_distance_km(lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT)
RETURNS FLOAT AS $$
DECLARE
    radlat1 FLOAT;
    radlat2 FLOAT;
    radlon1 FLOAT;
    radlon2 FLOAT;
    x FLOAT;
    y FLOAT;
    distance FLOAT;
BEGIN
    radlat1 := lat1 * PI() / 180.0;
    radlat2 := lat2 * PI() / 180.0;
    radlon1 := lon1 * PI() / 180.0;
    radlon2 := lon2 * PI() / 180.0;
    
    x := (radlon2 - radlon1) * COS((radlat1 + radlat2) / 2.0);
    y := (radlat2 - radlat1);
    
    distance := SQRT(x * x + y * y) * 6371;
    
    RETURN distance;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to find nearby landmarks
CREATE OR REPLACE FUNCTION get_nearby_landmarks(
    lat FLOAT,
    lon FLOAT,
    radius_km FLOAT DEFAULT 2.0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    landmark_type VARCHAR,
    latitude FLOAT,
    longitude FLOAT,
    distance_km FLOAT,
    address TEXT,
    rating FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.name,
        l.landmark_type,
        l.latitude,
        l.longitude,
        calculate_distance_km(lat, lon, l.latitude, l.longitude) AS distance_km,
        l.address,
        l.rating
    FROM landmarks l
    WHERE l.is_active = TRUE
    AND calculate_distance_km(lat, lon, l.latitude, l.longitude) <= radius_km
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to find nearby householders
CREATE OR REPLACE FUNCTION get_nearby_householders(
    landmark_id UUID,
    radius_km FLOAT DEFAULT 1.0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    house_number VARCHAR,
    kebele VARCHAR,
    latitude FLOAT,
    longitude FLOAT,
    distance_km FLOAT
) AS $$
DECLARE
    landmark_lat FLOAT;
    landmark_lon FLOAT;
BEGIN
    SELECT l.latitude, l.longitude INTO landmark_lat, landmark_lon
    FROM landmarks l
    WHERE l.id = landmark_id;
    
    IF landmark_lat IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT
        h.id,
        h.name,
        h.house_number,
        h.kebele,
        h.latitude,
        h.longitude,
        calculate_distance_km(landmark_lat, landmark_lon, h.latitude, h.longitude) AS distance_km
    FROM householders h
    WHERE h.is_deleted = FALSE
    AND h.latitude IS NOT NULL
    AND h.longitude IS NOT NULL
    AND calculate_distance_km(landmark_lat, landmark_lon, h.latitude, h.longitude) <= radius_km
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Create audit log for landmarks
CREATE TABLE landmark_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    landmark_id UUID REFERENCES landmarks(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_landmark_audit_logs_timestamp ON landmark_audit_logs(timestamp);
CREATE INDEX idx_landmark_audit_logs_landmark_id ON landmark_audit_logs(landmark_id);

-- Insert provided hotels as landmarks
INSERT INTO landmarks (name, landmark_type, latitude, longitude, location, address, rating, description)
VALUES
    ('Victory Hotel Hossana', 'HOTEL', 7.5505, 37.8548, ST_SetSRID(ST_MakePoint(37.8548, 7.5505), 4326), 'Main Street', 4.2, 'Popular hotel in Hosana'),
    ('Lemma International Hotel', 'HOTEL', 7.5489, 37.8560, ST_SetSRID(ST_MakePoint(37.8560, 7.5489), 4326), 'Central Avenue', 4.2, 'International standard hotel'),
    ('Hotel Shambalala', 'HOTEL', 7.5578, 37.8578, ST_SetSRID(ST_MakePoint(37.8578, 7.5578), 4326), 'North District', 3.7, 'Well-established hotel'),
    ('Ediget Hotel', 'HOTEL', 7.5512, 37.8525, ST_SetSRID(ST_MakePoint(37.8525, 7.5512), 4326), 'City Center', 3.9, 'Central location hotel'),
    ('Woze Star Hotel', 'HOTEL', 7.5530, 37.8505, ST_SetSRID(ST_MakePoint(37.8505, 7.5530), 4326), 'South Zone', 3.7, 'Budget friendly hotel'),
    ('Beteket Hotel', 'HOTEL', 7.5520, 37.8530, ST_SetSRID(ST_MakePoint(37.8530, 7.5520), 4326), 'Commercial Area', 3.5, 'Local favorite hotel');

-- Insert sample householders with geospatial data
INSERT INTO householders (name, father_name, house_number, mender, kebele, latitude, longitude, location, created_by, notes)
SELECT
    u.id,
    CASE (random() * 2)::int WHEN 0 THEN 'Abebe Kebede' WHEN 1 THEN 'Meseret Alemu' ELSE 'Tadesse Bekele' END,
    CASE (random() * 2)::int WHEN 0 THEN 'Father 1' WHEN 1 THEN 'Father 2' ELSE 'Father 3' END,
    'HOS-' || LPAD((i+1)::text, 3, '0'),
    'Mender ' || ((i % 3) + 1)::text,
    'Kebele ' || ((i % 5) + 1)::text,
    7.54978 + (random() - 0.5) * 0.01,
    37.85374 + (random() - 0.5) * 0.01,
    ST_SetSRID(ST_MakePoint(37.85374 + (random() - 0.5) * 0.01, 7.54978 + (random() - 0.5) * 0.01), 4326),
    u.id,
    'Sample householder'
FROM users u, generate_series(1, 20) as i
LIMIT 20;
