//screens/ChatScreen/components/ChatHeader.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import TypingIndicator from './TypingIndicator';
import { Conversation } from '../../types/chat';

interface ChatHeaderProps {
  conversation?: Conversation | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const currentUser = user || { id: '', username: '', email: '' };
  
  // Add animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    // Animate header entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getHeaderTitle = (): string => {
    if (!conversation) return 'Chat';

    if (conversation.conversation_type === 'chatbot') {
      return 'Support Bot';
    }

    if (conversation.conversation_type === 'one_to_one' || conversation.conversation_type === 'direct') {
      if (conversation.other_user_name) {
        return conversation.other_user_name;
      }
      const otherParticipant = conversation.participants?.find(
        p => p.id !== currentUser.id
      );
      return otherParticipant?.name || conversation.title || conversation.name || 'Chat';
    }

    // For group or other conversation types
    return conversation.title || conversation.name || 'Group Chat';
  };

  const getHeaderAvatar = (): string | null => {
    if (!conversation) return null;

    try {
      if (conversation.conversation_type === 'chatbot') {
        return 'https://via.placeholder.com/36';
      }

      if (conversation.conversation_type === 'one_to_one' || conversation.conversation_type === 'direct') {
        if (conversation.otherParticipant?.avatar) {
          return conversation.otherParticipant.avatar;
        }
        const otherParticipant = conversation.participants?.find(
          p => p.id !== currentUser.id
        );
        return otherParticipant?.avatar || 'https://via.placeholder.com/36';
      }

      return null;
    } catch (error) {
      console.warn('Failed to load avatar:', error);
      return 'https://via.placeholder.com/36';
    }
  };

  const getSubtitle = (): string => {
    if (!conversation) return '';
    if (conversation.conversation_type === 'group') {
      return `${conversation.participants?.length || 0} participants`;
    }
    
    // Show online status for individual chats
    return conversation.otherParticipant?.is_online ? 'Online' : 'Offline';
  };

  const avatar = getHeaderAvatar();
  const isTyping = conversation?.isTyping || false;
  const isOnline = conversation?.otherParticipant?.is_online || false;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY }] 
        }
      ]}
    >
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Icon name="arrow-back" size={24} color="#007BFF" />
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        {avatar && (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        )}
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>{getHeaderTitle()}</Text>
        {isTyping ? (
          <TypingIndicator visible={true} conversationId={conversation?.id || ''} />
        ) : (
          getSubtitle() !== '' && (
            <Text style={[
              styles.subtitle,
              isOnline && styles.onlineSubtitle
            ]}>
              {getSubtitle()}
            </Text>
          )
        )}
      </View>

      <View style={styles.actionButtons}>
        {conversation?.conversation_type !== 'chatbot' && (
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="call-outline" size={22} color="#007BFF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Icon name="ellipsis-vertical" size={22} color="#007BFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F7',
  },
  avatarContainer: {
    position: 'relative',
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  onlineSubtitle: {
    color: '#34D399',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F7',
  },
});

export default ChatHeader;
