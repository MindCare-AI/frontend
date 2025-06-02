import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Switch, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SettingsStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserProfile } from '../../API/settings/user';
import { getNotificationTypes } from '../../API/settings/notifications';
import { handleLogout } from '../auth/logoutHandler';
import LoadingSpinner from '../../components/LoadingSpinner';

const HomeSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const { user, signOut } = useAuth(); // Get both user and signOut
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile data
        const profileData = await getUserProfile();
        
        // Fetch notification settings - use the correct function
        const notificationData = await getNotificationTypes(); // Fix: Use correct function
        
        // Update notification state based on available data
        if (notificationData) {
          // Set a default value since getNotificationTypes returns different data
          setNotificationsEnabled(false); // Or derive from notificationData structure
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const toggleNotifications = async () => {
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      
      // Note: updateNotificationSettings function doesn't exist in the API
      // This would need to be implemented in the notifications API module
      // For now, just update the local state
      console.log('Notification setting changed to:', newValue);
    } catch (error) {
      console.error('Error updating notifications:', error);
      // Revert UI state if there was an error
      setNotificationsEnabled(!notificationsEnabled);
    }
  };

  const onLogoutPress = () => {
    handleLogout(navigation, signOut).catch(error => {
      console.error('Failed to logout:', error);
    });
  };

  // Get profile picture from patient_profile or therapist_profile
  const getProfilePic = () => {
    if (user?.user_type === 'patient' && user.patient_profile?.profile_pic) {
      const profilePic = user.patient_profile.profile_pic;
      // Handle relative URLs
      if (profilePic.startsWith('/media/')) {
        return { uri: `http://127.0.0.1:8000${profilePic}` };
      }
      return { uri: profilePic };
    }
    if (user?.user_type === 'therapist' && user.therapist_profile?.profile_pic) {
      const profilePic = user.therapist_profile.profile_pic;
      // Handle relative URLs
      if (profilePic.startsWith('/media/')) {
        return { uri: `http://127.0.0.1:8000${profilePic}` };
      }
      return { uri: profilePic };
    }
    return require('../../assets/default-avatar.png');
  };

  // Get user's full name from patient_profile or therapist_profile
  const getUserFullName = () => {
    if (user?.user_type === 'patient' && user.patient_profile?.first_name) {
      return `${user.patient_profile.first_name} ${user.patient_profile.last_name || ''}`;
    }
    if (user?.user_type === 'therapist' && user.therapist_profile?.first_name) {
      return `${user.therapist_profile.first_name} ${user.therapist_profile.last_name || ''}`;
    }
    return 'User Profile';
  };

  if (loading) {
    return <LoadingSpinner visible={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <LinearGradient colors={['#E4F0F6', '#FFFFFF']} style={styles.gradientContainer}>
          <View style={styles.profileContainer}>
            <Image
              source={getProfilePic()}
              style={styles.avatar}
              defaultSource={require('../../assets/default-avatar.png')}
            />
            <Text style={styles.name}>{getUserFullName()}</Text>
            <Text style={styles.subtitle}>{user?.user_type || 'Account'}</Text>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => {
                if (user?.user_type === 'patient') {
                  navigation.navigate('PatientProfile');
                } else if (user?.user_type === 'therapist') {
                  navigation.navigate('TherapistProfile');
                }
              }}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity 
              style={styles.settingsItem} 
              onPress={() => {
                if (user?.user_type === 'patient') {
                  navigation.navigate('PatientProfile');
                } else if (user?.user_type === 'therapist') {
                  navigation.navigate('TherapistProfile');
                }
              }}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons name="person-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem} 
              onPress={() => navigation.navigate('AppSettings')}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons name="settings-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>App Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons name="notifications-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>Notification Preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
            
            {user?.user_type === 'patient' && (
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => navigation.navigate('PatientMedicalInfo')}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="medical-outline" size={24} color="#002D62" />
                  <Text style={styles.settingsItemText}>Medical Information</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            )}
            
            {user?.user_type === 'therapist' && (
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => navigation.navigate('Availability')}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="briefcase-outline" size={24} color="#002D62" />
                  <Text style={styles.settingsItemText}>Availability</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>General</Text>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="help-circle-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="shield-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="document-text-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
            
            <View style={styles.notificationContainer}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="notifications-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>Push Notifications</Text>
              </View>
              <Switch
                trackColor={{ false: '#E8E1FF', true: '#002D62' }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E8E1FF"
                onValueChange={toggleNotifications}
                value={notificationsEnabled}
              />
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={onLogoutPress}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientContainer: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 15,
  },
  editProfileButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#002D62',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  editProfileText: {
    color: '#002D62',
    fontWeight: '500',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 16,
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  actionButtonsContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#002D62',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F0EAFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteText: {
    color: '#002D62',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeSettingsScreen;