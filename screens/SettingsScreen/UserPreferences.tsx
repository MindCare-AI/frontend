import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

type PreferencesType = {
  id: number | null;
  dark_mode: boolean;
  language: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  disabled_notification_types: string[];
};

const UserPreferences: React.FC = () => {
  const navigation = useNavigation();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PreferencesType>({
    id: null,
    dark_mode: false,
    language: 'en',
    email_notifications: true,
    in_app_notifications: true,
    disabled_notification_types: []
  });

  const allNotificationTypes = [
    { id: 'reminders', label: 'Reminders' },
    { id: 'updates', label: 'Updates' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'tips', label: 'Daily Tips' },
    { id: 'appointments', label: 'Appointments' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
    { value: 'de', label: 'Deutsch' },
    { value: 'ja', label: 'Japanese' }
  ];

  // Fetch user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        if (!accessToken) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/v1/users/preferences/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });
        const data = await response.json();
        if (response.ok && data.id) {
          setPreferences(data);
        } else {
          setError(data.detail || 'Failed to retrieve preferences.');
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('An error occurred while fetching your preferences.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [accessToken]);

  const toggleNotificationType = (type: string) => {
    setPreferences(prev => {
      const currentDisabled = [...prev.disabled_notification_types];
      const index = currentDisabled.indexOf(type);
      if (index > -1) {
        currentDisabled.splice(index, 1);
      } else {
        currentDisabled.push(type);
      }
      return { ...prev, disabled_notification_types: currentDisabled };
    });
  };

  const saveChanges = async () => {
    try {
      if (!accessToken || !preferences.id) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Not authenticated or user ID not found."
        });
        return;
      }
      const requestBody = {
        dark_mode: preferences.dark_mode,
        language: preferences.language,
        email_notifications: preferences.email_notifications,
        in_app_notifications: preferences.in_app_notifications,
        disabled_notification_types: preferences.disabled_notification_types
      };
      const endpoint = `${API_BASE_URL}/api/v1/users/preferences/${preferences.id}/`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Preferences saved successfully",
          text2: "Your preferences have been updated."
        });
        setPreferences(prev => ({
          ...prev,
          ...data
        }));
      } else {
        Toast.show({
          type: "error",
          text1: "Save Failed",
          text2: data.detail || "Unable to update preferences."
        });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while saving preferences."
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
      <Text style={styles.header}>Preferences</Text>
      {/* Display Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={preferences.dark_mode}
            onValueChange={value =>
              setPreferences(prev => ({ ...prev, dark_mode: value }))
            }
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Language</Text>
          <Picker
            selectedValue={preferences.language}
            style={styles.picker}
            onValueChange={(value) =>
              setPreferences(prev => ({ ...prev, language: value }))
            }
          >
            {languages.map(lang => (
              <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Notification Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Email Notifications</Text>
          <Switch
            value={preferences.email_notifications}
            onValueChange={value =>
              setPreferences(prev => ({ ...prev, email_notifications: value }))
            }
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.label}>In-App Notifications</Text>
          <Switch
            value={preferences.in_app_notifications}
            onValueChange={value =>
              setPreferences(prev => ({ ...prev, in_app_notifications: value }))
            }
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Disabled Notification Types</Text>
        </View>
        <View style={styles.notificationTypes}>
          {allNotificationTypes.map(type => {
            const isDisabled = preferences.disabled_notification_types.includes(
              type.id
            );
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.notificationBadge,
                  isDisabled ? styles.badgeDisabled : styles.badgeEnabled
                ]}
                onPress={() => toggleNotificationType(type.id)}
              >
                <Text style={styles.badgeText}>{type.label}</Text>
              </TouchableOpacity>
            );
          })}
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
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  label: {
    fontSize: 16
  },
  picker: {
    flex: 1,
    marginLeft: 12
  },
  notificationTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  notificationBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8
  },
  badgeEnabled: {
    backgroundColor: '#e0e0e0'
  },
  badgeDisabled: {
    backgroundColor: '#4CAF50'
  },
  badgeText: {
    color: '#000'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24
  },
  cancelButton: {
    marginRight: 16
  },
  saveButton: {
    backgroundColor: '#4CAF50'
  }
});

export default UserPreferences;