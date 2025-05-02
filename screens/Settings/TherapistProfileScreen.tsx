import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Text } from 'react-native';
import { ActivityIndicator, Snackbar, Button } from 'react-native-paper';
import { TherapistInfoForm } from '../../components/SettingsScreen/TherapistInfoForm';
import { getTherapistProfile, updateTherapistProfile, TherapistProfile } from '../../API/settings/therapist';
import { globalStyles } from '../../styles/global';

const TherapistProfileScreen: React.FC = () => {
  const [profileData, setProfileData] = useState<Partial<TherapistProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchTherapistProfile();
  }, []);

  const fetchTherapistProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTherapistProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Failed to load therapist profile:', err);
      setError('Failed to load professional profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data: Partial<TherapistProfile>) => {
    try {
      setSaving(true);
      await updateTherapistProfile(data);
      setProfileData(prev => ({ ...prev, ...data }));
      setSnackbarMessage('Professional profile updated successfully');
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Failed to update therapist profile:', err);
      setSnackbarMessage('Failed to update profile. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={globalStyles.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={fetchTherapistProfile} style={styles.retryButton}>
              Retry
            </Button>
          </View>
        ) : (
          <TherapistInfoForm
            initialData={profileData}
            onSave={handleSaveProfile}
            loading={saving}
          />
        )}
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: globalStyles.colors.error,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: globalStyles.colors.primary,
  },
});

export default TherapistProfileScreen;