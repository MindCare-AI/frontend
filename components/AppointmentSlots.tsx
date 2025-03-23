import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AppointmentSlotsProps {
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

const AppointmentSlots: React.FC<AppointmentSlotsProps> = ({
  slots,
  selectedSlot,
  onSelectSlot
}) => {
  return (
    <View style={styles.container}>
      {slots.map((slot) => (
        <TouchableOpacity
          key={slot}
          onPress={() => onSelectSlot(slot)}
          style={[
            styles.slot,
            selectedSlot === slot ? styles.selectedSlot : styles.unselectedSlot
          ]}
        >
          <Text style={[
            styles.slotText,
            selectedSlot === slot && styles.selectedSlotText
          ]}>
            {slot}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  slot: {
    width: '33.33%',
    padding: 6,
  },
  selectedSlot: {
    backgroundColor: 'black',
    borderRadius: 12,
    padding: 12,
  },
  unselectedSlot: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
  },
  slotText: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 14,
  },
  selectedSlotText: {
    color: 'white',
  },
});

export default AppointmentSlots;
