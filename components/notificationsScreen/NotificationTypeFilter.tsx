import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

// This component is for filtering notifications by type.
// To match backend, types should be the notification "type" field from the notification serializer.

interface NotificationTypeFilterProps {
  types: string[]; // e.g., ["reminder", "appointment", "system", ...] from backend /notifications/types/
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

export const NotificationTypeFilter: React.FC<NotificationTypeFilterProps> = ({
  types,
  selectedType,
  onSelectType,
}) => {
  // Colors for light blue theme
  const activeBackground = '#0088CC'; 
  const activeText = '#FFFFFF';
  const inactiveText = '#0088CC';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.filterItem,
          selectedType === null && {
            backgroundColor: activeBackground,
          },
          selectedType !== null && {
            borderColor: '#0088CC',
          },
        ]}
        onPress={() => onSelectType(null)}
      >
        <Text 
          style={[
            styles.filterText,
            selectedType === null && { color: activeText },
            selectedType !== null && { color: inactiveText },
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      
      {types.map(type => (
        <TouchableOpacity
          key={type}
          style={[
            styles.filterItem,
            selectedType === type && {
              backgroundColor: activeBackground,
            },
            selectedType !== type && {
              borderColor: '#0088CC',
            },
          ]}
          onPress={() => onSelectType(type)}
        >
          <Text 
            style={[
              styles.filterText,
              selectedType === type && { color: activeText },
              selectedType !== type && { color: inactiveText },
            ]}
          >
            {/* Format type for display: e.g., "appointment_reminder" => "Appointment Reminder" */}
            {type.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
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
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  filterItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});