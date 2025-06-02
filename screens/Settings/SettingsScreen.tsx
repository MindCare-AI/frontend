import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Text } from 'react-native';
import { Snackbar, Button } from 'react-native-paper';
import { getAppSettings, updateAppSettings, AppSettings } from '../../API/settings/settings';
import { AppearanceSettings } from '../../components/SettingsScreen/AppearanceSettings';
import { TimeZoneSettings } from '../../components/SettingsScreen/TimeZoneSettings';
import { globalStyles } from '../../styles/global';
import LoadingSpinner from '../../components/LoadingSpinner';

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({});
  const [originalSettings, setOriginalSettings] = useState<AppSettings>({});
  const [tempSettings, setTempSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAppSettings();
      setSettings(data);
      setOriginalSettings(data);
      setTempSettings(data);
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = (updatedSettings: Partial<AppSettings>) => {
    const newSettings = { ...tempSettings, ...updatedSettings };
    setTempSettings(newSettings);
    
    // Check if any setting is different from original
    const hasAnyChange = Object.keys(newSettings).some(
      key => newSettings[key as keyof AppSettings] !== originalSettings[key as keyof AppSettings]
    );
    
    setHasChanges(hasAnyChange);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      await updateAppSettings(tempSettings);
      setSettings(tempSettings);
      setOriginalSettings(tempSettings);
      setHasChanges(false);
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

  const handleCancel = () => {
    setTempSettings(originalSettings);
    setHasChanges(false);
  };

  if (loading) {
    return <LoadingSpinner visible={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingSpinner visible={updating} />
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
          <>
            <TimeZoneSettings
              initialData={tempSettings}
              onUpdate={handleUpdateSettings}
              loading={updating}
            />
            
            <AppearanceSettings
              initialData={tempSettings}
              onUpdate={handleUpdateSettings}
              loading={updating}
            />
          </>
        )}
      </ScrollView>
      
      {hasChanges && (
        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={handleCancel} 
            style={styles.cancelButton} 
            disabled={updating}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSave} 
            style={styles.saveButton} 
            loading={updating}
            disabled={updating}
          >
            Save Changes
          </Button>
        </View>
      )}
      
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
    paddingBottom: 80, // Add padding at the bottom for the buttons
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: globalStyles.colors.background,
    borderTopWidth: 1,
    borderTopColor: globalStyles.colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: globalStyles.colors.primary,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  }
});

export default SettingsScreen;