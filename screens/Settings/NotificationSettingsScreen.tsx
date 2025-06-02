import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Text } from 'react-native';
import { Snackbar, Button, Checkbox, Divider, Switch, List, Menu, Modal, Portal, TextInput } from 'react-native-paper';
import { 
  getUserPreferences, 
  saveUserPreferences, 
  getNotificationTypes,
  getCurrentUserType 
} from '../../API/settings/notifications';
import { SettingToggle } from '../../components/SettingsScreen/SettingToggle';
import { SectionHeader } from '../../components/SettingsScreen/SectionHeader';
import { globalStyles } from '../../styles/global';
import DateTimePicker from '@react-native-community/datetimepicker';
import LoadingSpinner from '../../components/LoadingSpinner';

// Add this interface to define your notification structure
interface NotificationPreferences {
  frequency?: {
    appointment_reminder?: {
      timing?: string[];
    };
    new_patient_assigned?: {
      channels?: string[];
    };
  };
  push?: {
    quiet_hours?: {
      start?: string;
      end?: string;
      enabled?: boolean;
    };
  };
  // Add other properties as needed
}

interface UserPreferences {
  email_notifications: boolean;
  in_app_notifications: boolean;
  dark_mode: boolean;
  language: string;
  disabled_notification_types: string[];
  notification_preferences: NotificationPreferences;
}

interface NotificationType {
  id: string;
  name: string;
  description: string;
  is_global: boolean;
}

