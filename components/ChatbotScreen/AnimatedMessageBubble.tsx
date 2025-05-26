import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing,
  ViewStyle,
  TextStyle
} from 'react-native';
import TypingAnimation from './TypingAnimation';
import { globalStyles } from '../../styles/global';

interface AnimatedMessageBubbleProps {
  content: string;
  isBot: boolean;
  timestamp: string;
  method?: string;
  isTyping?: boolean;
  onTypingComplete?: () => void;
  style?: ViewStyle;
  bubbleStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedMessageBubble: React.FC<AnimatedMessageBubbleProps> = ({
  content,
  isBot,
  timestamp,
  method,
  isTyping = false,
  onTypingComplete,
  style,
  bubbleStyle,
  textStyle
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.messageContainer,
        isBot ? styles.botMessage : styles.userMessage,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }]
        },
        style
      ]}
    >
      <View style={[
        styles.messageBubble,
        isBot ? styles.botBubble : styles.userBubble,
        bubbleStyle
      ]}>
        {isBot && isTyping ? (
          <TypingAnimation 
            text={content}
            speed={40}
            onComplete={onTypingComplete}
            textStyle={[
              styles.messageText,
              isBot ? styles.botText : styles.userText,
              textStyle
            ]}
          />
        ) : (
          <Text style={[
            styles.messageText,
            isBot ? styles.botText : styles.userText,
            textStyle
          ]}>
            {content}
          </Text>
        )}
        
        {isBot && method && (
          <Text style={styles.methodText}>Method: {method}</Text>
        )}
        
        <Text style={[
          styles.timestamp,
          isBot ? styles.botTimestamp : styles.userTimestamp
        ]}>
          {new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 6,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginLeft: 50,
  },
  botMessage: {
    alignSelf: 'flex-start',
    marginRight: 50,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: globalStyles.colors.primary,
    borderBottomRightRadius: 4,
    shadowColor: globalStyles.colors.primary,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: globalStyles.colors.text,
  },
  methodText: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 6,
    opacity: 0.8,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  botTimestamp: {
    color: '#9CA3AF',
  },
});

export default AnimatedMessageBubble;
