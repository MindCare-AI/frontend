import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Text } from 'react-native';
import { ActivityIndicator, Snackbar, Button } from 'react-native-paper';
import { getAppSettings, updateAppSettings, AppSettings } from '../../API/settings/settings';
import { AppearanceSettings } from '../../components/SettingsScreen/AppearanceSettings';
import { globalStyles } from '../../styles/global';

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAppSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updatedSettings: Partial<AppSettings>) => {
    try {
      setUpdating(true);
      await updateAppSettings(updatedSettings);
      setSettings(prev => ({ ...prev, ...updatedSettings }));
      setSnackbarMessage('Settings updated successfully');
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setSnackbarMessage('Failed to update settings. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setUpdating(false);
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
            <Button mode="contained" onPress={loadSettings} style={styles.retryButton}>
              Retry
            </Button>
          </View>
        ) : (
          <AppearanceSettings
            initialData={settings}
            onUpdate={handleUpdateSettings}
            loading={updating}
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

export default SettingsScreen;