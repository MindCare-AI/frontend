//screens/ChatScreen/components/TypingIndicator.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';

interface TypingIndicatorProps {
  visible: boolean;
  conversationId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ visible, conversationId }) => {
  // Add multiple animations for a more dynamic effect
  const dot1Scale = useRef(new Animated.Value(0.8)).current;
  const dot2Scale = useRef(new Animated.Value(0.8)).current;
  const dot3Scale = useRef(new Animated.Value(0.8)).current;
  
  const dot1Opacity = useRef(new Animated.Value(0.4)).current;
  const dot2Opacity = useRef(new Animated.Value(0.4)).current;
  const dot3Opacity = useRef(new Animated.Value(0.4)).current;
  
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerTranslateY = useRef(new Animated.Value(10)).current;
  
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

  // Entrance and exit animations
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(containerTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(containerTranslateY, {
          toValue: 10,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  // Dot bobbing animation
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.stagger(150, [
          // First dot animation
          Animated.sequence([
            Animated.parallel([
              Animated.timing(dot1Scale, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(dot1Opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              })
            ]),
            Animated.parallel([
              Animated.timing(dot1Scale, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(dot1Opacity, {
                toValue: 0.4,
                duration: 300,
                useNativeDriver: true,
              })
            ])
          ]),
          
          // Second dot animation
          Animated.sequence([
            Animated.parallel([
              Animated.timing(dot2Scale, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(dot2Opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              })
            ]),
            Animated.parallel([
              Animated.timing(dot2Scale, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(dot2Opacity, {
                toValue: 0.4,
                duration: 300,
                useNativeDriver: true,
              })
            ])
          ]),
          
          // Third dot animation
          Animated.sequence([
            Animated.parallel([
              Animated.timing(dot3Scale, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(dot3Opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              })
            ]),
            Animated.parallel([
              Animated.timing(dot3Scale, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(dot3Opacity, {
                toValue: 0.4,
                duration: 300,
                useNativeDriver: true,
              })
            ])
          ])
        ])
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: containerOpacity,
          transform: [{ translateY: containerTranslateY }]
        }
      ]}
    >
      <View style={styles.bubble}>
        <Animated.View 
          style={[
            styles.dot, 
            { 
              opacity: dot1Opacity,
              transform: [{ scale: dot1Scale }] 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.dot, 
            { 
              opacity: dot2Opacity,
              transform: [{ scale: dot2Scale }] 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.dot, 
            { 
              opacity: dot3Opacity,
              transform: [{ scale: dot3Scale }] 
            }
          ]} 
        />
      </View>
    </Animated.View>
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
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      },
    }),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007BFF',
    marginHorizontal: 3,
  },
});

export default TypingIndicator;