import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, IconButton, Dialog, Paragraph, Portal, ActivityIndicator } from 'react-native-paper';
import { format } from 'date-fns';
import { MoodLog } from '../../types/Mood';
import { getMoodDescription } from '../../constants/moodTypes';

interface MoodFeedListProps {
  moodLogs: MoodLog[];
  isLoading: boolean;
  onRefresh: () => void;
  onEdit: (log: MoodLog) => void;
  onDelete: (id: number) => Promise<void>;
}

const MoodFeedList: React.FC<MoodFeedListProps> = ({
  moodLogs,
  isLoading,
  onRefresh,
  onEdit,
  onDelete
}) => {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

  const handleDeleteConfirm = async () => {
    if (selectedLogId) {
      await onDelete(selectedLogId);
      setDeleteDialogVisible(false);
      setSelectedLogId(null);
    }
  };

  const showDeleteDialog = (id: number) => {
    setSelectedLogId(id);
    setDeleteDialogVisible(true);
  };

  const renderMoodItem = ({ item }: { item: MoodLog }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text variant="titleMedium">{getMoodDescription(item.mood_rating)}</Text>
            <Text variant="bodySmall">
              {format(new Date(item.logged_at), 'MMM d, yyyy - h:mm a')}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.mood_rating}/10</Text>
          </View>
        </View>
        
        {item.activities && (
          <View style={styles.activityContainer}>
            <Text variant="bodyMedium">Activity: {item.activities}</Text>
          </View>
        )}
        
        {item.energy_level && (
          <Text variant="bodyMedium">Energy: {item.energy_level}/5</Text>
        )}
      </Card.Content>
      
      <Card.Actions>
        <Button onPress={() => onEdit(item)}>Edit</Button>
        <Button onPress={() => showDeleteDialog(item.id)}>Delete</Button>
        {item.is_journaled && (
          <Button 
            icon="notebook"
            onPress={() => {}}
          >
            View Journal
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  if (isLoading && moodLogs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading mood entries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={moodLogs}
        renderItem={renderMoodItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No mood entries found</Text>
            <Text variant="bodySmall" style={styles.emptyText}>
              Start tracking your mood by adding an entry
            </Text>
          </View>
        }
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Mood Entry</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this mood entry? This action cannot be undone.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteConfirm}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBadge: {
    backgroundColor: '#6200ee',
    borderRadius: 16,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  ratingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activityContainer: {
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
});

export default MoodFeedList;
