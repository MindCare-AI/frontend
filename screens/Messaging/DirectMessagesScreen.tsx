import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Text,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { createShadow } from '../../styles/global';
import { getAllUsers } from '../../API/conversations';

// Import components
import ConversationItem, { Conversation } from '../../components/Conversations/ConversationItem';
import ConversationHeader from '../../components/Conversations/ConversationHeader';
import EmptyConversationsList from '../../components/Conversations/EmptyConversationsList';
import FloatingButton from '../../components/Conversations/FloatingButton';
import UserSelectionModal from '../../components/Chat/UserSelectionModal';

// Import hooks
import { useDirectConversations } from '../../hooks/messagingScreen/useDirectConversations';

// Navigation types
interface RootStackParamList {
  DirectChat: { 
    conversationId: string | number;
    conversationTitle?: string;
  };
  NewDirectConversation: undefined;
  MessagingSettings: { conversationId?: string; conversationType?: 'one_to_one' };
  [key: string]: object | undefined;
}

interface Participant {
  id: string | number;
  full_name?: string;
  username?: string;
  profile_pic?: string;
}

interface DirectConversation {
  id: string | number;
  last_message?: {
    content: string;
    timestamp: string;
    sender_name: string;
  };
  updated_at: string;
  unread_count: number;
  other_participant: {
    id: number;
    username?: string;
    full_name?: string;
    profile_pic?: string;
  };
}

const AnimatedConversationItem = ({ 
  item, 
  index, 
  userId, 
  onPress,
  onLongPress,
  deletingConversationId 
}: { 
  item: DirectConversation; 
  index: number; 
  userId: string | number;
  onPress: (id: string | number) => void;
  onLongPress?: () => void;
  deletingConversationId: string | number | null;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300 + index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.conversationItemContainer,
        {
          opacity: animatedValue,
          transform: [{
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <ConversationItem
        conversation={{
          id: item.id,
          is_group: false,
          participants: [
            {
              id: item.other_participant?.id || 0,
              username: item.other_participant?.username || ''
            }
          ],
          last_message: item.last_message ? {
            id: 0, // Set a default ID
            content: item.last_message.content || '',
            sender_id: 0, // Set a default sender ID
            sender_name: item.last_message.sender_name || '',
            timestamp: item.last_message.timestamp || new Date().toISOString(),
            is_read: item.unread_count === 0
          } : undefined,
          unread_count: item.unread_count || 0,
          other_participant: {
            id: item.other_participant?.id || 0,
            username: item.other_participant?.username || '',
            user_type: 'user', // Add required user_type field
            profile_pic: item.other_participant?.profile_pic
          }
        }}
        userId={userId}
        onPress={() => onPress(item.id)}
        onLongPress={onLongPress}
        isDeleting={deletingConversationId === item.id}
      />
    </Animated.View>
  );
};

const DirectMessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const {
    conversations,
    loading,
    error,
    refreshing,
    fetchConversations,
    refresh,
    createConversation: hookCreateConversation,
    deleteConversation: hookDeleteConversation
  } = useDirectConversations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<string | number | null>(null);

  const searchInputRef = useRef<TextInput>(null);

  // Filter conversations directly on the original array
  const filteredConversations: DirectConversation[] = (conversations || []).filter((item) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const otherUser = item.other_participant;
    return (
      (otherUser && typeof otherUser.username === 'string' && otherUser.username.toLowerCase().includes(searchLower)) ||
      (otherUser && typeof (otherUser as any).full_name === 'string' && (otherUser as any).full_name.toLowerCase().includes(searchLower)) ||
      (item.last_message && typeof item.last_message.content === 'string' && item.last_message.content.toLowerCase().includes(searchLower))
    );
  });

  const handleConversationPress = useCallback((conversationId: string | number) => {
    const conversation = filteredConversations.find((c) => c.id === conversationId);
    if (conversation) {
      navigation.navigate('DirectChat' as any, {
        conversationId: conversationId.toString(),
        conversationTitle: 
          (conversation.other_participant && 'full_name' in conversation.other_participant 
            ? conversation.other_participant.full_name 
            : conversation.other_participant?.username) || 
          'Direct Message',
        otherParticipantId: conversation.other_participant?.id
      });
    }
  }, [navigation, filteredConversations]);

  const handleDeleteConversation = useCallback((conversationId: string | number) => {
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
              setDeletingConversationId(conversationId);
              await hookDeleteConversation(conversationId);
              console.log('Direct conversation deleted successfully');
            } catch (error) {
              console.error('Failed to delete direct conversation:', error);
              Alert.alert('Error', 'Failed to delete conversation');
            } finally {
              setDeletingConversationId(null);
            }
          },
        },
      ]
    );
  }, [hookDeleteConversation]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await getAllUsers();
      setAvailableUsers((users as any[]).filter((u: any) => u.id !== user?.id));
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateConversation = useCallback(async (selectedUsers: any[]) => {
    if (selectedUsers.length !== 1) {
      Alert.alert('Error', 'Please select exactly one user for a direct conversation');
      return;
    }

    try {
      const otherUser = selectedUsers[0];
      const conversation = await hookCreateConversation(otherUser.id);
      
      setShowUserSelection(false);
      
      // Navigate to the new conversation
      navigation.navigate('DirectChat' as any, {
        conversationId: conversation.id.toString(),
        conversationTitle: otherUser.full_name || otherUser.username || 'Direct Message',
      });
      
      // Refresh conversations list
      await refresh();
    } catch (error) {
      console.error('Failed to create direct conversation:', error);
      Alert.alert('Error', 'Failed to create conversation');
    }
  }, [navigation, refresh]);

  const handleNewConversation = () => {
    loadUsers();
    setShowUserSelection(true);
  };

  const renderConversationItem = ({ item, index }: { item: DirectConversation; index: number }) => (
    <AnimatedConversationItem
      item={item}
      index={index}
      userId={user?.id || ''}
      onPress={handleConversationPress}
      onLongPress={() => handleDeleteConversation(item.id)}
      deletingConversationId={deletingConversationId}
    />
  );

  const renderEmptyList = () => (
    <EmptyConversationsList
      isSearching={searchQuery.length > 0}
      onStartConversation={handleNewConversation}
      filterMode="direct"
    />
  );
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ConversationHeader
        title="Direct Messages"
        onSettingsPress={() => navigation.navigate('MessagingSettings' as any, { conversationType: 'direct' })}
      />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FlatList
            data={filteredConversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[
              styles.listContainer,
              filteredConversations.length === 0 && styles.emptyListContainer,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor="#007AFF"
                colors={['#007AFF']}
              />
            }
            ListEmptyComponent={renderEmptyList}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
          />
          <FloatingButton
            onPress={handleNewConversation}
            icon="add"
            style={styles.fab}
          />
        </KeyboardAvoidingView>
      )}
      <UserSelectionModal
        visible={showUserSelection}
        conversationType="direct"
        onClose={() => setShowUserSelection(false)}
        onCreateConversation={handleCreateConversation}
        currentUserId={user?.id || ''}
        creating={loadingUsers}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  conversationItemContainer: {
    marginBottom: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    justifyContent: 'center',
  },
});

export default DirectMessagesScreen;
