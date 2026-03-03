import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import { Lock, User, Globe } from 'lucide-react-native';

type Language = 'en' | 'am';

const translations = {
  en: {
    title: 'Hosana Housing',
    subtitle: 'City Management System',
    username: 'Username',
    usernamePlaceholder: 'Enter username',
    password: 'Password',
    passwordPlaceholder: 'Enter password',
    login: 'Login',
    loading: 'Logging in...',
    forgotPassword: 'Forgot Password?',
    version: 'Version 1.0.0',
    error: {
      credentials: 'Invalid username or password',
      network: 'Network error. Please check connection',
      server: 'Server error. Try again later',
      required: 'Please fill all fields',
      locked: 'Account temporarily locked. Try again later',
    },
  },
  am: {
    title: 'ሆሳና መኖሪያ',
    subtitle: 'የከተማ አስተዳደር ስርዓት',
    username: 'የተጠቃሚ ስም',
    usernamePlaceholder: 'የተጠቃሚ ስም ያስገቡ',
    password: 'የይለፍ ቃል',
    passwordPlaceholder: 'የይለፍ ቃል ያስገቡ',
    login: 'ግባ',
    loading: 'እየገባ ነው...',
    forgotPassword: 'የይለፍ ቃልዎን ረስተዋል?',
    version: 'ስሪት 1.0.0',
    error: {
      credentials: 'ስህተት የተጠቃሚ ስም ወይም የይለፍ ቃል',
      network: 'የኔትወርክ ስህተት - መስመርዎን ያረጋግጡ',
      server: 'የሰርቨር ስህተት - እንደገና ይሞክሩ',
      required: 'እባክዎ ሁሉንም መስክ ይሙሉ',
      locked: 'ሂሳቡ ጊዜያዊ ተቆልፏል - እንደገና ይሞክሩ',
    },
  },
};

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const router = useRouter();

  const t = translations[language];

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = await SecureStore.getItemAsync('hosana_token');
      if (token) {
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  const handleLogin = async () => {
    // Validate inputs
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', t.error.required);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username: username.trim(),
        password,
      });

      const { token, user } = response.data;

      // Store securely
      await SecureStore.setItemAsync('hosana_token', token);
      await SecureStore.setItemAsync('hosana_user', JSON.stringify(user));
      await SecureStore.setItemAsync('hosana_language', language);

      Alert.alert('Success', language === 'en' ? 'Login successful' : 'በስኬት ገብተዋል');
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = t.error.network;

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = t.error.credentials;
        } else if (status === 423) {
          errorMessage = t.error.locked;
        } else if (status >= 500) {
          errorMessage = t.error.server;
        } else if (data?.error) {
          errorMessage = data.error;
        }
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-gradient-to-b from-blue-900 to-blue-700 justify-center items-center px-6">
          {/* Language Toggle */}
          <View className="absolute top-12 right-6">
            <TouchableOpacity
              onPress={toggleLanguage}
              className="flex-row items-center bg-white/20 px-4 py-2 rounded-full"
            >
              <Globe color="white" size={16} />
              <Text className="text-white ml-2 font-medium">
                {language === 'en' ? 'አማ' : 'EN'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logo Area */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
              <Lock color="#2563eb" size={48} />
            </View>
            <Text className="text-3xl font-bold text-white mb-2">{t.title}</Text>
            <Text className="text-white/80 text-center">{t.subtitle}</Text>
          </View>

          {/* Login Form */}
          <View className="w-full bg-white rounded-2xl p-6 shadow-2xl">
            {/* Username Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">{t.username}</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <User color="#6b7280" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder={t.usernamePlaceholder}
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">{t.password}</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <Lock color="#6b7280" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder={t.passwordPlaceholder}
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="items-end mb-6">
              <Text className="text-blue-600 font-medium">{t.forgotPassword}</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`w-full py-4 rounded-xl items-center ${
                loading ? 'bg-blue-400' : 'bg-blue-600'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <Text className="text-white font-bold text-lg">{t.login}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Version */}
          <Text className="text-white/60 text-sm mt-8">{t.version}</Text>

          {/* Footer Warning */}
          <View className="mt-6 bg-white/10 rounded-lg p-4 max-w-xs">
            <Text className="text-white/80 text-xs text-center">
              {language === 'en'
                ? '⚠️ Authorized access only. All activities are monitored.'
                : '⚠️ የፈቃድ ያላቸው ተጠቃሚዎች ብቻ - ሁሉም እንቅስቃሴዎች ይመዘገባሉ'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}