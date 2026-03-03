import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { Search, Filter, X, MapPin, Phone, FileText } from 'lucide-react-native';
import { Card } from '@/components/Card';

type Householder = {
  id: string;
  name: string;
  father_name?: string;
  house_number: string;
  mender: string;
  kebele: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  file_path?: string;
};

const MENDERS = ['All', 'Mender 1', 'Mender 2', 'Mender 3'];
const KEBELES = [
  'All',
  'Kebele 01',
  'Kebele 02',
  'Kebele 03',
  'Kebele 04',
  'Kebele 05',
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMender, setSelectedMender] = useState('All');
  const [selectedKebele, setSelectedKebele] = useState('All');
  const [householders, setHouseholders] = useState<Householder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHouseholders();
  }, [searchQuery, selectedMender, selectedKebele]);

  const fetchHouseholders = async () => {
    try {
      let url = '/householders?';
      if (searchQuery) url += `query=${searchQuery}&`;
      if (selectedMender !== 'All') url += `mender=${selectedMender}&`;
      if (selectedKebele !== 'All') url += `kebele=${selectedKebele}&`;

      const response = await api.get(url);
      setHouseholders(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHouseholders();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMender('All');
    setSelectedKebele('All');
  };

  const handleEmergency = (householder: Householder) => {
    if (!householder.latitude || !householder.longitude) {
      Alert.alert(
        'No Location',
        'GPS coordinates not available for this householder'
      );
      return;
    }

    Alert.alert(
      'Emergency Mode',
      `Open map for ${householder.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Map',
          onPress: () => {
            router.push({
              pathname: '/map',
              params: {
                lat: householder.latitude.toString(),
                lng: householder.longitude.toString(),
                name: householder.name,
                address: `${householder.house_number}, ${householder.mender}`,
              },
            });
          },
        },
      ]
    );
  };

  const handleCall = (phone?: string) => {
    if (!phone) {
      Alert.alert('No Phone', 'Phone number not available');
      return;
    }
    // In production, use Linking.openURL(`tel:${phone}`)
    Alert.alert('Call', `Dial ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Calling:', phone) },
    ]);
  };

  const renderHouseholder = ({ item }: { item: Householder }) => (
    <Card className="mb-3">
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/profile',
            params: { id: item.id },
          })
        }
      >
        <View className="p-4">
          {/* Header */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
              {item.father_name && (
                <Text className="text-sm text-gray-500">{item.father_name}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => handleEmergency(item)}
              className="bg-red-100 px-3 py-1 rounded-full"
            >
              <Text className="text-red-600 font-bold text-xs">URGENT</Text>
            </TouchableOpacity>
          </View>

          {/* Details */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded">
              <MapPin color="#6b7280" size={14} />
              <Text className="text-xs text-gray-600 ml-1">
                {item.house_number}
              </Text>
            </View>
            <View className="flex-row items-center bg-blue-100 px-2 py-1 rounded">
              <Text className="text-xs text-blue-600">{item.mender}</Text>
            </View>
            <View className="flex-row items-center bg-green-100 px-2 py-1 rounded">
              <Text className="text-xs text-green-600">{item.kebele}</Text>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            {item.phone && (
              <TouchableOpacity
                onPress={() => handleCall(item.phone)}
                className="flex-row items-center bg-green-50 px-3 py-2 rounded-lg"
              >
                <Phone color="#16a34a" size={16} />
                <Text className="text-green-700 text-sm ml-1">Call</Text>
              </TouchableOpacity>
            )}
            {item.file_path && (
              <TouchableOpacity className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg">
                <FileText color="#2563eb" size={16} />
                <Text className="text-blue-700 text-sm ml-1">Docs</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          Search Householders
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-3">
          <Search color="#6b7280" size={20} />
          <TextInput
            className="flex-1 ml-3 text-gray-800"
            placeholder="Search by name or house number..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color="#6b7280" size={20} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Toggle */}
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className="flex-row items-center"
        >
          <Filter color="#2563eb" size={18} />
          <Text className="text-blue-600 ml-2 font-medium">
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Text>
        </TouchableOpacity>

        {/* Filters */}
        {showFilters && (
          <View className="mt-4 space-y-3">
            {/* Mender Filter */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Mender</Text>
              <View className="flex-row flex-wrap gap-2">
                {MENDERS.map((mender) => (
                  <TouchableOpacity
                    key={mender}
                    onPress={() => setSelectedMender(mender)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedMender === mender
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={
                        selectedMender === mender
                          ? 'text-white font-medium'
                          : 'text-gray-700'
                      }
                    >
                      {mender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Kebele Filter */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Kebele</Text>
              <View className="flex-row flex-wrap gap-2">
                {KEBELES.map((kebele) => (
                  <TouchableOpacity
                    key={kebele}
                    onPress={() => setSelectedKebele(kebele)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedKebele === kebele
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={
                        selectedKebele === kebele
                          ? 'text-white font-medium'
                          : 'text-gray-700'
                      }
                    >
                      {kebele}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Clear Filters */}
            <TouchableOpacity
              onPress={clearFilters}
              className="mt-2 py-2"
            >
              <Text className="text-red-600 font-medium text-center">
                Clear All Filters
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Results */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-500 mt-4">Loading...</Text>
        </View>
      ) : householders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Search color="#d1d5db" size={64} />
          <Text className="text-gray-400 text-lg mt-4 text-center">
            No householders found
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={householders}
          renderItem={renderHouseholder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Results Count */}
      {!loading && householders.length > 0 && (
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <Text className="text-gray-500 text-sm text-center">
            {householders.length} results found
          </Text>
        </View>
      )}
    </View>
  );
}