const NotificationSettingsScreen: React.FC = () => {
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences>({
    email_notifications: false,
    in_app_notifications: false,
    dark_mode: false,
    language: 'en',
    disabled_notification_types: [],
    notification_preferences: {}
  });
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: false,
    in_app_notifications: false,
    dark_mode: false,
    language: 'en',
    disabled_notification_types: [],
    notification_preferences: {}
  });
  
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    appointmentReminders: false,
    newPatientAssignments: false,
    quietHours: false
  });
  
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [currentTimeField, setCurrentTimeField] = useState<'start' | 'end'>('start');
  
  const [userType, setUserType] = useState<'patient' | 'therapist'>('patient'); // Default to patient until loaded

  // Language options
  const languageOptions = [
    { value: "en", label: "English" },
    { value: "fr", label: "French" },
    { value: "es", label: "Spanish" },
    { value: "ar", label: "Arabic" }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user type along with other data
      const [prefsData, typesData, userTypeData] = await Promise.all([
        getUserPreferences(),
        getNotificationTypes(),
        getCurrentUserType()
      ]);
      
      setPreferences(prefsData);
      setOriginalPreferences(prefsData);
      setNotificationTypes(typesData);
      setUserType(userTypeData); // Set the user type from API
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to load notification settings:', err);
      setError('Failed to load notification settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof UserPreferences) => {
    setPreferences(prev => {
      const updated = { 
        ...prev, 
        [key]: !prev[key] 
      };
      checkForChanges(updated);
      return updated;
    });
  };
  
  const handleLanguageChange = (language: string) => {
    setPreferences(prev => {
      const updated = { 
        ...prev, 
        language 
      };
      checkForChanges(updated);
      return updated;
    });
    setLanguageMenuVisible(false);
  };
  
  const handleDisabledTypesChange = (typeName: string) => {
    setPreferences(prev => {
      const disabledTypes = [...prev.disabled_notification_types];
      
      if (disabledTypes.includes(typeName)) {
        const index = disabledTypes.indexOf(typeName);
        disabledTypes.splice(index, 1);
      } else {
        disabledTypes.push(typeName);
      }
      
      const updated = { 
        ...prev, 
        disabled_notification_types: disabledTypes 
      };
      checkForChanges(updated);
      return updated;
    });
  };
  
  const getAdvancedPreference = (path: string): any => {
    const keys = path.split('.');
    let value = preferences.notification_preferences as Record<string, any>;
    
    for (const key of keys) {
      if (!value || value[key] === undefined) {
        return [];
      }
      value = value[key];
    }
    
    return value;
  };
  
  // Helper function to safely set nested properties
  const setNestedValue = (obj: Record<string, any>, path: string, value: any): void => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;
    
    for (const key of keys) {
      current[key] = current[key] || {};
      current = current[key];
    }
    
    current[lastKey] = value;
  };
  
  const updateAdvancedPreference = (path: string, newValue: any) => {
    setPreferences(prev => {
      const updatedPrefs = { ...prev };
      updatedPrefs.notification_preferences = { ...updatedPrefs.notification_preferences };
      
      // Use helper function to set value safely
      setNestedValue(updatedPrefs.notification_preferences as Record<string, any>, path, newValue);
      
      checkForChanges(updatedPrefs);
      return updatedPrefs;
    });
  };
  
  const toggleAdvancedSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handleTimePickerPress = (field: 'start' | 'end') => {
    setCurrentTimeField(field);
    setTimePickerVisible(true);
  };
  
  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      if (currentTimeField === 'start') {
        updateAdvancedPreference('push.quiet_hours.start', timeString);
      } else {
        updateAdvancedPreference('push.quiet_hours.end', timeString);
      }
    }
    setTimePickerVisible(false);
  };
  
  const checkForChanges = (updatedPreferences: UserPreferences) => {
    // Compare updatedPreferences with originalPreferences to see if there are any changes
    const hasAnyChange = JSON.stringify(updatedPreferences) !== JSON.stringify(originalPreferences);
    setHasChanges(hasAnyChange);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      await saveUserPreferences(preferences);
      setOriginalPreferences(preferences);
      setHasChanges(false);
      setSnackbarMessage('Notification settings updated');
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Failed to update notification settings:', err);
      setSnackbarMessage('Failed to update settings. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setPreferences(originalPreferences);
    setHasChanges(false);
  };

  // Define type-safe path accessor
  type Path<T> = string;

  // Type-safe getter with predefined paths
  function getNestedValue<T>(obj: T, path: Path<T>): any {
    return path.split('.').reduce((acc: any, part: string) => 
      acc && acc[part] !== undefined ? acc[part] : undefined, obj);
  }

  // Example usage with type checking
  const quietHoursEnabled = getNestedValue(
    preferences.notification_preferences,
    'push.quiet_hours.enabled' as Path<NotificationPreferences>
  );

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
            {/* Basic Settings Section */}
            <SectionHeader 
              title="General Notification Settings" 
              description="Basic notification preferences" 
            />
            
            <SettingToggle
              label="Email Notifications"
              value={preferences.email_notifications}
              onToggle={() => handleToggle('email_notifications')}
              disabled={updating}
              description="Get important updates via email"
            />
            
            <SettingToggle
              label="In-App Notifications"
              value={preferences.in_app_notifications}
              onToggle={() => handleToggle('in_app_notifications')}
              disabled={updating}
              description="Get notifications in the app"
            />
            
            <SettingToggle
              label="Dark Mode"
              value={preferences.dark_mode}
              onToggle={() => handleToggle('dark_mode')}
              disabled={updating}
              description="Toggle app theme"
            />
            
            <List.Item
              title="Language"
              description={languageOptions.find(lang => lang.value === preferences.language)?.label}
              onPress={() => setLanguageMenuVisible(true)}
              right={() => (
                <Menu
                  visible={languageMenuVisible}
                  onDismiss={() => setLanguageMenuVisible(false)}
                  anchor={<Button>Select</Button>}
                >
                  {languageOptions.map(lang => (
                    <Menu.Item
                      key={lang.value}
                      onPress={() => handleLanguageChange(lang.value)}
                      title={lang.label}
                    />
                  ))}
                </Menu>
              )}
            />
            
            <Divider style={styles.divider} />
            
            {/* Disabled Notification Types Section */}
            <SectionHeader 
              title="Notification Types" 
              description="Select which notifications you want to receive" 
            />
            
            {Array.isArray(notificationTypes) && notificationTypes.length > 0 ? (
              notificationTypes.map(type => (
                <List.Item
                  key={type.id}
                  title={type.description || type.name}
                  right={() => (
                    <Checkbox
                      status={preferences.disabled_notification_types.includes(type.name) ? 'unchecked' : 'checked'}
                      onPress={() => handleDisabledTypesChange(type.name)}
                      disabled={updating}
                    />
                  )}
                />
              ))
            ) : (
              <List.Item
                title="No notification types available"
                description="Notification settings couldn't be loaded"
              />
            )}
            
            <Divider style={styles.divider} />
            
            {/* Advanced Settings Section */}
            <SectionHeader 
              title="Advanced Notification Settings" 
              description="Customize your notification experience" 
            />
            
            {/* For patient users */}
            {userType === 'patient' && (
              <List.Accordion
                title="Appointment Reminders"
                expanded={expandedSections.appointmentReminders}
                onPress={() => toggleAdvancedSection('appointmentReminders')}
              >
                <List.Subheader>When to receive reminders</List.Subheader>
                
                {['24h', '1h', 'immediate'].map(option => {
                  const labels = {
                    '24h': '24 hours before',
                    '1h': '1 hour before',
                    'immediate': 'At time of scheduling'
                  };
                  
                  const timing = getAdvancedPreference('frequency.appointment_reminder.timing') || [];
                  
                  return (
                    <List.Item
                      key={option}
                      title={labels[option as keyof typeof labels]}
                      right={() => (
                        <Checkbox
                          status={timing.includes(option) ? 'checked' : 'unchecked'}
                          onPress={() => {
                            const currentTiming = [...timing];
                            if (currentTiming.includes(option)) {
                              updateAdvancedPreference(
                                'frequency.appointment_reminder.timing',
                                currentTiming.filter(t => t !== option)
                              );
                            } else {
                              updateAdvancedPreference(
                                'frequency.appointment_reminder.timing',
                                [...currentTiming, option]
                              );
                            }
                          }}
                        />
                      )}
                    />
                  );
                })}
              </List.Accordion>
            )}
            
            {/* For therapist users */}
            {userType === 'therapist' && (
              <List.Accordion
                title="New Patient Assignments"
                expanded={expandedSections.newPatientAssignments}
                onPress={() => toggleAdvancedSection('newPatientAssignments')}
              >
                <List.Subheader>Notification channels</List.Subheader>
                
                {['email', 'in_app'].map(option => {
                  const labels = {
                    'email': 'Email',
                    'in_app': 'In-App'
                  };
                  
                  const channels = getAdvancedPreference('frequency.new_patient_assigned.channels') || [];
                  
                  return (
                    <List.Item
                      key={option}
                      title={labels[option as keyof typeof labels]}
                      right={() => (
                        <Checkbox
                          status={channels.includes(option) ? 'checked' : 'unchecked'}
                          onPress={() => {
                            const currentChannels = [...channels];
                            if (currentChannels.includes(option)) {
                              updateAdvancedPreference(
                                'frequency.new_patient_assigned.channels',
                                currentChannels.filter(c => c !== option)
                              );
                            } else {
                              updateAdvancedPreference(
                                'frequency.new_patient_assigned.channels',
                                [...currentChannels, option]
                              );
                            }
                          }}
                        />
                      )}
                    />
                  );
                })}
              </List.Accordion>
            )}
            
            {/* Common to all users */}
            <List.Accordion
              title="Quiet Hours"
              expanded={expandedSections.quietHours}
              onPress={() => toggleAdvancedSection('quietHours')}
            >
              <List.Item
                title="Enable Quiet Hours"
                right={() => (
                  <Switch
                    value={getAdvancedPreference('push.quiet_hours.enabled') || false}
                    onValueChange={(value) => updateAdvancedPreference('push.quiet_hours.enabled', value)}
                  />
                )}
              />
              
              <List.Item
                title="Start Time"
                description={getAdvancedPreference('push.quiet_hours.start') || 'Not set'}
                onPress={() => handleTimePickerPress('start')}
              />
              
              <List.Item
                title="End Time"
                description={getAdvancedPreference('push.quiet_hours.end') || 'Not set'}
                onPress={() => handleTimePickerPress('end')}
              />
            </List.Accordion>
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
      
      {timePickerVisible && (
        <Portal>
          <Modal
            visible={timePickerVisible}
            onDismiss={() => setTimePickerVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          </Modal>
        </Portal>
      )}
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
  },
  divider: {
    marginVertical: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center'
  }
});

export default NotificationSettingsScreen;