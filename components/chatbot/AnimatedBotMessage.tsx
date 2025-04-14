//// filepath: /home/siaziz/Desktop/frontend/screens/ChatbotScreen/AnimatedBotMessage.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  SlideInLeft,
} from 'react-native-reanimated';

interface AnimatedBotMessageProps {
  children: React.ReactNode;
  isTyping?: boolean;
}

export const AnimatedBotMessage: React.FC<AnimatedBotMessageProps> = ({
  children,
  isTyping = false,
}) => {
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.avatarContainer, avatarStyle]}
      >
        <Image
          source={require('../../assets/images/bot-avatar.png')}
          style={styles.avatar}
        />
      </Animated.View>
      
      <Animated.View
        entering={SlideInLeft.springify().damping(15)}
        style={styles.messageContainer}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
    marginHorizontal: 16,
    gap: 12,
  },
  avatarContainer: {
    padding: 2,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageContainer: {
    flex: 1,
  },
});