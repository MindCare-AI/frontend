import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Appbar, ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SettingsStackParamList } from '../../types/navigation';
import { UserAvatarCard } from '../../components/SettingsScreen/UserAvatarCard';
import { ProfileForm } from '../../components/SettingsScreen/ProfileForm';
import { getUserProfile, updateUserProfile, UserProfile } from '../../API/settings/user';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const theme = useTheme();
  const { user } = useAuth();

  // State for managing profile data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Animation refs
  const containerRef = useRef(null);
  const formRef = useRef(null);

  // Load profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        setOriginalProfile(JSON.parse(JSON.stringify(data)));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    if (!profile || !originalProfile) return;

    const hasChanged = JSON.stringify(profile) !== JSON.stringify(originalProfile);
    setHasChanges(hasChanged);
  }, [profile, originalProfile]);

  // Prevent accidental back navigation with unsaved changes
  useEffect(() => {
    const beforeRemoveListener = (e: any) => {
      if (!hasChanges) return;
      
      e.preventDefault();
      
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    };
    
    navigation.addListener('beforeRemove', beforeRemoveListener);
    
    return () => {
      navigation.removeListener('beforeRemove', beforeRemoveListener);
    };
  }, [navigation, hasChanges]);

  // GSAP Animations
  useGSAP(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out'
    });

    if (formRef.current) {
      gsap.from(formRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.5,
        delay: 0.2,
        ease: 'power2.out'
      });
    }
  }, { scope: containerRef, dependencies: [loading] });

  const handleProfileChange = (changes: Partial<UserProfile>) => {
    setProfile(prevProfile => {
      if (!prevProfile) return changes as UserProfile;
      return { ...prevProfile, ...changes };
    });
  };

  const handleAvatarChange = async (uri: string) => {
    try {
      // In a real implementation, you would upload the image to your server
      // For this example, we'll just update the profile with the local URI
      
      // Create a form data object
      const formData = new FormData();
      formData.append('avatar', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      handleProfileChange({ avatar: uri });
    } catch (err) {
      console.error('Error updating avatar:', err);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      
      // Update profile on the server
      await updateUserProfile(profile);
      
      // Update the original profile to match current
      setOriginalProfile(JSON.parse(JSON.stringify(profile)));
      
      // Success animation
      if (formRef.current) {
        gsap.to(formRef.current, {
          scale: 1.02,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        });
      }

      // Show confirmation
      Alert.alert('Success', 'Your profile has been updated successfully.');
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.errorContainer}>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container} ref={containerRef}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Profile" />
        {hasChanges && (
          <Appbar.Action 
            icon="check" 
            onPress={handleSave} 
            disabled={saving} 
          />
        )}
      </Appbar.Header>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View ref={formRef}>
          <UserAvatarCard
            firstName={profile.firstName}
            lastName={profile.lastName}
            role={user?.type || 'user'}
            avatarUrl={profile.avatar}
            onAvatarChange={handleAvatarChange}
            loading={saving}
          />
          
          <ProfileForm
            initialData={profile}
            onUpdate={handleProfileChange}
            loading={saving}
          />
          
          {hasChanges && (
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              style={styles.saveButton}
            >
              Save Changes
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  errorButton: {
    marginTop: 20,
  },
  saveButton: {
    marginTop: 24,
  },
});