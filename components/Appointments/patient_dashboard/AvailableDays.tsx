"use client"

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { globalStyles } from "../../../styles/global"

interface AvailableDaysProps {
  therapistAvailability: Record<string, string[]> | null;
  isOpen: boolean;
}

const AvailableDays: React.FC<AvailableDaysProps> = ({
  therapistAvailability,
  isOpen,
}) => {
  if (!therapistAvailability) return null;
  
  if (!isOpen) return null;

  return (
    <View>
      <View style={styles.availabilityContainer}>
        <Text style={styles.availabilityTitle}>Therapist Available Days:</Text>
        {Object.keys(therapistAvailability).length > 0 ? (
          Object.entries(therapistAvailability).map(([day, slots]) => (
            <View key={day} style={styles.availabilityDayContainer}>
              <Text style={styles.availabilityDay}>
                {day.charAt(0).toUpperCase() + day.slice(1)}:
              </Text>
              <View style={styles.availabilitySlots}>
                {slots.map((slot: string, idx: number) => (
                  <Text key={idx} style={styles.availabilitySlot}>
                    {slot}
                  </Text>
                ))}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noAvailabilityText}>No availability information found.</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  availabilityContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  availabilityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: globalStyles.colors.primary,
  },
  availabilityDayContainer: {
    marginBottom: 8,
  },
  availabilityDay: {
    fontSize: 14,
    fontWeight: '600',
    color: globalStyles.colors.primary,
  },
  availabilitySlots: {
    marginLeft: 12,
    marginTop: 4,
  },
  availabilitySlot: {
    fontSize: 13,
    color: globalStyles.colors.textPrimary,
    marginBottom: 2,
  },
  noAvailabilityText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: globalStyles.colors.textSecondary,
  },
})

export default AvailableDays
