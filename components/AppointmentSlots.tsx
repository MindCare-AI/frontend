import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

interface AppointmentSlotsProps {
  slots: TimeSlot[];
  selectedSlot?: string;
  onSelectSlot: (slotId: string) => void;
  isLoading?: boolean;
}

export const AppointmentSlots: React.FC<AppointmentSlotsProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}) => {
  const handleSlotPress = (slotId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onSelectSlot(slotId);
  };

  const formatTimeRange = (start: Date, end: Date) => {
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D62" />
        <Text style={styles.loadingText}>Loading available slots...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {slots.map((slot) => (
        <Animated.View
          key={slot.id}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          layout={Layout.springify()}
        >
          <TouchableOpacity
            style={[
              styles.slot,
              selectedSlot === slot.id && styles.selectedSlot,
              !slot.isAvailable && styles.unavailableSlot,
            ]}
            onPress={() => handleSlotPress(slot.id)}
            disabled={!slot.isAvailable}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.time,
                selectedSlot === slot.id && styles.selectedText,
                !slot.isAvailable && styles.unavailableText,
              ]}
            >
              {formatTimeRange(slot.startTime, slot.endTime)}
            </Text>
            
            {!slot.isAvailable && (
              <Text style={styles.unavailableLabel}>
                Booked
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  slot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    minWidth: 150,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      },
    }),
  },
  selectedSlot: {
    backgroundColor: '#002D62',
    transform: [{ scale: 1.05 }],
  },
  unavailableSlot: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  time: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unavailableText: {
    color: '#9CA3AF',
  },
  unavailableLabel: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
});
