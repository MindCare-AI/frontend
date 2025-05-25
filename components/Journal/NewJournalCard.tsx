import { TouchableOpacity, Text, StyleSheet, Animated } from "react-native"
import { colors, spacing, fontSizes, borderRadius, shadows } from "./theme"
import { useRef } from "react"

interface NewJournalCardProps {
  onPress: () => void
  width: number
}

export function NewJournalCard({ onPress, width }: NewJournalCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.newJournalCard, 
          { 
            width, 
            height: width * 1.1 // Match the journal card proportions
          }, 
          shadows.sm
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={styles.newJournalText}>Create Journal</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  newJournalCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.softBlue,
  },
  newJournalText: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
})
