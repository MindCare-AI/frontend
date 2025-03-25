import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Switch,
  ActivityIndicator 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../config';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext'; // Add this import

const UserSettings = () => {
  const navigation = useNavigation();
  const { accessToken } = useAuth(); // Add this hook
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Initial local state. If the GET request returns an object with an "id" field,
  // we add it to the state so the PUT request knows which record to update.
  const [settings, setSettings] = useState({
    id: null,
    timezone: 'UTC',
    theme_mode: 'light',
    profile_visibility: 'public',
    theme_preferences: {
      mode: 'light',
      color_scheme: 'blue'
    },
    privacy_settings: {
      profile_visibility: 'public',
      show_online_status: true
    }
  });

  // Timezones, color schemes definitions remain unchanged
  const timezones = [
    { value: 'UTC-12', label: '(UTC-12:00) International Date Line West' },
    { value: 'UTC-8', label: '(UTC-08:00) Pacific Time (US & Canada)' },
    { value: 'UTC-5', label: '(UTC-05:00) Eastern Time (US & Canada)' },
    { value: 'UTC', label: '(UTC) Coordinated Universal Time' },
    { value: 'UTC+1', label: '(UTC+01:00) Central European Time' },
    { value: 'UTC+5:30', label: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
    { value: 'UTC+8', label: '(UTC+08:00) Beijing, Perth, Singapore, Hong Kong' },
    { value: 'UTC+9', label: '(UTC+09:00) Tokyo, Seoul' },
    { value: 'UTC+12', label: '(UTC+12:00) Auckland, Wellington' },
  ];

  const colorSchemes = [
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
    { value: 'orange', label: 'Orange' },
    { value: 'red', label: 'Red' },
  ];

  // Fetch user settings from the backend when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!accessToken) {
          setError('Not authenticated');
          return;
        }

        // First fetch user profile to get the ID
        const profileResponse = await fetch(`${API_URL}/users/profile/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const profileData = await profileResponse.json();
        
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        // Store the user ID
        setUserId(profileData.id);

        // Then fetch settings using the user ID
        const settingsResponse = await fetch(`${API_URL}/users/settings/${profileData.id}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        const settingsData = await settingsResponse.json();
        
        if (settingsResponse.ok) {
          const normalizedData = {
            ...settings,
            ...settingsData,
            theme_preferences: {
              ...settings.theme_preferences,
              ...(settingsData.theme_preferences || {})
            },
            privacy_settings: {
              ...settings.privacy_settings,
              ...(settingsData.privacy_settings || {})
            }
          };
          
          setSettings(normalizedData);
        } else {
          setError(settingsData.detail || 'Failed to retrieve settings.');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('An error occurred while fetching your settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [accessToken]); // Add accessToken as dependency

  // Update theme preferences
  const updateThemePreferences = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      theme_preferences: {
        ...prev.theme_preferences,
        [key]: value,
      },
    }));
  };

  // Update privacy settings
  const updatePrivacySettings = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      privacy_settings: {
        ...prev.privacy_settings,
        [key]: value,
      },
    }));
  };

  // Save changes to backend (using PATCH)
  const saveChanges = async () => {
    try {
      if (!accessToken || !userId) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2: "Not authenticated or user ID not found.",
        });
        return;
      }

      // Prepare the request body according to the API specification
      const requestBody = {
        timezone: settings.timezone,
        theme_mode: settings.theme_mode,
        profile_visibility: settings.privacy_settings.profile_visibility,
        theme_preferences: {
          mode: settings.theme_preferences.mode,
          color_scheme: settings.theme_preferences.color_scheme
        },
        privacy_settings: {
          profile_visibility: settings.privacy_settings.profile_visibility,
          show_online_status: settings.privacy_settings.show_online_status
        }
      };

      // Use the user ID in the endpoint
      const endpoint = `${API_URL}/users/settings/${userId}/`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Settings saved successfully",
          text2: "Your account settings have been updated.",
        });
        // Update local state with the returned data
        setSettings(prev => ({
          ...prev,
          ...data,
          theme_preferences: {
            ...prev.theme_preferences,
            ...(data.theme_preferences || {})
          },
          privacy_settings: {
            ...prev.privacy_settings,
            ...(data.privacy_settings || {})
          }
        }));
      } else {
        Toast.show({
          type: "error",
          text1: "Save Failed",
          text2: data.detail || "Unable to update settings.",
        });
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while saving settings.",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D62" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Regional Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Regional Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.label}>Timezone</Text>
          <Picker
            selectedValue={settings.timezone}
            onValueChange={(value) => setSettings({ ...settings, timezone: value })}
          >
            {timezones.map((tz) => (
              <Picker.Item key={tz.value} label={tz.label} value={tz.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Theme Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme Preferences</Text>
        <View style={styles.settingItem}>
          <Text style={styles.label}>Theme Mode</Text>
          <View>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSettings({ ...settings, theme_mode: 'light' });
                updateThemePreferences('mode', 'light');
              }}
            >
              <MaterialIcons
                name={settings?.theme_preferences?.mode === 'light' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color="#000"
              />
              <Text style={styles.radioLabel}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSettings({ ...settings, theme_mode: 'dark' });
                updateThemePreferences('mode', 'dark');
              }}
            >
              <MaterialIcons
                name={settings?.theme_preferences?.mode === 'dark' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color="#000"
              />
              <Text style={styles.radioLabel}>Dark</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSettings({ ...settings, theme_mode: 'system' });
                updateThemePreferences('mode', 'system');
              }}
            >
              <MaterialIcons
                name={settings?.theme_preferences?.mode === 'system' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color="#000"
              />
              <Text style={styles.radioLabel}>System Preference</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.label}>Color Scheme</Text>
          <Picker
            selectedValue={settings?.theme_preferences?.color_scheme || 'blue'}
            onValueChange={(value) => updateThemePreferences('color_scheme', value)}
          >
            {colorSchemes.map((scheme) => (
              <Picker.Item key={scheme.value} label={scheme.label} value={scheme.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.label}>Profile Visibility</Text>
          <View>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => updatePrivacySettings('profile_visibility', 'public')}
            >
              <MaterialIcons
                name={settings.privacy_settings.profile_visibility === 'public' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color="#000"
              />
              <Text style={styles.radioLabel}>Public</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => updatePrivacySettings('profile_visibility', 'friends-only')}
            >
              <MaterialIcons
                name={settings.privacy_settings.profile_visibility === 'friends-only' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color="#000"
              />
              <Text style={styles.radioLabel}>Friends Only</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => updatePrivacySettings('profile_visibility', 'private')}
            >
              <MaterialIcons
                name={settings.privacy_settings.profile_visibility === 'private' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color="#000"
              />
              <Text style={styles.radioLabel}>Private</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.label}>Show Online Status</Text>
          <Switch
            value={settings?.privacy_settings?.show_online_status || false}
            onValueChange={(value) => updatePrivacySettings('show_online_status', value)}
          />
        </View>
      </View>

      {/* Save/Cancel Buttons */}
      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.cancelButton}>
          Cancel
        </Button>
        <Button mode="contained" onPress={saveChanges} style={styles.saveButton}>
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  cancelButton: {
    marginRight: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
});

export default UserSettings;