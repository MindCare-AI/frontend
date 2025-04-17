import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Avatar } from '../ui/avatar';
import { TherapistProfile } from '../../types/profile';

export interface TherapistCardProps {
  therapist: TherapistProfile;
  isSelected: boolean;
  onSelect: () => void;
}

export const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, isSelected, onSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const pressAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (isLoading) return;

    Animated.spring(pressAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (isLoading) return;

    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePress = async () => {
    if (isLoading || !onSelect) return;

    setIsLoading(true);
    
    // Animate scale down
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    try {
      await onSelect();
    } finally {
      setIsLoading(false);
      // Animate scale back up
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const getRatingColor = () => {
    if (therapist.profile_completion_percentage / 20 >= 4.5) return '#059669';
    if (therapist.profile_completion_percentage / 20 >= 4.0) return '#0D9488';
    if (therapist.profile_completion_percentage / 20 >= 3.5) return '#D97706';
    return '#DC2626';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pressAnim) },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading}
        style={styles.touchable}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`View ${therapist.first_name} ${therapist.last_name}'s profile`}
        accessibilityHint={`${therapist.specialization} with ${therapist.years_of_experience} years of experience`}
      >
        <View style={styles.content}>
          <Avatar
            src={therapist.profile_pic ?? undefined}
            alt={`${therapist.first_name} ${therapist.last_name}`}
            size="lg"
            style={styles.avatar}
          />
          
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {`${therapist.first_name} ${therapist.last_name}`}
            </Text>
            <Text style={styles.specialty} numberOfLines={1}>
              {therapist.specialization}
            </Text>
            <Text style={styles.experience} numberOfLines={1}>
              {`${therapist.years_of_experience} years of experience`}
            </Text>
          </View>

          <View style={styles.ratingContainer}>
            <Text
              style={[
                styles.rating,
                { color: getRatingColor() },
              ]}
            >
              {(therapist.profile_completion_percentage / 20).toFixed(1)}
            </Text>
            <View style={styles.starsContainer}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    styles.star,
                    { color: index < Math.floor(therapist.profile_completion_percentage / 20) ? '#FBBF24' : '#E5E7EB' },
                  ]}
                >
                  ★
                </Text>
              ))}
            </View>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#002D62" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  touchable: {
    flex: 1,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  experience: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingContainer: {
    alignItems: 'center',
  },
  rating: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    marginHorizontal: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});