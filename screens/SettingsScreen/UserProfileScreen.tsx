//screens/SettingsScreen/UserProfileScreen.tsx
import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Animated, Easing } from 'react-native';
import { Button, Text, IconButton, Surface, Divider, TextInput } from 'react-native-paper';
import { NavigationProp } from '@react-navigation/native';
import { SettingsStackParamList } from '../../types/navigation';
import { ProfileAvatar } from './components/ProfileAvatar';
import { PatientEmergencyContact } from './components/patient/PatientEmergencyContact';
import { PatientMedicalInfo } from './components/patient/PatientMedicalInfo';
import { useProfile } from './hooks/useProfile';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { gsap } from 'gsap';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { 
  EmergencyContact, 
  PatientProfile, 
  TherapistProfile, 
  FullProfile, 
  BaseProfile,
  MedicalProfile 
} from '../../types/profile';

interface UserProfileScreenProps {
  navigation: NavigationProp<SettingsStackParamList, 'UserProfile'>;
}

interface BasicUserInfo {
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
}

interface NotificationPreferences {
  email_notifications: boolean;
  in_app_notifications: boolean;
  disabled_notification_types: string[];
}

interface TherapistProfessionalInfo {
  specialization: string;
  license_number: string;
  years_of_experience: number;
  bio: string;
  treatment_approaches: string;
  available_days: string;
  license_expiry: string | null;
  video_session_link: string;
  languages_spoken: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
}

