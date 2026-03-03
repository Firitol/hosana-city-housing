import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileText,
  Navigation,
  Edit,
  User,
  Home,
  Clipboard,
} from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

type Householder = {
  id: string;
  name: string;
  father_name?: string;
  house_number: string;
  mender: string;
  kebele: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  file_path?: string;
  file_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export default function ProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [householder, setHouseholder] = useState<Householder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/householders/${params.id}`);
      setHouseholder(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (!householder?.phone) {
      Alert.alert('No Phone', 'Phone number not available');
      return;
    }
    Alert.alert('Call', `Call ${householder.phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => Linking.openURL(`tel:${householder.phone}`),
      },
    ]);
  };

  const handleEmail = () => {
    if (!householder?.email) {
      Alert.alert('No Email', 'Email address not available');
      return;
    }
    Linking.openURL(`mailto:${householder.email}`);
  };

  const handleNavigate = () => {
    if (!householder?.latitude || !householder?.longitude) {
      Alert.alert('No Location', 'GPS coordinates not available');
      return;
    }

    const url = `https://www.google.com/maps?q=${householder.latitude},${householder.longitude}`;
    Linking.openURL(url);
  };

  const handleViewDocument = () => {
    if (!householder?.file_path) {
      Alert.alert('No Document', 'No document uploaded');
      return;
    }
    Linking.openURL(householder.file_path);
  };

  const handleEdit = () => {
    router.push({
      pathname: '/edit',
      params: { id: householder?.id },
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    // In production, use expo-clipboard
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (!householder) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-8">
        <User color="#d1d5db" size={64} />
        <Text className="text-gray-400 text-lg mt-4 text-center">
          Profile not found
        </Text>
        <Button onPress={() => router.back()} className="mt-6">
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-4 py-6">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4 flex-1 text-center mr-10">
            Profile Details
          </Text>
        </View>

        <View className="items-center">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-3">
            <User color="#2563eb" size={40} />
          </View>
          <Text className="text-white text-2xl font-bold">{householder.name}</Text>
          {householder.father_name && (
            <Text className="text-white/80 mt-1">{householder.father_name}</Text>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Emergency Button */}
        {householder.latitude && householder.longitude && (
          <TouchableOpacity
            onPress={handleNavigate}
            className="bg-red-600 rounded-xl p-4 mb-6 flex-row items-center justify-center"
          >
            <Navigation color="white" size={24} />
            <Text className="text-white font-bold text-lg ml-3">
              EMERGENCY LOCATION
            </Text>
          </TouchableOpacity>
        )}

        {/* Personal Information */}
        <Card className="mb-4">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <User color="#2563eb" size={20} />
              <Text className="text-lg font-bold text-gray-800 ml-2">
                Personal Information
              </Text>
            </View>

            <InfoRow
              icon={<User color="#6b7280" size={18} />}
              label="Full Name"
              value={householder.name}
              onCopy={() => copyToClipboard(householder.name, 'Name')}
            />

            {householder.father_name && (
              <InfoRow
                icon={<User color="#6b7280" size={18} />}
                label="Father's Name"
                value={householder.father_name}
              />
            )}

            {householder.phone && (
              <InfoRow
                icon={<Phone color="#6b7280" size={18} />}
                label="Phone Number"
                value={householder.phone}
                actionText="Call"
                onAction={handleCall}
                onCopy={() => copyToClipboard(householder.phone!, 'Phone')}
              />
            )}

            {householder.email && (
              <InfoRow
                icon={<Mail color="#6b7280" size={18} />}
                label="Email"
                value={householder.email}
                actionText="Email"
                onAction={handleEmail}
              />
            )}
          </View>
        </Card>

        {/* Address Information */}
        <Card className="mb-4">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <Home color="#2563eb" size={20} />
              <Text className="text-lg font-bold text-gray-800 ml-2">
                Address Information
              </Text>
            </View>

            <InfoRow
              icon={<MapPin color="#6b7280" size={18} />}
              label="House Number"
              value={householder.house_number}
              onCopy={() => copyToClipboard(householder.house_number, 'House Number')}
            />

            <InfoRow
              icon={<MapPin color="#6b7280" size={18} />}
              label="Mender"
              value={householder.mender}
            />

            <InfoRow
              icon={<MapPin color="#6b7280" size={18} />}
              label="Kebele"
              value={householder.kebele}
            />

            {householder.latitude && householder.longitude && (
              <InfoRow
                icon={<MapPin color="#6b7280" size={18} />}
                label="GPS Coordinates"
                value={`${householder.latitude}, ${householder.longitude}`}
                actionText="Navigate"
                onAction={handleNavigate}
              />
            )}
          </View>
        </Card>

        {/* Documents */}
        {householder.file_path && (
          <Card className="mb-4">
            <View className="p-4">
              <View className="flex-row items-center mb-4">
                <FileText color="#2563eb" size={20} />
                <Text className="text-lg font-bold text-gray-800 ml-2">
                  Documents
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleViewDocument}
                className="flex-row items-center bg-blue-50 p-4 rounded-lg"
              >
                <FileText color="#2563eb" size={24} />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-800 font-medium">
                    {householder.file_name || 'Document'}
                  </Text>
                  <Text className="text-gray-500 text-sm">Tap to view</Text>
                </View>
                <Navigation color="#2563eb" size={20} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Notes */}
        {householder.notes && (
          <Card className="mb-4">
            <View className="p-4">
              <View className="flex-row items-center mb-4">
                <Clipboard color="#2563eb" size={20} />
                <Text className="text-lg font-bold text-gray-800 ml-2">
                  Notes
                </Text>
              </View>
              <Text className="text-gray-600 leading-6">
                {householder.notes}
              </Text>
            </View>
          </Card>
        )}

        {/* Edit Button */}
        <Button onPress={handleEdit} className="mb-8" variant="primary">
          <Edit color="white" size={20} />
          <Text className="text-white font-bold ml-2">Edit Profile</Text>
        </Button>

        {/* Footer */}
        <View className="mb-8">
          <Text className="text-gray-400 text-xs text-center">
            Created: {new Date(householder.created_at).toLocaleDateString()}
          </Text>
          <Text className="text-gray-400 text-xs text-center">
            Updated: {new Date(householder.updated_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Info Row Component
function InfoRow({
  icon,
  label,
  value,
  actionText,
  onAction,
  onCopy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  actionText?: string;
  onAction?: () => void;
  onCopy?: () => void;
}) {
  return (
    <View className="flex-row items-center py-3 border-b border-gray-100 last:border-0">
      <View className="w-8">{icon}</View>
      <View className="flex-1 ml-2">
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="text-gray-800 font-medium">{value}</Text>
      </View>
      {onCopy && (
        <TouchableOpacity onPress={onCopy} className="px-2">
          <Text className="text-blue-600 text-xs font-medium">Copy</Text>
        </TouchableOpacity>
      )}
      {onAction && actionText && (
        <TouchableOpacity onPress={onAction} className="ml-2">
          <Text className="text-green-600 text-xs font-medium">{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}