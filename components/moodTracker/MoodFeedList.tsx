import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, IconButton, Dialog, Paragraph, Portal, ActivityIndicator } from 'react-native-paper';
import { format } from 'date-fns';
import { MoodLog } from '../../types/Mood';
import { getMoodDescription, ENERGY_LEVELS } from '../../constants/moodTypes';

interface MoodFeedListProps {
  moodLogs: MoodLog[];
  isLoading: boolean;
  onRefresh: () => void;
  onEdit: (log: MoodLog) => void;
  onDelete: (id: number) => Promise<void>;
  colors?: {
    primary: string;
    lightBlue: string;
    lightPurple: string;
    white: string;
    textDark: string;
    textMedium: string;
    borderColor: string;
    background: string;
  };
}

const MoodFeedList: React.FC<MoodFeedListProps> = ({
  moodLogs,
  isLoading,
  onRefresh,
  onEdit,
  onDelete,
  colors = {
    primary: '#002D62',
    lightBlue: '#E4F0F6',
    lightPurple: '#F0EAFF',
    white: '#FFFFFF',
    textDark: '#333',
    textMedium: '#444',
    borderColor: '#F0F0F0',
    background: '#FFFFFF',
  }
}) => {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [displayLogs, setDisplayLogs] = useState<MoodLog[]>([]);

  useEffect(() => {
    if (Array.isArray(moodLogs)) {
      const formattedLogs = moodLogs.map(log => ({
        ...log,
        logged_at: typeof log.logged_at === 'string' ? 
          (log.logged_at.includes('T') ? log.logged_at : new Date(log.logged_at.replace(' ', 'T')).toISOString()) :
          new Date(log.logged_at).toISOString()
      }));
      setDisplayLogs(formattedLogs);
    } else {
      setDisplayLogs([]);
    }
  }, [moodLogs]);

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

  const getEnergyEmoji = (level?: number) => {
    if (!level) return null;
    const energyLevel = ENERGY_LEVELS.find(e => e.value === level);
    return energyLevel ? energyLevel.label : null;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy - h:mm a');
    } catch (error) {
      console.error("Date formatting error:", error, dateString);
      return dateString;
    }
  };

  const renderMoodItem = ({ item }: { item: MoodLog }) => (
    <Card style={[styles.card, { backgroundColor: colors.white }]}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text variant="titleMedium" style={{ color: colors.textDark }}>{getMoodDescription(item.mood_rating)}</Text>
            <Text variant="bodySmall" style={{ color: colors.textMedium }}>
              {formatDate(item.logged_at)}
            </Text>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.ratingText, { color: colors.white }]}>{item.mood_rating}/10</Text>
          </View>
        </View>
        
        {item.activities && (
          <View style={styles.activityContainer}>
            <Text variant="bodyMedium" style={{ color: colors.textMedium }}>Activity: {item.activities}</Text>
          </View>
        )}
        
        {item.energy_level && (
          <Text variant="bodyMedium" style={{ color: colors.textMedium }}>
            Energy: <Text style={styles.emojiText}>{getEnergyEmoji(item.energy_level)}</Text>
          </Text>
        )}
      </Card.Content>
      
      <Card.Actions>
        <Button 
          onPress={() => onEdit(item)} 
          textColor={colors.primary}
        >
          Edit
        </Button>
        <Button 
          onPress={() => showDeleteDialog(item.id)} 
          textColor={colors.primary}
        >
          Delete
        </Button>
        {item.is_journaled && (
          <Button 
            icon="notebook"
            onPress={() => {}}
            textColor={colors.primary}
          >
            View Journal
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  console.log("Display logs length:", displayLogs.length);

  return (
    <View style={styles.container}>
      <FlatList
        data={displayLogs}
        renderItem={renderMoodItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={isLoading}
        extraData={[displayLogs.length]}
        ListEmptyComponent={
          isLoading ? (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.textMedium, marginTop: 10 }}>Loading mood entries...</Text>
            </View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: colors.lightBlue }]}>
              <Text style={{ color: colors.textDark }}>No mood entries found</Text>
              <Text variant="bodySmall" style={[styles.emptyText, { color: colors.textMedium }]}>
                Start tracking your mood by adding an entry
              </Text>
            </View>
          )
        }
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Mood Entry</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this mood entry? This action cannot be undone.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)} textColor={colors.primary}>Cancel</Button>
            <Button onPress={handleDeleteConfirm} textColor={colors.primary}>Delete</Button>
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
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBadge: {
    borderRadius: 16,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  ratingText: {
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
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
  },
  emojiText: {
    fontSize: 18,
  },
});

export default MoodFeedList;
