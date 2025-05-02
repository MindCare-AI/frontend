import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateUserProfile, UserProfile } from '../../API/settings/user';
import UserAvatarCard from '../../components/ui/UserAvatarCard';
import SectionHeader from '../../components/ui/SectionHeader';
import ProfileForm from '../../components/Settings/ProfileForm';
import { globalStyles } from '../../styles/global';
import { SettingsStackParamList } from '../../types/navigation';

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getUserProfile();
      setProfile(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile information');
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedProfile: Partial<UserProfile>) => {
    try {
      setIsSaving(true);
      await updateUserProfile(updatedProfile);
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Do you want to change your password?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // Navigate to change password form or open modal
            Alert.alert('Feature Coming Soon', 'Password change functionality will be available soon');
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={globalStyles.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {profile && (
          <>
            <UserAvatarCard
              avatar={profile.avatar}
              name={`${profile.firstName} ${profile.lastName}`}
              role={user?.user_type}
            />

            <View style={styles.section}>
              <SectionHeader title="Profile Information" />
              <ProfileForm
                profile={profile}
                onSubmit={handleUpdateProfile}
                isLoading={isSaving}
              />
              
              {/* Conditional rendering based on user role */}
              {user?.user_type === 'patient' && (
                <View style={styles.roleSpecificSection}>
                  <SectionHeader title="Patient Information" />
                  <Text style={styles.infoText}>
                    Update your additional patient details in the Medical Information section.
                  </Text>
                  <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('PatientMedicalInfo')}
                  >
                    <Text style={styles.linkButtonText}>Go to Medical Information</Text>
                  </TouchableOpacity>
                </View>
              )}

              {user?.user_type === 'therapist' && (
                <View style={styles.roleSpecificSection}>
                  <SectionHeader title="Professional Information" />
                  <Text style={styles.infoText}>
                    Update your professional details, credentials, and specialties in the Professional Profile section.
                  </Text>
                  <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('TherapistProfile')}
                  >
                    <Text style={styles.linkButtonText}>Go to Professional Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.passwordButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.passwordButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: globalStyles.colors.white,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    // Replace getShadowStyles with inline shadow definition
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  roleSpecificSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: globalStyles.colors.border,
  },
  infoText: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
    marginBottom: 12,
  },
  linkButton: {
    padding: 12,
    backgroundColor: globalStyles.colors.primaryLight,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkButtonText: {
    color: globalStyles.colors.primary,
    fontWeight: '500',
  },
  passwordButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: globalStyles.colors.primaryLight,
    alignItems: 'center',
  },
  passwordButtonText: {
    color: globalStyles.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;