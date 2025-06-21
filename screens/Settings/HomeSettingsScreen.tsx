import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Switch, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SettingsStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AZIZ_BAHLOUL } from '../../data/tunisianMockData';
import { handleLogout } from '../auth/logoutHandler';
import LoadingSpinner from '../../components/LoadingSpinner';
import { globalStyles } from '../../styles/global';

const HomeSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const { user, signOut } = useAuth(); // Get both user and signOut
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Mock user profile data - simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set notification default state
        setNotificationsEnabled(true);
        
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

  // Get profile picture - use mock data for Aziz Bahloul
  const getProfilePic = () => {
    // For demo, always show Aziz Bahloul's profile
    if (AZIZ_BAHLOUL.profile_pic) {
      return { uri: AZIZ_BAHLOUL.profile_pic };
    }
    return require('../../assets/default-avatar.png');
  };

  // Get user's full name - use mock data for Aziz Bahloul
  const getUserFullName = () => {
    // For demo, always show Aziz Bahloul's name
    return AZIZ_BAHLOUL.full_name;
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
              <Ionicons name="chevron-forward" size={20} color={globalStyles.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem} 
              onPress={() => navigation.navigate('AppSettings')}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons name="settings-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>App Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={globalStyles.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons name="notifications-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>Notification Preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={globalStyles.colors.textSecondary} />
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
                <Ionicons name="chevron-forward" size={20} color={globalStyles.colors.textSecondary} />
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
                <Ionicons name="chevron-forward" size={20} color={globalStyles.colors.textSecondary} />
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
              <Ionicons name="chevron-forward" size={20} color={globalStyles.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="shield-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={globalStyles.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="document-text-outline" size={24} color="#002D62" />
                <Text style={styles.settingsItemText}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={globalStyles.colors.textSecondary} />
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
    color: globalStyles.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: globalStyles.colors.textSecondary,
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
    color: globalStyles.colors.text,
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
    color: globalStyles.colors.text,
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