//screens/ChatScreen/components/ChatHeader.tsx
import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from '../ui/avatar';
import TypingIndicator from './TypingIndicator';
import { useChat } from '../../contexts/ChatContext';

interface ChatHeaderProps {
  conversationId: string;
  conversationType: 'one_to_one' | 'group' | 'chatbot';
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversationId,
  conversationType,
  connectionStatus,
}) => {
  const navigation = useNavigation();
  const { conversations } = useChat();
  const conversation = conversations[conversationId];
  const onlineStatus = useSharedValue(connectionStatus === 'connected' ? 1 : 0);
  const typingAnimation = useSharedValue(0);

  // Animate connection status
  const statusStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      onlineStatus.value,
      [0, 1],
      ['#FF3B30', '#34C759']
    );

    return {
      backgroundColor,
      transform: [{ scale: withSpring(onlineStatus.value ? 1 : 0.8) }],
    };
  });

  // Animate typing indicator
  const typingStyle = useAnimatedStyle(() => {
    return {
      opacity: withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        ),
        -1,
        true
      ),
    };
  });

  const getHeaderTitle = () => {
    if (!conversation) return '';

    switch (conversationType) {
      case 'one_to_one':
        return conversation.other_participant?.name || 'Chat';
      case 'group':
        return conversation.name || 'Group Chat';
      case 'chatbot':
        return 'AI Assistant';
      default:
        return 'Chat';
    }
  };

  const getSubtitle = () => {
    if (!conversation) return '';

    if (connectionStatus !== 'connected') {
      return connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected';
    }

    if (conversation.typing_users?.length) {
      return conversation.typing_users.length === 1
        ? `${conversation.typing_users[0]} is typing...`
        : 'Several people are typing...';
    }

    switch (conversationType) {
      case 'one_to_one':
        return conversation.other_participant?.is_online ? 'Online' : 'Offline';
      case 'group':
        return `${conversation.participants.length} members`;
      default:
        return '';
    }
  };

  const getAvatar = () => {
    if (!conversation) return null;

    switch (conversationType) {
      case 'one_to_one':
        return conversation.other_participant?.avatar;
      case 'group':
        return conversation.metadata?.group_avatar;
      case 'chatbot':
        return require('../../assets/images/bot-avatar.png');
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-back" size={28} color="#007AFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.titleContainer}
        onPress={() => {
          if (conversationType !== 'chatbot') {
            navigation.navigate('ConversationDetails', {
              conversationId,
              conversationType,
            });
          }
        }}
      >
        <View style={styles.avatarContainer}>
          <Avatar
            size="sm"
            source={getAvatar()}
            fallback={getHeaderTitle().charAt(0)}
          />
          <Animated.View style={[styles.statusIndicator, statusStyle]} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {getHeaderTitle()}
          </Text>
          <Animated.Text
            style={[styles.subtitle, typingStyle]}
            numberOfLines={1}
          >
            {getSubtitle()}
          </Animated.Text>
        </View>
      </TouchableOpacity>

      {conversationType !== 'chatbot' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (conversationType === 'one_to_one') {
                navigation.navigate('Call', { conversationId });
              }
            }}
          >
            <Icon name="call-outline" size={24} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              navigation.navigate('ConversationDetails', {
                conversationId,
                conversationType,
              });
            }}
          >
            <Icon name="ellipsis-horizontal" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
    height: Platform.OS === 'ios' ? 44 : 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default memo(ChatHeader);
