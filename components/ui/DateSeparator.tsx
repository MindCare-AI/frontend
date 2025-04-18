import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface DateSeparatorProps {
  date: string;
}

const DateSeparator = memo(({ date }: DateSeparatorProps) => {
  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      style={styles.container}
    >
      <View style={styles.line} />
      <Text style={styles.text}>{date}</Text>
      <View style={styles.line} />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5E5',
  },
  text: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
    fontWeight: '500',
  },
});

export default DateSeparator;