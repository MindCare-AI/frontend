import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

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
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.filterItem,
          selectedType === null && {
            backgroundColor: theme.colors.primary,
          },
        ]}
        onPress={() => onSelectType(null)}
      >
        <Text 
          style={[
            styles.filterText,
            selectedType === null && { color: theme.colors.onPrimary },
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
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => onSelectType(type)}
        >
          <Text 
            style={[
              styles.filterText,
              selectedType === type && { color: theme.colors.onPrimary },
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
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterText: {
    fontSize: 14,
  },
});