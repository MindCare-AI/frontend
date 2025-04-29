import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ConversationList from '../../components/MessagingScreen/ConversationList';
import { useMessaging } from '../../contexts/MessagingContext';
import { globalStyles } from '../../styles/global';
import { Conversation } from '../../types/messaging';
import { UserPlus } from 'lucide-react-native';
import { NavigationProp } from '@react-navigation/native';
import { MessagingStackParamList } from '../../types/navigation';

export default function MessagingScreen() {
  const navigation = useNavigation<NavigationProp<MessagingStackParamList>>();
  const messaging = useMessaging();
  const { conversations } = messaging.state;
  const [refreshing, setRefreshing] = useState(false);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    // Implementation would be in messaging context
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      conversationType: conversation.type,
      title: conversation.type === 'group' 
        ? (conversation.name || 'Group Chat')
        : (conversation.otherParticipant?.name || 'Chat'),
      otherParticipantId: conversation.otherParticipant?.id 
        ? parseInt(conversation.otherParticipant.id) 
        : undefined
    });
  };

  const handleNewChat = () => {
    navigation.navigate('NewConversation');
  };

  if (!refreshing && !conversations.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={globalStyles.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ConversationList
        conversations={conversations}
        onConversationPress={handleConversationPress}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleNewChat}
      >
        <UserPlus size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: globalStyles.colors.backgroundLight,
  },
  floatingButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: globalStyles.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});