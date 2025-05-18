import { Text, StyleSheet, TouchableOpacity } from "react-native"
import { formatDate } from "../../utils/Journal/formatDate"
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
      <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
      <Text style={styles.entryContent}>{entry.content}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  entryItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  entryDate: {
    fontSize: fontSizes.xs,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  entryContent: {
    fontSize: fontSizes.sm,
  },
})