const LoadingSkeleton = () => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View style={[styles.skeletonItem, { opacity }]} />
      <Animated.View style={[styles.skeletonItem, { opacity }]} />
      <Animated.View style={[styles.skeletonItem, { opacity }]} />
    </View>
  );
};

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation }) => {
  const { user, signOut, fetchUserData, accessToken, updateUser } = useAuth();
  const {
    profile,
    loading,
    error,
    saveProfile,
    userType,
    refetch: refetchProfile, // rename refetch to refetchProfile for clarity
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

  const MAX_RETRIES = 3;
  const [retryCount, setRetryCount] = useState(0);
  const saveButtonScale = new Animated.Value(1);

  useEffect(() => {
    if (!user || !accessToken) return;
    
    // Only fetch if we don't have a local profile yet
    if (!localProfile && !loading) {
      refetchProfile();
    }
  }, [user?.patient_profile?.unique_id, accessToken]); // Remove dependencies that change frequently

  // Update debug effect to run less frequently
  useEffect(() => {
    console.log("Debug User Info:", {
      hasUser: !!user,
      userType: user?.user_type ?? 'unknown',
      hasPatientProfile: !!user?.patient_profile,
      patientProfileId: user?.patient_profile?.unique_id,
      profileUserType: userType
    });
  }, [user?.id, user?.user_type, user?.patient_profile?.unique_id]);

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

  const processProfileData = (apiResponse: any, userType: string): FullProfile => {
    // Base profile fields that are always required
    const baseProfile = {
      id: apiResponse.id,
      user: apiResponse.user,
      first_name: apiResponse.first_name,
      last_name: apiResponse.last_name,
      email: apiResponse.email,
      phone_number: apiResponse.phone_number || null,
      profile_pic: apiResponse.profile_pic || null,
      created_at: apiResponse.created_at,
      updated_at: apiResponse.updated_at,
      // Initialize all fields with default values
      medical_history: null,
      current_medications: null,
      blood_type: null,
      treatment_plan: null,
      pain_level: null,
      last_appointment: null,
      next_appointment: null,
      user_name: '',
      verification_status: undefined,
      username: '',
      specialization: '',
      license_number: null,
      years_of_experience: 0,
      bio: null,
      treatment_approaches: {},
      available_days: {},
      license_expiry: null,
      video_session_link: null,
      languages_spoken: [],
      profile_completion_percentage: 0,
      is_profile_complete: false
    };
  
    // Add type-specific fields
    if (userType === 'patient') {
      return {
        ...baseProfile,
        user_name: apiResponse.user_name || '',
        medical_history: apiResponse.medical_history || null,
        current_medications: apiResponse.current_medications || null,
        blood_type: apiResponse.blood_type || null,
        treatment_plan: apiResponse.treatment_plan || null,
        pain_level: apiResponse.pain_level || null,
        last_appointment: apiResponse.last_appointment || null,
        next_appointment: apiResponse.next_appointment || null
      };
    } else {
      return {
        ...baseProfile,
        verification_status: apiResponse.verification_status,
        username: apiResponse.username || '',
        specialization: apiResponse.specialization || '',
        license_number: apiResponse.license_number || null,
        years_of_experience: apiResponse.years_of_experience || 0,
        bio: apiResponse.bio || null,
        treatment_approaches: apiResponse.treatment_approaches || {},
        available_days: apiResponse.available_days || {},
        license_expiry: apiResponse.license_expiry || null,
        video_session_link: apiResponse.video_session_link || null,
        languages_spoken: apiResponse.languages_spoken || [],
        profile_completion_percentage: apiResponse.profile_completion_percentage || 0,
        is_profile_complete: apiResponse.is_profile_complete || false
      };
    }
  };

  //Update the profile conversion effect
  React.useEffect(() => {
    if (!profile || !profile.id || !user?.user_type) return;
    if (localProfile?.id === profile.id) return;
  
    try {
      const processedProfile = processProfileData(profile, user.user_type);
      setLocalProfile(processedProfile);
      setProfileFinalized(true);
      console.log('Profile loaded successfully:', processedProfile.id);
    } catch (err) {
      console.error('Error processing profile:', err);
      Alert.alert('Error', 'Could not process profile data');
    }
  }, [profile, user?.user_type]);

  const recoveryAttempted = useRef(false);

  //Recovery effect (runs only once)
  React.useEffect(() => {
    //If localProfile exists or we've attempted recovery, do nothing
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

  useEffect(() => {
    if (!user?.id || !accessToken || retryCount >= MAX_RETRIES) return;

    const attemptProfileRecovery = async () => {
      try {
        setIsSaving(true);
        const success = await linkUserToProfile();
        if (success) {
          setProfileFinalized(true);
        } else {
          setRetryCount(prev => prev + 1);
          setAutoRecoveryFailed(true);
        }
      } catch (err) {
        console.error("Profile recovery failed:", err);
        setAutoRecoveryFailed(true);
      } finally {
        setIsSaving(false);
      }
    };

    if (!localProfile && !autoRecoveryFailed) {
      attemptProfileRecovery();
    }
  }, [user?.id, accessToken, retryCount, localProfile, autoRecoveryFailed]);

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
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.sequence([
      Animated.spring(saveButtonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(saveButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

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
      const processedProfile: FullProfile = {
        ...updatedProfile,
        // Initialize all optional fields as null/undefined
        medical_history: null,
        current_medications: null,
        blood_type: null,
        treatment_plan: null,
        pain_level: null,
        last_appointment: null,
        next_appointment: null,
        emergency_contact: undefined,
        specialization: undefined,
        license_number: null,
        years_of_experience: undefined,
        bio: null,
        treatment_approaches: undefined,
        available_days: undefined,
        license_expiry: null,
        video_session_link: null,
        languages_spoken: undefined,
        profile_completion_percentage: undefined,
        is_profile_complete: undefined,
        verification_status: undefined,
        // Then spread the specific profile type properties
        ...(user.user_type === 'patient' 
          ? updatedProfile 
          : { ...updatedProfile, verification_status: updatedProfile.verification_status }
        )
      };
      
      setLocalProfile(processedProfile);
      
      // Success animation
      gsap.to(contentRef.current, {
        y: -5,
        duration: 0.3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      if (refetchProfile) await refetchProfile();
      
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
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      profile_pic: profile.profile_pic || null,
      phone_number: profile.phone_number || null
    };
    
    if (userType === 'patient') {
      return {
        ...baseFields,
        user_name: profile.user_name || '',
        medical_history: profile.medical_history || null,
        current_medications: profile.current_medications || null,
        blood_type: profile.blood_type || null,
        treatment_plan: profile.treatment_plan || null,
        pain_level: profile.pain_level || null,
        last_appointment: profile.last_appointment || null,
        next_appointment: profile.next_appointment || null
      };
    } else {
      return {
        ...baseFields,
        username: profile.username || '',
        specialization: profile.specialization || '',
        license_number: profile.license_number || null,
        years_of_experience: profile.years_of_experience || 0,
        bio: profile.bio || null,
        treatment_approaches: profile.treatment_approaches || {},
        available_days: profile.available_days || {},
        license_expiry: profile.license_expiry || null,
        video_session_link: profile.video_session_link || null,
        languages_spoken: profile.languages_spoken || []
      };
    }
  };

  // Update linkUserToProfile function
  const linkUserToProfile = async () => {
    if (!user?.id || !accessToken) {
      throw new Error('User authentication required');
    }
  
    try {
      const endpoint = `${API_URL}/${user.user_type}/profiles/`;
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`Profile fetch failed: ${response.statusText}`);
      }
  
      const data = await response.json();
      const existingProfile = data.results?.find(
        (p: any) => String(p.user) === String(user.id)
      );
  
      if (existingProfile) {
        if (updateUser) {
          await updateUser({
            ...user,
            [`${user.user_type}_profile`]: {
              id: existingProfile.id,
              unique_id: String(existingProfile.id)
            }
          });
          await fetchUserData();
          if (refetchProfile) await refetchProfile();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Profile linking failed:', error);
      throw error;
    }
  };

  // Update recovery effect
  useEffect(() => {
    if (!user?.id || !accessToken || retryCount >= MAX_RETRIES || localProfile || autoRecoveryFailed) {
      return;
    }
  
    const attemptRecovery = async () => {
      try {
        setIsSaving(true);
        const success = await linkUserToProfile();
        if (success) {
          setProfileFinalized(true);
        } else {
          setRetryCount(prev => prev + 1);
          if (retryCount + 1 >= MAX_RETRIES) {
            setAutoRecoveryFailed(true);
          }
        }
      } catch (err) {
        console.error('Profile recovery failed:', err);
        setAutoRecoveryFailed(true);
      } finally {
        setIsSaving(false);
      }
    };
  
    attemptRecovery();
  }, [user?.id, accessToken, retryCount, localProfile, autoRecoveryFailed]);

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
            <LoadingSkeleton />
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
              profile={{ ...localProfile, profile_pic: localProfile?.profile_pic || undefined }}
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
                    setProfile={(updatedMedicalInfo: Partial<MedicalProfile>) => 
                      setLocalProfile(prev => (prev ? { ...prev, ...updatedMedicalInfo, id: prev.id } : prev))
                    } 
                  />
                </Surface>
                
                <Surface style={styles.card}>
                  <Text style={styles.cardTitle}>Emergency Contact</Text>
                  <Divider style={styles.divider} />
                  <PatientEmergencyContact
                    emergencyContact={
                      localProfile!.emergency_contact || { name: '', relationship: '', phone: '' }
                    }
                    onEmergencyContactChange={(contact) => 
                      setLocalProfile(prev => (prev ? { ...prev, emergency_contact: contact } : prev))
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

          <Animated.View style={[
            styles.saveButtonContainer,
            { transform: [{ scale: saveButtonScale }] }
          ]}>
            <Button 
              mode="contained" 
              onPress={handleSave}
              loading={isSaving}
              style={styles.saveButton}
              contentStyle={styles.saveButtonContent}
              labelStyle={styles.saveButtonLabel}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Animated.View>
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
  saveButtonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: '#002D62',
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: 8,
    height: 56,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  skeletonContainer: {
    padding: 20,
    gap: 16,
  },
  skeletonItem: {
    height: 60,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
});