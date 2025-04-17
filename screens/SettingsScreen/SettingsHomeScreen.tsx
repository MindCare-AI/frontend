//screens/SettingsScreen/SettingsHomeScreen.tsx
import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SettingsCard } from './components/common/SettingsCard';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsStackParamList } from '../../types/navigation';
import { useProfile } from './hooks/useProfile';
import { gsap } from 'gsap';

type UserType = 'patient' | 'therapist' | '';
type SettingsScreen = keyof SettingsStackParamList;

interface Feature {
  title: string;
  description: string;
  icon: string;
  screen: SettingsScreen;
  requiresAuth?: boolean;
  userTypes?: UserType[];
}

export const SettingsHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const { user } = useAuth();
  const { loading, error } = useProfile();

  // Create a ref to scope GSAP animations
  const containerRef = useRef(null);

  // Animate the container on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, { duration: 1, opacity: 0, y: -50 });
    }
  }, []);

  const features: Feature[] = [
    {
      title: 'Account Settings',
      description: 'Manage security, privacy, and preferences',
      icon: '⚙️',
      screen: 'UserSettings',
      requiresAuth: true,
    },
    {
      title: 'Profile',
      description: 'Update personal and professional information',
      icon: '👤',
      screen: 'UserProfile',
      requiresAuth: true,
    },
    {
      title: 'Preferences',
      description: 'Customize notifications and display',
      icon: '🔔',
      screen: 'UserPreferences',
      requiresAuth: true,
    },
    {
      title: 'Availability',
      description: 'Set your working hours and schedule',
      icon: '📅',
      screen: 'TherapistAvailability',
      requiresAuth: true,
      userTypes: ['therapist'],
    },
    {
      title: 'Health Metrics',
      description: 'View and update your health information',
      icon: '📊',
      screen: 'HealthMetrics',
      requiresAuth: true,
      userTypes: ['patient'],
    },
    {
      title: 'Medical History',
      description: 'Manage your medical records',
      icon: '🏥',
      screen: 'MedicalHistory',
      requiresAuth: true,
      userTypes: ['patient'],
    },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  const filteredFeatures = features.filter(feature => {
    if (feature.requiresAuth && !user) return false;
    if (feature.userTypes && !feature.userTypes.includes(user?.user_type as UserType)) return false;
    return true;
  });

  return (
    <ScrollView contentContainerStyle={styles.container} ref={containerRef}>
      <Text style={styles.header}>Settings</Text>
      <Text style={styles.subtitle}>
        Manage your account and personalize your experience
      </Text>

      <View style={styles.cardsContainer}>
        {filteredFeatures.map((feature) => (
          <SettingsCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            onPress={() => navigation.navigate(feature.screen)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#E4F0F6', // Match app's background color theme
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#002D62', // Match app's primary color
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  cardsContainer: {
    marginTop: 16,
    gap: 12, // Add consistent spacing between cards
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E4F0F6',
  },
  error: {
    color: '#D32F2F', // Standard error color
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
});

export default SettingsHomeScreen;