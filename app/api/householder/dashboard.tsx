import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { api } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { MapPin, Search, LogOut } from 'lucide-react-native';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/householders');
      setStats({ total: res.data.length });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          await SecureStore.deleteItemAsync('hosana_token');
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-2xl font-bold text-gray-800">Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <LogOut color="red" size={24} />
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <Text className="text-gray-500 mb-2">Total Householders</Text>
        <Text className="text-4xl font-bold text-blue-600">{stats.total}</Text>
      </View>

      <View className="flex-row gap-4 mb-6">
        <TouchableOpacity
          onPress={() => router.push('/search')}
          className="flex-1 bg-white rounded-xl p-6 shadow-sm items-center"
        >
          <Search color="#2563eb" size={32} />
          <Text className="mt-2 font-medium text-gray-700">Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/map')}
          className="flex-1 bg-white rounded-xl p-6 shadow-sm items-center"
        >
          <MapPin color="#dc2626" size={32} />
          <Text className="mt-2 font-medium text-gray-700">Emergency Map</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}