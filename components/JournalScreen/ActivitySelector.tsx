import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Activity } from '../../types/journal';

const activityIcons: Record<Activity, string> = {
  exercise: '🏋️‍♂️',
  reading: '📚',
  meditation: '🧘‍♂️',
  socializing: '👥',
  work: '💼',
  rest: '😴',
  entertainment: '🎮',
  other: '❓',
};

const activityLabels: Record<Activity, string> = {
  exercise: 'Exercise',
  reading: 'Reading',
  meditation: 'Meditation',
  socializing: 'Socializing',
  work: 'Work',
  rest: 'Rest',
  entertainment: 'Entertainment',
  other: 'Other',
};

interface ActivitySelectorProps {
  selectedActivities: string[];
  onActivityChange: (activities: string[]) => void;
  label?: string;
}

const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  selectedActivities,
  onActivityChange,
  label = 'What activities did you do today?'
}) => {
  const activityTypes: Activity[] = [
    'exercise', 'reading', 'meditation', 'socializing',
    'work', 'rest', 'entertainment', 'other'
  ];

  const toggleActivity = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      onActivityChange(selectedActivities.filter(a => a !== activity));
    } else {
      onActivityChange([...selectedActivities, activity]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.activitiesContainer}>
          {activityTypes.map((activity) => (
            <TouchableOpacity
              key={activity}
              style={[
                styles.activityItem,
                selectedActivities.includes(activity) && styles.selectedActivityItem
              ]}
              onPress={() => toggleActivity(activity)}
            >
              <Text style={styles.activityIcon}>{activityIcons[activity]}</Text>
              <Text style={[
                styles.activityLabel,
                selectedActivities.includes(activity) && styles.selectedActivityLabel
              ]}>
                {activityLabels[activity]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  activitiesContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  activityItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    minWidth: 90,
  },
  selectedActivityItem: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  activityIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  activityLabel: {
    fontSize: 12,
  },
  selectedActivityLabel: {
    fontWeight: 'bold',
  },
});

export default ActivitySelector;