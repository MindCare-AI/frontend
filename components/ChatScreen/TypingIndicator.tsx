//screens/ChatScreen/components/TypingIndicator.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';

interface TypingIndicatorProps {
  visible: boolean;
  conversationId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ visible, conversationId }) => {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  const { accessToken } = useAuth();

  useEffect(() => {
    if (visible && conversationId) {
      const ws = new WebSocket(`${API_URL.replace('http', 'ws')}/ws/messaging/${conversationId}/`);

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'typing', is_typing: true }));
      };

      ws.onclose = () => {
        ws.send(JSON.stringify({ type: 'typing', is_typing: false }));
      };

      return () => {
        ws.close();
      };
    }
  }, [visible, conversationId]);

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, dot1Opacity, dot2Opacity, dot3Opacity]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginBottom: 8,
    marginLeft: 16,
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    elevation: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginHorizontal: 2,
  },
});

export default TypingIndicator;