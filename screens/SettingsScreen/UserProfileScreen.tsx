//screens/SettingsScreen/UserProfileScreen.tsx
import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Alert, SafeAreaView, Animated, Easing, Platform, Image } from 'react-native';
import { Button, Text, IconButton, Surface, Divider, TextInput, ActivityIndicator } from 'react-native-paper';
import { NavigationProp } from '@react-navigation/native';
import { SettingsStackParamList } from '../../types/navigation';
import { ProfileAvatar } from './components/ProfileAvatar';
import { PatientEmergencyContact } from './components/patient/PatientEmergencyContact';
import { PatientMedicalInfo } from './components/patient/PatientMedicalInfo';
import { TherapistProfessionalInfo } from './components/therapist/TherapistProfessionalInfo';
import { useProfile } from './hooks/useProfile';
import { useAuth } from '../../contexts/AuthContext';
import { gsap } from 'gsap';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PatientProfile, TherapistProfile } from '../../types/profile';
import type {
  TherapistProfile as TherapistProfileType,
  PatientProfile as PatientProfileType
} from '../../types/profile';

type ProfileType = PatientProfile | TherapistProfile;

const LoadingSkeleton = () => {
  const animatedValue = new Animated.Value(0);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: Platform.OS !== 'web',
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

interface UserProfileScreenProps {
  navigation: NavigationProp<SettingsStackParamList, 'UserProfile'>;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation }) => {
  const { profile, loading, error, saveProfile, refetch, userType } = useProfile();
  const { user, fetchUserData, accessToken } = useAuth();

  const [localProfile, setLocalProfile] = useState<ProfileType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const headerRef = useRef<any>(null);
  const avatarRef = useRef<any>(null);
  const contentRef = useRef<any>(null);
  const buttonRef = useRef<any>(null);
  const saveButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (profile && (!localProfile || localProfile.id !== profile.id)) {
      setLocalProfile(profile);
      setUsername(
        userType === 'patient'
          ? (profile as PatientProfile).user_name || ''
          : (profile as TherapistProfile).username || ''
      );
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setPhoneNumber(profile.phone_number || '');
    }
  }, [profile]);

  useEffect(() => {
    if (error) {
      Alert.alert('Profile Error', error, [{ text: 'OK' }]);
    }
  }, [error]);

  useEffect(() => {
    if (!headerRef.current) return;
    const tl = gsap.timeline();
    tl.from(headerRef.current, { y: -50, opacity: 0, duration: 0.6, ease: "power2.out" });
    tl.from(avatarRef.current, { scale: 0.5, opacity: 0, duration: 0.7, ease: "back.out(1.7)" }, "-=0.3");
    tl.from(contentRef.current, { y: 30, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.4");
    tl.from(buttonRef.current, { y: 20, opacity: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }, "-=0.2");
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#002D62" />
      </View>
    );
  }

  if (!localProfile) {
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

  if (!userType) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <LinearGradient colors={['#E4F0F6', '#FFFFFF']} style={styles.gradientContainer}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorHeading}>User Type Not Found</Text>
            <Text style={styles.errorText}>User type not recognized. ({user?.user_type || "undefined"})</Text>
            <Button 
              mode="contained" 
              onPress={() => fetchUserData()}
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!localProfile) throw new Error("No profile to save");

      if (userType === 'therapist') {
        // Narrow to therapist
        const therapist = localProfile as TherapistProfileType;
        const payload: Partial<TherapistProfileType> = {
          username,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber || '',
          available_days: therapist.available_days,
          treatment_approaches: therapist.treatment_approaches,
        };
        await saveProfile(payload);
      } else {
        // Narrow to patient
        const patient = localProfile as PatientProfileType;
        const payload: Partial<PatientProfileType> = {
          user_name: username,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber || '',
          // …other patient‐only fields…
        };
        await saveProfile(payload);
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      refetch();
      fetchUserData();
    } catch (err: any) {
      console.error("Error saving profile:", err);
      Alert.alert("Error", err.message || "Unable to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <LinearGradient colors={['#E4F0F6', '#FFFFFF']} style={styles.gradientContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
              profile={{ ...localProfile, profile_pic: localProfile?.profile_pic || undefined, user_type: userType }}
              onImageChange={(uri: string) => setLocalProfile({ ...localProfile, profile_pic: uri })}
            />
            <Image
              source={{ uri: 'https://example.com/valid-image.png' }} // Replace with a valid image URL
              style={styles.image}
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
                  value={username}
                  onChangeText={setUsername}
                  style={styles.inputField}
                />
              ) : (
                <TextInput
                  label="Username"
                  mode="outlined"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.inputField}
                />
              )}
              <TextInput
                label="First Name"
                mode="outlined"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.inputField}
              />
              <TextInput
                label="Last Name"
                mode="outlined"
                value={lastName}
                onChangeText={setLastName}
                style={styles.inputField}
              />
              <TextInput
                label="Email"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                style={styles.inputField}
                keyboardType="email-address"
              />
              <TextInput
                label="Phone Number"
                mode="outlined"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.inputField}
                keyboardType="phone-pad"
              />
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
                      medical_history: (localProfile as PatientProfile).medical_history || '',
                      current_medications: (localProfile as PatientProfile).current_medications || '',
                      blood_type: (localProfile as PatientProfile).blood_type || ''
                    }} 
                    setProfile={(updatedMedicalInfo: Partial<PatientProfile>) => 
                      setLocalProfile(prev => prev ? { ...prev, ...updatedMedicalInfo } : prev)
                    } 
                  />
                </Surface>
                
                <Surface style={styles.card}>
                  <Text style={styles.cardTitle}>Emergency Contact</Text>
                  <Divider style={styles.divider} />
                  <PatientEmergencyContact
                    emergencyContact={(localProfile as PatientProfile).emergency_contact || { name: '', relationship: '', phone: '' }}
                    onEmergencyContactChange={(contact) => 
                      setLocalProfile(prev => prev ? { ...prev, emergency_contact: contact } : prev)
                    }
                  />
                </Surface>
                <Surface style={styles.card}>
                  <Text style={styles.cardTitle}>Profile Metadata</Text>
                  <Divider style={styles.divider} />
                  <Text>Created At: {(localProfile as PatientProfile).created_at}</Text>
                  <Text>Updated At: {(localProfile as PatientProfile).updated_at}</Text>
                </Surface>
              </>
            ) : (
              <Surface style={styles.card}>
                <Text style={styles.cardTitle}>Therapist Professional Info</Text>
                <Divider style={styles.divider} />
                <TherapistProfessionalInfo
                  profile={localProfile as TherapistProfile}
                  setProfile={(upd) => setLocalProfile(p => p ? { ...p, ...upd } : p)}
                />
              </Surface>
            )}
          </View>

          <Animated.View ref={buttonRef} style={[styles.saveButtonContainer, { transform: [{ scale: saveButtonScale }] }]}>
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
        {isSaving && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#002D62" />
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeAreaContainer: { flex: 1 },
  gradientContainer: { flex: 1 },
  scrollContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingVertical: 8 },
  backButton: { backgroundColor: 'rgba(255, 255, 255, 0.8)', marginRight: 8 },
  headerTitle: { flex: 1, color: '#002D62', fontWeight: '600' },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  basicInfoCard: { marginBottom: 16 },
  contentContainer: { gap: 20 },
  card: { borderRadius: 12, padding: 20, elevation: 4, marginBottom: 16, backgroundColor: 'white', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#002D62', marginBottom: 12 },
  divider: { height: 1, backgroundColor: 'rgba(0, 45, 98, 0.1)', marginBottom: 16 },
  inputField: { marginVertical: 8, backgroundColor: 'white' },
  loadingContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorHeading: { fontSize: 22, fontWeight: 'bold', color: '#002D62', marginBottom: 12, textAlign: 'center' },
  errorText: { textAlign: 'center', marginBottom: 24, fontSize: 16, color: '#666', lineHeight: 22 },
  actionButton: { marginTop: 16, width: '80%', borderRadius: 10, backgroundColor: '#002D62' },
  buttonContent: { paddingVertical: 8, height: 50 },
  buttonLabel: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  outlinedButton: { backgroundColor: 'transparent', borderColor: '#002D62', borderWidth: 2 },
  outlinedButtonLabel: { color: '#002D62', fontSize: 16, fontWeight: 'bold' },
  saveButtonContainer: { marginTop: 24, marginBottom: 32 },
  saveButton: { backgroundColor: '#002D62', paddingVertical: 12, borderRadius: 12 },
  saveButtonContent: { paddingVertical: 8, height: 56 },
  saveButtonLabel: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  skeletonContainer: { padding: 20, gap: 16 },
  skeletonItem: { height: 60, backgroundColor: '#E5E7EB', borderRadius: 12 },
  image: { width: 100, height: 100, borderRadius: 50, marginTop: 16 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});