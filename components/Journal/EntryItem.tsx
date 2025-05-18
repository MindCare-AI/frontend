import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { colors, spacing, fontSizes } from "./theme"
import type { JournalEntry } from "../../types/Journal/index"

interface EntryItemProps {
  entry: JournalEntry
  onEntryLongPress: (entry: JournalEntry) => void
}

export function EntryItem({ entry, onEntryLongPress }: EntryItemProps) {
  return (
    <TouchableOpacity
      style={styles.entryItem}
      activeOpacity={0.7}
      onLongPress={() => onEntryLongPress(entry)}
      delayLongPress={500}
    >
      <View style={styles.header}>
        <Text style={styles.entryDate}>{new Date(entry.date).toLocaleDateString()}</Text>
        {entry.mood && (
          <Text style={styles.moodText}>Mood: {entry.mood_description || entry.mood}</Text>
        )}
      </View>
      {entry.title && <Text style={styles.entryTitle}>{entry.title}</Text>}
      <Text style={styles.entryContent}>{entry.content}</Text>
      {entry.activities && (
        <Text style={styles.activities}>Activity: {entry.activities}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  entryItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  entryDate: {
    fontSize: fontSizes.xs,
    color: colors.gray,
  },
  moodText: {
    fontSize: fontSizes.xs,
    color: colors.gray,
  },
  entryTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  entryContent: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
  },
  activities: {
    fontSize: fontSizes.xs,
    color: colors.gray,
    fontStyle: 'italic',
  },
})
