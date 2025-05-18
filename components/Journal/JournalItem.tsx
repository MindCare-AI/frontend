import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { colors, fontSizes, spacing } from "./theme"
import type { Journal } from "../../types/Journal/index"

interface JournalItemProps {
  journal: Journal
  onJournalPress: (journal: Journal) => void
  onJournalLongPress: (journal: Journal) => void
  width: number
  color?: string
  entries_count?: number
}

export function JournalItem({ journal, onJournalPress, onJournalLongPress, width, color = colors.primary }: JournalItemProps) {
  return (
    <TouchableOpacity
      style={[styles.journalCard, { width, height: width, backgroundColor: color }]}
      activeOpacity={0.7}
      onPress={() => onJournalPress(journal)}
      onLongPress={() => onJournalLongPress(journal)}
      delayLongPress={500}
    >
      <View style={styles.journalCardContent}>
        {journal.icon && <Text style={styles.journalIcon}>{journal.icon}</Text>}
        <Text style={styles.journalTitle}>{journal.name}</Text>
        {journal.entries_count !== undefined && (
          <Text style={styles.journalEntries}>{journal.entries_count} entries</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  journalCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    justifyContent: "space-between",
    borderRadius: 12,
  },
  journalCardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  journalIcon: {
    fontSize: fontSizes.xl,
    marginBottom: spacing.sm,
  },
  journalTitle: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.white,
  },
  journalEntries: {
    fontSize: fontSizes.xs,
    color: "rgba(255, 255, 255, 0.8)",
  },
})
