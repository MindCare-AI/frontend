//screens/ChatScreen/components/MessageStatus.tsx
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  showAnimation?: boolean;
}

const MessageStatus = memo(({
  status,
  timestamp,
  showAnimation = true,
}: MessageStatusProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return 'time-outline';
      case 'sent':
        return 'checkmark';
      case 'delivered':
        return 'checkmark-done';
      case 'read':
        return 'checkmark-done';
      case 'failed':
        return 'alert-circle';
      default:
        return 'checkmark';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sending':
        return '#999';
      case 'sent':
        return '#999';
      case 'delivered':
        return '#666';
      case 'read':
        return '#007AFF';
      case 'failed':
        return '#FF3B30';
      default:
        return '#999';
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (!showAnimation) return {};

    const scale = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );

    const opacity = withTiming(1, { duration: 300 });

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <Icon
          name={getStatusIcon()}
          size={12}
          color={getStatusColor()}
          style={[
            styles.icon,
            status === 'read' && styles.readIcon,
          ]}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  iconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 2,
  },
  readIcon: {
    transform: [{ scale: 1.1 }],
  },
});

export default MessageStatus;