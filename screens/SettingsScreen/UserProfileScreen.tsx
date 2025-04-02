//screens/SettingsScreen/UserProfileScreen.tsx
import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Button, Text, IconButton, Surface, Divider, TextInput } from 'react-native-paper';
import { NavigationProp } from '@react-navigation/native';
import { SettingsStackParamList } from '../../types/navigation';
import { ProfileAvatar } from './components/ProfileAvatar';
import { PatientEmergencyContact } from './components/patient/PatientEmergencyContact';
import { PatientMedicalInfo, PatientProfile as MedicalProfile } from './components/patient/PatientMedicalInfo';
import { useProfile } from './hooks/useProfile';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { EmergencyContact } from '../../types/profile'
import { gsap } from 'gsap';
import { LinearGradient } from 'expo-linear-gradient';

interface UserProfileScreenProps {
  navigation: NavigationProp<SettingsStackParamList, 'UserProfile'>;
}

interface FullProfile {
  id: number;
  user: number;
  profile_pic?: string;
  created_at?: string;
  updated_at?: string;
  // Patient-specific
  user_name?: string;
  medical_history?: string;
  current_medications?: string;
  blood_type?: string;
  treatment_plan?: string;
  pain_level?: number;
  last_appointment?: string;
  next_appointment?: string;
  emergency_contact?: EmergencyContact;
  // Therapist-specific
  username?: string;
  specialization?: string;
  license_number?: string;
  years_of_experience?: number;
  bio?: string;
  treatment_approaches?: string;
  available_days?: string;
  license_expiry?: string;
  video_session_link?: string;
  languages_spoken?: string;
  profile_completion_percentage?: number;
  is_profile_complete?: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected';
}

// Create a type for the patient profile items in API response
interface PatientProfileListItem {
  id: string | number;
  user: string | number;
}

// First, define proper types matching API responses
interface PatientProfile {
  id: number;
  user: number;
  user_name: string;
  medical_history: string;
  current_medications: string;
  profile_pic: string;
  blood_type: string;
  treatment_plan: string;
  pain_level: number;
  last_appointment: string;
  next_appointment: string;
  created_at: string;
  updated_at: string;
}

