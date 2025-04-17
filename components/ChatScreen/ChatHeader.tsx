//screens/ChatScreen/components/ChatHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import TypingIndicator from './TypingIndicator';
import { Conversation, Participant } from '../../types/chat';

interface ChatHeaderProps {
  conversation?: Conversation | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const currentUser = user || { id: '', username: '', email: '' };

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
    return '';
  };

  const avatar = getHeaderAvatar();
  const isTyping = conversation?.isTyping || false;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {avatar && (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      )}

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{getHeaderTitle()}</Text>
        {isTyping ? (
          <TypingIndicator visible={true} conversationId={conversation?.id || ''} />
        ) : (
          getSubtitle() !== '' && <Text style={styles.subtitle}>{getSubtitle()}</Text>
        )}
      </View>

      {conversation?.conversation_type !== 'chatbot' && (
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="call-outline" size={24} color="#333" />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.actionButton}>
        <Icon name="ellipsis-vertical" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default ChatHeader;
