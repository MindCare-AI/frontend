import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  FadeIn,
  SlideInRight,
  SlideInLeft,
  Layout,
} from 'react-native-reanimated';

interface ChatMessageBubbleProps {
  message: string;
  isBot?: boolean;
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isBot = false,
  timestamp,
  status = 'sent',
}) => {
  const entering = isBot ? SlideInLeft : SlideInRight;

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return '●●●';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sending':
        return '#9CA3AF';
      case 'read':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <Animated.View
      entering={entering.duration(300)}
      layout={Layout.springify()}
      style={[
        styles.container,
        isBot ? styles.botContainer : styles.userContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isBot ? styles.botBubble : styles.userBubble,
        ]}
      >
        <Animated.Text
          entering={FadeIn.duration(200)}
          style={[
            styles.message,
            isBot ? styles.botMessage : styles.userMessage,
          ]}
        >
          {message}
        </Animated.Text>

        <View style={styles.metadata}>
          {timestamp && (
            <Text style={styles.timestamp}>
              {timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
          
          {!isBot && (
            <Text
              style={[
                styles.status,
                { color: getStatusColor() },
              ]}
            >
              {getStatusText()}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
    maxWidth: '80%',
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  botBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#002D62',
    borderBottomRightRadius: 4,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
  },
  botMessage: {
    color: '#1F2937',
  },
  userMessage: {
    color: '#FFFFFF',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
});