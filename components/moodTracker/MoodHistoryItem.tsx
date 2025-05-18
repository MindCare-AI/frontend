// components/moodTracker/MoodHistoryItem.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { MoodLog } from '../../types/Mood';
import { EnergyLevelLabels, EnergyLevel } from '../../types/Mood';
import { formatDateTime } from '../../utils/dateUtils';
import { getMoodColor } from '../../utils/constants';

interface MoodHistoryItemProps {
  item: MoodLog;
  onDelete?: (id: number) => Promise<void>;
  onEdit?: (item: MoodLog) => void;
}

const MoodHistoryItem: React.FC<MoodHistoryItemProps> = ({ 
  item, 
  onDelete,
  onEdit
}) => {
  const navigation = useNavigation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this mood entry?')) {
        setIsDeleting(true);
        try {
          await onDelete(item.id);
        } finally {
          setIsDeleting(false);
        }
      }
    } else {
      Alert.alert(
        'Delete Mood Entry',
        'Are you sure you want to delete this mood entry?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setIsDeleting(true);
              try {
                await onDelete(item.id);
              } finally {
                setIsDeleting(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleViewJournal = () => {
    if (item.is_journaled && item.journal_entry_id) {
      // @ts-ignore - Navigate to the journal entry detail screen
      navigation.navigate('JournalStack', {
        screen: 'JournalEntryDetail',
        params: { id: item.journal_entry_id }
      });
    }
  };

  const renderRightActions = () => {
    if (!onDelete && !onEdit) return null;

    return (
      <View style={styles.actionContainer}>
        {onEdit && (
          <TouchableOpacity style={styles.editAction} onPress={handleEdit}>
            <Feather name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={styles.deleteAction} onPress={handleDelete} disabled={isDeleting}>
            <Feather name={isDeleting ? "loader" : "trash-2"} size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const moodColor = getMoodColor(item.mood_rating);
  const energyLabel = EnergyLevelLabels[item.energy_level as EnergyLevel] || 'Unknown';
  const formattedDate = formatDateTime(item.logged_at);

  return (
    <Swipeable renderRightActions={renderRightActions} friction={2} rightThreshold={40}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.moodIndicator, { backgroundColor: moodColor }]}>
            <Text style={styles.moodRating}>{item.mood_rating}</Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.date}>{formattedDate}</Text>
            <Text style={styles.energy}>Energy: {energyLabel}</Text>
          </View>
        </View>

        {item.activities && (
          <View style={styles.activitiesContainer}>
            <Text style={styles.activitiesLabel}>Activity:</Text>
            <Text style={styles.activitiesText}>{item.activities}</Text>
          </View>
        )}

        {item.is_journaled && item.journal_entry_id && (
          <TouchableOpacity 
            style={styles.journalButton} 
            onPress={handleViewJournal}
            activeOpacity={0.7}
          >
            <Feather name="book-open" size={16} color="#002D62" />
            <Text style={styles.journalButtonText}>View Journal Entry</Text>
          </TouchableOpacity>
        )}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moodRating: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerContent: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  energy: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  activitiesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 5,
  },
  activitiesText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  journalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#E4F0F6',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  journalButtonText: {
    color: '#002D62',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  actionContainer: {
    flexDirection: 'row',
  },
  editAction: {
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
  },
  deleteAction: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
  },
});

export default MoodHistoryItem;