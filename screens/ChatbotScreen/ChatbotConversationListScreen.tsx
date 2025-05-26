// screens/ChatbotScreen/ChatbotConversationListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/global';
import { useChatbot } from '../../hooks/ChatbotScreen/useChatbot';
import { ChatbotStackParamList } from '../../navigation/types';
import { ChatbotConversation, ChatbotConversationListItem } from '../../types/chatbot/chatbot';
import { formatRelativeDate } from '../../utils/dateUtils';

// Import components
import { ConversationListItem } from '../../components/ChatbotScreen/ChatbotComponents';

type ChatbotNavigationProp = StackNavigationProp<ChatbotStackParamList, 'ChatbotHome'>;

const ChatbotConversationListScreen: React.FC = () => {
  const navigation = useNavigation<ChatbotNavigationProp>();
  const {
    conversations,
    loading,
    error,
    fetchConversations,
    deleteConversation,
    clearError,
  } = useChatbot();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      await fetchConversations();
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleSelectConversation = (conversation: ChatbotConversation | ChatbotConversationListItem) => {
    navigation.navigate('ChatbotConversation', { conversationId: conversation.id });
  };

  const handleDeleteConversation = (conversationId: number) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(conversationId);
            } catch (error) {
              console.error('Failed to delete conversation:', error);
              Alert.alert('Error', 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  const handleCreateConversation = () => {
    navigation.navigate('ChatbotConversation', { autoCreate: true });
  };

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={globalStyles.colors.primary} />
          <Text style={styles.emptyText}>Loading conversations...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-ellipses-outline" size={48} color={globalStyles.colors.neutralMedium} />
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptyText}>Start a new conversation with the AI assistant</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={handleCreateConversation}
        >
          <Text style={styles.newButtonText}>New Conversation</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderConversationItem = ({ item }: { item: ChatbotConversation | ChatbotConversationListItem }) => (
    <ConversationListItem
      conversation={item}
      onPress={() => handleSelectConversation(item)}
      onDelete={() => handleDeleteConversation(item.id)}
    />
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={globalStyles.colors.error} />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            clearError();
            loadConversations();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[globalStyles.colors.primary]}
          />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateConversation}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.background,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: globalStyles.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: globalStyles.colors.neutralDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: globalStyles.colors.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  newButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 8,
  },
  newButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: globalStyles.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    transform: [{ scale: 1 }],  // For animations
    // Add animation properties
    zIndex: 10,
  },
  // Add animation related styles
  fabPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
  },
  conversationItem: {
    marginVertical: 6,
    marginHorizontal: 12,
    backgroundColor: globalStyles.colors.white,
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    transform: [{ scale: 1 }], // For animations
  },
  conversationItemPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: globalStyles.colors.backgroundLight,
  },
});

export default ChatbotConversationListScreen;
