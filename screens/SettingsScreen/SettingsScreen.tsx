import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  const features = [
    {
      title: 'User Preferences',
      description: 'Customize your app experience with personalized settings.',
      path: 'UserPreferences',
      icon: '🔔',
    },
    {
      title: 'Account Settings',
      description: 'Manage your account and privacy preferences.',
      path: 'UserSettings',
      icon: '⚙️',
    },
    {
      title: 'User Profile',
      description: 'Update your personal and medical information.',
      path: 'UserProfile',
      icon: '👤',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <Text style={styles.description}>
        Access your profile, preferences, and settings to customize your experience.
      </Text>
      <View style={styles.featuresContainer}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.path}
            style={styles.featureCard}
            onPress={() => navigation.navigate(feature.path as never)}
          >
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresContainer: {
    flex: 1,
    marginTop: 16,
  },
  featureCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default SettingsScreen;