//screens/SettingsScreen/components/common/NotificationPreferenceItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Switch, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

interface NotificationPreferenceItemProps {
  label: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export const NotificationPreferenceItem: React.FC<NotificationPreferenceItemProps> = ({
  label,
  isEnabled,
  onToggle,
}) => {
  const fadeAnim = new Animated.Value(1);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </Text>
        <Text style={styles.description}>
          {`Receive ${label.toLowerCase()} notifications`}
        </Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={handleToggle}
        trackColor={{ false: '#E5E7EB', true: '#BAD4EA' }}
        thumbColor={isEnabled ? '#002D62' : '#9CA3AF'}
        ios_backgroundColor="#E5E7EB"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
  },
});