import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { api } from '@/lib/api';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [locations, setLocations] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);

  useEffect(() => {
    loadData();
    getCurrentLocation();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/householders');
      // Filter only those with coordinates
      const withCoords = res.data.filter((h: any) => h.latitude && h.longitude);
      setLocations(withCoords);
    } catch (error) {
      console.error(error);
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 7.55,
          longitude: 37.85,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
        )}

        {locations.map((h) => (
          <Marker
            key={h.id}
            coordinate={{
              latitude: h.latitude,
              longitude: h.longitude,
            }}
            title={h.name}
            description={`${h.house_number}, ${h.mender}`}
            pinColor="red"
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});