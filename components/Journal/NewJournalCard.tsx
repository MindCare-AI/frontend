import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { colors, spacing, fontSizes, borderRadius } from "./theme"

interface NewJournalCardProps {
  onPress: () => void
  width: number
}

// Simple icon for React Native
const PlusIcon = () => <Text style={{ fontSize: 24, color: colors.gray }}>+</Text>

export function NewJournalCard({ onPress, width }: NewJournalCardProps) {
  return (
    <TouchableOpacity style={[styles.newJournalCard, { width, height: width }]} onPress={onPress} activeOpacity={0.7}>
      <PlusIcon />
      <Text style={styles.newJournalText}>New Journal</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  newJournalCard: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderStyle: "dashed",
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  newJournalText: {
    marginTop: spacing.sm,
    color: colors.gray,
    fontSize: fontSizes.sm,
  },
})