interface TherapistProfile {
  id: number;
  user: number;
  username: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  bio: string;
  profile_pic: string;
  treatment_approaches: string;
  available_days: string;
  license_expiry: string;
  video_session_link: string;
  languages_spoken: string;
  profile_completion_percentage: number;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
  verification_status?: 'pending' | 'verified' | 'rejected'; // Make this match FullProfile
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation }) => {
  const { user, signOut, fetchUserData, accessToken, updateUser } = useAuth();
  const {
    profile,
    loading,
    error,
    saveProfile,
    userType,
    refetch,
  } = useProfile();
  
  const [localProfile, setLocalProfile] = React.useState<FullProfile | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [autoRecoveryFailed, setAutoRecoveryFailed] = React.useState(false);
  const [profileFinalized, setProfileFinalized] = useState(false);
  
  // Refs for animations
  const headerRef = useRef(null);
  const avatarRef = useRef(null);
  const contentRef = useRef(null);
  const buttonRef = useRef(null);

  // Debug effect
  React.useEffect(() => {
    console.log("Debug User Info:", {
      hasUser: !!user,
      userType: user?.user_type,
      hasPatientProfile: !!user?.patient_profile,
      patientProfileId: user?.patient_profile?.unique_id,
      profileUserType: userType,
      hasProfile: !!profile,
    });
  }, [user, userType, profile]);

  // Error handling effect
  React.useEffect(() => {
    if (error) {
      Alert.alert(
        'Profile Error', 
        error,
        [
          {
            text: 'OK',
            onPress: () => {
              if (error.includes('sign in')) {
                signOut();
              }
            }
          }
        ]
      );
    }
  }, [error, signOut]);

  // Conversion effect that only updates if the profile is new
  React.useEffect(() => {
    if (profile) {
      // If we already have a localProfile with the same ID, don't reset
      const incomingId = ('id' in profile && profile.id) || undefined;
      if (localProfile && incomingId && localProfile.id === incomingId) {
        // No change, so do nothing.
        return;
      }
      try {
        let processedProfile: FullProfile;
        if ('verification_status' in profile) {
          // Therapist
          processedProfile = {
            ...(profile as TherapistProfile),
            verification_status: (profile as TherapistProfile).verification_status,
          };
        } else {
          // Patient
          processedProfile = {
            ...(profile as PatientProfile),
            verification_status: undefined,
          };
        }
        setLocalProfile(processedProfile);
        // Once we get a valid profile, mark as finalized
        setProfileFinalized(true);
        console.log('Profile loaded successfully', processedProfile.id);
      } catch (err) {
        console.error('Error processing profile data:', err);
        Alert.alert('Error', 'Could not process profile data');
      }
    }
  }, [profile]); // Remove localProfile as dependency so it doesn't re-run unnecessarily

  const recoveryAttempted = useRef(false);

  // Recovery effect (runs only once)
  React.useEffect(() => {
    // If localProfile exists or we've attempted recovery, do nothing
    if (localProfile || recoveryAttempted.current) return;

    recoveryAttempted.current = true; // mark as attempted

    let isMounted = true;

    const attemptProfileRecovery = async () => {
      if (!user?.id || !accessToken) return;
      try {
        setIsSaving(true);
        const success = await linkUserToProfile();
        if (isMounted) {
          if (!success) {
            setAutoRecoveryFailed(true);
          } else {
            // If linking was successful, mark finalized immediately if not already set
            setProfileFinalized(true);
          }
        }
      } catch (err) {
        console.error("Profile auto-recovery failed:", err);
        if (isMounted) setAutoRecoveryFailed(true);
      } finally {
        if (isMounted) setIsSaving(false);
      }
    };

    attemptProfileRecovery();
    return () => {
      isMounted = false;
    };
  }, [user?.id, accessToken]); // Not depending on localProfile here

  // Animation effect for when profile loads
  useEffect(() => {
    if (!localProfile || !headerRef.current || !avatarRef.current || !contentRef.current || !buttonRef.current) return;

    // Create a GSAP timeline
    const tl = gsap.timeline();

    // Animate the header sliding in from the top
    tl.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    });

    // Animate the avatar with a scale effect
    tl.from(avatarRef.current, {
      scale: 0.5,
      opacity: 0,
      duration: 0.7,
      ease: "back.out(1.7)"
    }, "-=0.3");

    // Animate the content fading in
    tl.from(contentRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.4");

    // Animate the save button bouncing in
    tl.from(buttonRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)"
    }, "-=0.2");
  }, [localProfile]);

  // Save profile handler
  const handleSave = async () => {
    if (!localProfile || !user?.id || !accessToken) {
      Alert.alert('Error', 'Missing required profile information');
      return;
    }
  
    // Button press animation
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
    
    setIsSaving(true);
    try {
      const endpoint = user.user_type === 'patient'
        ? `/patient/profiles/${user.patient_profile?.unique_id}/`
        : `/therapist/profiles/${user.therapist_profile?.unique_id}/`;
      
      // Create a sanitized copy of the profile to send
      const profileToSend = sanitizeProfileForAPI(localProfile, user.user_type);
  
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(profileToSend)
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMessage = `Failed to update profile: ${response.statusText}`;
        
        if (errorData && typeof errorData === 'object') {
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        }
        
        throw new Error(errorMessage);
      }
  
      const updatedProfile = await response.json();
      setLocalProfile(user.user_type === 'patient' 
        ? { ...(updatedProfile as PatientProfile), verification_status: undefined }
        : { ...(updatedProfile as TherapistProfile) }
      );
      
      // Success animation
      gsap.to(contentRef.current, {
        y: -5,
        duration: 0.3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      if (refetch) await refetch();
      
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'Error Saving Profile',
        error instanceof Error ? error.message : 'Failed to save profile'
      );
      
      // Error animation
      gsap.to(contentRef.current, {
        x: 10,
        duration: 0.1,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 3
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to sanitize profile data
  const sanitizeProfileForAPI = (profile: FullProfile, userType: string) => {
    const baseFields = {
      profile_pic: profile.profile_pic
    };
    
    if (userType === 'patient') {
      return {
        ...baseFields,
        medical_history: profile.medical_history || '',
        current_medications: profile.current_medications || '',
        blood_type: profile.blood_type || '',
        treatment_plan: profile.treatment_plan || '',
        pain_level: profile.pain_level || 0,
        last_appointment: profile.last_appointment || null,
        next_appointment: profile.next_appointment || null,
        emergency_contact: profile.emergency_contact || null
      };
    } else {
      return {
        ...baseFields,
        specialization: profile.specialization || '',
        license_number: profile.license_number || '',
        years_of_experience: profile.years_of_experience || 0,
        bio: profile.bio || '',
        treatment_approaches: profile.treatment_approaches || '',
        available_days: profile.available_days || '',
        license_expiry: profile.license_expiry || null,
        video_session_link: profile.video_session_link || '',
        languages_spoken: profile.languages_spoken || ''
      };
    }
  };

  // Link user to profile function
  const linkUserToProfile = async () => {
    try {
      setIsSaving(true);
      
      if (!user?.id || !accessToken) {
        throw new Error('User authentication required');
      }

      const endpoint = user.user_type === 'patient' 
        ? '/patient/profiles/'
        : '/therapist/profiles/';

      // Check if profile exists
      const listResponse = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        throw new Error(`Failed to check existing profiles (${listResponse.status}): ${errorText}`);
      }

      const data = await listResponse.json();
      const existingProfile = Array.isArray(data.results) ? data.results.find(
        (profile: PatientProfile | TherapistProfile) => 
          String(profile.user) === String(user.id)
      ) : null;

      if (existingProfile) {
        console.log('Found existing profile:', existingProfile.id);
        // Update user with existing profile
        if (updateUser) {
          await updateUser({
            ...user,
            user_type: user.user_type,
            [`${user.user_type}_profile`]: {
              id: existingProfile.id,
              unique_id: existingProfile.id.toString()
            }
          });
          await fetchUserData();
          if (refetch) await refetch();
          return true;
        }
      } else {
        // No profile exists, notify the user
        Alert.alert(
          'Profile Required',
          'Your profile needs to be set up. This should happen automatically. Please contact support if this issue persists.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Profile linking error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to link your profile'
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // If auto linking fails, show a retry button.
  if (!localProfile && autoRecoveryFailed) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <LinearGradient colors={['#E4F0F6', '#FFFFFF']} style={styles.gradientContainer}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorHeading}>Profile Not Found</Text>
            <Text style={styles.errorText}>
              We couldn't locate your profile automatically.
            </Text>
            <Button 
              mode="contained" 
              onPress={async () => {
                setAutoRecoveryFailed(false);
                setProfileFinalized(false);
                recoveryAttempted.current = false;
                // Re-attempt linking
                await linkUserToProfile();
              }}
              loading={isSaving}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Try Again
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => navigation.goBack()}
              style={[styles.actionButton, styles.outlinedButton]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.outlinedButtonLabel}
            >
              Go Back
            </Button>
            <Text style={styles.supportText}>
              If this issue persists, please contact support.
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Loading indicator remains until profileFinalized is true.
  if (loading || !profileFinalized) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <LinearGradient colors={['#E4F0F6', '#FFFFFF']} style={styles.gradientContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#002D62" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Handle missing user type
  if (!userType) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <LinearGradient
          colors={['#E4F0F6', '#FFFFFF']}
          style={styles.gradientContainer}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorHeading}>User Type Not Found</Text>
            <Text style={styles.errorText}>
              User type not recognized. ({user?.user_type || "undefined"})
            </Text>
            <Button 
              mode="contained" 
              onPress={async () => {
                try {
                  await fetchUserData();
                  navigation.goBack();
                } catch (error) {
                  console.error("Error refreshing user data:", error);
                }
              }}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Refresh User Data
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => navigation.goBack()}
              style={[styles.actionButton, styles.outlinedButton]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.outlinedButtonLabel}
            >
              Go Back
            </Button>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Handle missing profile
  if (!localProfile) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <LinearGradient
          colors={['#E4F0F6', '#FFFFFF']}
          style={styles.gradientContainer}
        >
          <View style={styles.errorContainer}>
            {!autoRecoveryFailed ? (
              <>
                <ActivityIndicator size="large" style={styles.loadingIndicator} color="#002D62" />
                <Text style={styles.recoveryText}>
                  Attempting to locate your profile information...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.errorHeading}>Profile Not Found</Text>
                <Text style={styles.errorText}>
                  {error || "We couldn't find your profile information."}
                </Text>
                <Button 
                  mode="contained" 
                  onPress={linkUserToProfile}
                  loading={isSaving}
                  style={styles.actionButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Try Again
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => navigation.goBack()}
                  style={[styles.actionButton, styles.outlinedButton]}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.outlinedButtonLabel}
                >
                  Go Back
                </Button>
                <Text style={styles.supportText}>
                  If you continue to encounter issues, please contact support.
                </Text>
              </>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Main profile screen
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <LinearGradient
        colors={['#E4F0F6', '#FFFFFF']}
        style={styles.gradientContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View ref={headerRef} style={styles.headerContainer}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            <Text variant="headlineMedium" style={styles.headerTitle}>
              {userType === 'patient' ? 'Patient' : 'Therapist'} Profile
            </Text>
          </View>

          <View ref={avatarRef} style={styles.avatarSection}>
            <ProfileAvatar 
              profile={localProfile}
              onImageChange={(uri: string) =>
                setLocalProfile({ ...localProfile, profile_pic: uri })
              }
            />
          </View>

          <View style={styles.basicInfoCard}>
            <Surface style={styles.card}>
              <Text style={styles.cardTitle}>Basic Information</Text>
              <Divider style={styles.divider} />
              {userType === 'patient' ? (
                <TextInput
                  label="Username"
                  mode="outlined"
                  value={localProfile?.user_name || ''}
                  onChangeText={(text) =>
                    setLocalProfile(prev => (prev ? { ...prev, user_name: text } : prev))
                  }
                  style={styles.inputField}
                />
              ) : (
                <TextInput
                  label="Username"
                  mode="outlined"
                  value={localProfile?.username || ''}
                  onChangeText={(text) =>
                    setLocalProfile(prev => (prev ? { ...prev, username: text } : prev))
                  }
                  style={styles.inputField}
                />
              )}
            </Surface>
          </View>

          <View ref={contentRef} style={styles.contentContainer}>
            {userType === 'patient' ? (
              <>
                <Surface style={styles.card}>
                  <Text style={styles.cardTitle}>Medical Information</Text>
                  <Divider style={styles.divider} />
                  <PatientMedicalInfo 
                    profile={{
                      medical_history: localProfile!.medical_history || '',
                      current_medications: localProfile!.current_medications || '',
                      blood_type: localProfile!.blood_type || ''
                    }} 
                    setProfile={(updatedMedicalInfo: MedicalProfile) => 
                      setLocalProfile(prev => (prev ? { ...prev, ...updatedMedicalInfo, id: prev.id } : prev))
                    } 
                  />
                </Surface>
                
                <Surface style={styles.card}>
                  <Text style={styles.cardTitle}>Emergency Contact</Text>
                  <Divider style={styles.divider} />
                  <PatientEmergencyContact
                    emergencyContact={localProfile!.emergency_contact || { name: '', relationship: '', phone: '', email: '' }}
                    onEmergencyContactChange={(contact) => 
                      setLocalProfile(prev => (prev ? { ...prev, emergency_contact: contact, id: prev.id } : prev))
                    }
                  />
                </Surface>
              </>
            ) : (
              <Surface style={styles.card}>
                <Text style={styles.cardTitle}>Therapist Information</Text>
                <Divider style={styles.divider} />
                <Text style={styles.infoText}>Therapist profile options will appear here</Text>
              </Surface>
            )}
          </View>

          <View ref={buttonRef} style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={handleSave}
              loading={isSaving}
              style={styles.saveButton}
              contentStyle={styles.saveButtonContent}
              labelStyle={styles.saveButtonLabel}
              disabled={isSaving}
            >
              Save Changes
            </Button>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Enhanced and improved styles
const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    marginRight: 8
  },
  headerTitle: {
    flex: 1,
    color: '#002D62',
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  basicInfoCard: {
    marginBottom: 16,
  },
  contentContainer: {
    gap: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    marginBottom: 16,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002D62',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 45, 98, 0.1)',
    marginBottom: 16,
  },
  inputField: {
    marginVertical: 8,
    backgroundColor: 'white'
  },
  infoText: {
    color: '#666',
    fontSize: 16,
    padding: 8,
  },
  buttonContainer: {
    marginVertical: 24, 
  },
  saveButton: {
    backgroundColor: '#002D62',
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveButtonContent: {
    paddingVertical: 8,
    height: 56,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#002D62",
    textAlign: "center",
  },
  loadingIndicator: {
    marginBottom: 20
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002D62',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  recoveryText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#002D62',
    marginTop: 20,
  },
  actionButton: {
    marginTop: 16,
    width: '80%',
    borderRadius: 10,
    backgroundColor: '#002D62',
  },
  buttonContent: {
    paddingVertical: 8,
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderColor: '#002D62',
    borderWidth: 2,
  },
  outlinedButtonLabel: {
    color: '#002D62',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportText: {
    marginTop: 24,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    fontSize: 14,
  },
});