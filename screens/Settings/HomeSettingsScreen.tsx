import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Switch, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SettingsStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation will be handled by the AuthContext's state change
    } catch (error) {
      console.error("Logout error:", error);
      // Handle error if needed
    }
  };

  // Get profile picture from patient_profile or therapist_profile
  const getProfilePic = () => {
    if (user?.user_type === 'patient' && user.patient_profile?.profile_pic) {
      return { uri: user.patient_profile.profile_pic };
    }
    if (user?.user_type === 'therapist' && user.therapist_profile?.profile_pic) {
      return { uri: user.therapist_profile.profile_pic };
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#E4F0F6', '#FFFFFF']} style={styles.gradientContainer}>
        <View style={styles.profileContainer}>
          <Image
            source={getProfilePic()}
            style={styles.avatar}
            defaultSource={require('../../assets/default-avatar.png')}
          />
          <Text style={styles.name}>{getUserFullName()}</Text>
          <Text style={styles.subtitle}>{user?.user_type || 'Account'}</Text>
        </View>

        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => navigation.navigate('UserProfile')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="pencil" size={24} color="#002D62" />
            </View>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => navigation.navigate('UserSettings')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="settings" size={24} color="#002D62" />
            </View>
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => navigation.navigate('UserPreferences')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="shield" size={24} color="#002D62" />
            </View>
            <Text style={styles.buttonText}>Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton}>
            <View style={styles.iconContainer}>
              <Ionicons name="help" size={24} color="#002D62" />
            </View>
            <Text style={styles.buttonText}>Help</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notificationContainer}>
          <Text style={styles.notificationText}>Receive notifications</Text>
          <Switch
            trackColor={{ false: '#E8E1FF', true: '#002D62' }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#E8E1FF"
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  gridButton: {
    backgroundColor: '#F0EAFF',
    borderRadius: 16,
    width: '48%',
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 10,
  },
  buttonText: {
    color: '#002D62',
    fontWeight: '500',
    fontSize: 15,
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  actionButtonsContainer: {
    marginTop: 10,
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

export default ProfileScreen;