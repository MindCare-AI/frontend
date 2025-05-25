import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { LinearGradient } from 'expo-linear-gradient'
import { colors, fontSizes, spacing, shadows, borderRadius, getGradientColors } from "./theme"
import type { Journal } from "../../types/Journal/index"
import { useRef } from "react"

interface JournalItemProps {
  journal: Journal
  onJournalPress: (journal: Journal) => void
  onJournalLongPress: (journal: Journal) => void
  width: number
}

export function JournalItem({ journal, onJournalPress, onJournalLongPress, width }: JournalItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  
  // Get gradient colors based on journal id or use fallback
  const gradientColors = getGradientColors(journal.id || 0)
  
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

  const getEntriesText = () => {
    const count = journal.entries_count ?? 0
    const entryWord = count === 1 ? 'entry' : 'entries'
    return String(count) + ' ' + entryWord
  }

  const getJournalName = () => {
    return journal.name || 'Untitled Journal'
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.journalCard, 
          { 
            width, 
            height: width * 1.1,
          }, 
          shadows.md
        ]}
        activeOpacity={1}
        onPress={() => onJournalPress(journal)}
        onLongPress={() => onJournalLongPress(journal)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        delayLongPress={500}
      >
        <LinearGradient
          colors={[gradientColors.start, gradientColors.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.journalCardContent}>
            {journal.icon ? (
              <Text style={styles.journalIcon}>{journal.icon}</Text>
            ) : null}
            <Text style={styles.journalTitle} numberOfLines={2}>
              {getJournalName()}
            </Text>
            <Text style={styles.journalEntries}>
              {getEntriesText()}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  journalCard: {
    marginBottom: 0,
    borderRadius: borderRadius.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "space-between",
    borderRadius: borderRadius.xl,
  },
  journalCardContent: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 2,
  },
  journalIcon: {
    fontSize: fontSizes.xl,
    marginBottom: spacing.sm,
    color: colors.white,
  },
  journalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "700",
    color: colors.white,
    lineHeight: fontSizes.lg * 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  journalEntries: {
    fontSize: fontSizes.sm,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
})
