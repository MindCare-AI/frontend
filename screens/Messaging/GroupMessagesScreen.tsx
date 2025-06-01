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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { createShadow } from '../../styles/global';
import { getAllUsers } from '../../API/conversations';
import { createGroupConversation } from '../../API/groupMessages';

// Import components
import ConversationItem from '../../components/Conversations/ConversationItem';
import ConversationHeader from '../../components/Conversations/ConversationHeader';
import EmptyConversationsList from '../../components/Conversations/EmptyConversationsList';
import FloatingButton from '../../components/Conversations/FloatingButton';
import UserSelectionModal from '../../components/Chat/UserSelectionModal';

// Import hooks
import { useGroupConversations } from '../../hooks/messagingScreen/useGroupConversations';
import { GroupConversation as APIGroupConversation } from '../../API/groupMessages';
import type { User } from '../../components/Chat/UserSelectionModal';

// Navigation types
interface RootStackParamList {
  GroupChat: { 
    conversationId: string | number;
    conversationTitle?: string;
  };
  NewGroupConversation: undefined;
  GroupDetails: { groupId: string };
  MessagingSettings: { conversationId?: string; conversationType?: 'group' };
  [key: string]: object | undefined;
}

interface Participant {
  id: string | number;
  full_name?: string;
  username?: string;
  profile_pic?: string;
}

// Use the API GroupConversation interface instead of defining our own
type GroupConversation = APIGroupConversation;

const AnimatedConversationItem = ({ 
  item, 
  index, 
  userId, 
  onPress,
  onLongPress,
  deletingConversationId 
}: { 
  item: GroupConversation; 
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
          is_group: true,
          name: item.name,
          participants: item.participants || [],
          last_message: item.last_message ? {
            id: 0, // Default ID
            content: item.last_message.content || '',
            sender_id: 0, // Default sender ID
            sender_name: item.last_message.sender_name || '',
            timestamp: item.last_message.timestamp || new Date().toISOString(),
            is_read: item.unread_count === 0
          } : undefined,
          unread_count: item.unread_count || 0
        }}
        userId={userId}
        onPress={() => onPress(item.id)}
        onLongPress={onLongPress}
        isDeleting={deletingConversationId === item.id}
      />
    </Animated.View>
  );
};

const GroupMessagesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  
  const {
    conversations,
    loading,
    error,
    refreshing,
    fetchConversations,
    refresh,
    deleteConversation: deleteConv
  } = useGroupConversations();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<string | number | null>(null);

  const searchInputRef = useRef<TextInput>(null);

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    return (
      conversation.name?.toLowerCase().includes(searchLower) ||
      conversation.description?.toLowerCase().includes(searchLower) ||
      conversation.last_message?.content?.toLowerCase().includes(searchLower) ||
      conversation.participants?.some((p: any) =>
        p.username?.toLowerCase().includes(searchLower) ||
        p.full_name?.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleConversationPress = (conversationId: string | number) => {
    const conversation = conversations.find(c => c.id === conversationId);
    navigation.navigate('GroupChat', {
      conversationId: conversationId.toString(),
      conversationTitle: conversation?.name || 'Group Chat',
    });
  };

  const handleDeleteConversation = useCallback((conversationId: string | number) => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will no longer receive messages from this group.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingConversationId(conversationId);
              await deleteConv(conversationId);
              console.log('Left group successfully');
            } catch (error) {
              console.error('Failed to leave group:', error);
              Alert.alert('Error', 'Failed to leave group');
            } finally {
              setDeletingConversationId(null);
            }
          },
        },
      ]
    );
  }, [deleteConv]);

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

  const handleCreateGroup = async (selectedUsers: User[], groupName?: string, groupDescription?: string) => {
    try {
      const participantIds = selectedUsers.map(u => u.id);
      const group = await createGroupConversation(groupName || '', participantIds, groupDescription || '');
      navigation.navigate('GroupChat', {
        conversationId: group.id.toString(),
        conversationTitle: groupName?.trim() || 'Group Chat',
      });
    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const handleNewGroup = () => {
    loadUsers();
    setShowUserSelection(true);
  };

  const renderConversationItem = ({ item, index }: { item: GroupConversation; index: number }) => (
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
      title="No groups yet"
      subtitle="Create a group to start chatting with multiple people"
      onCreateConversation={handleNewGroup}
      loading={loading}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ConversationHeader
        title="Group Messages"
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
      />

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
            filteredConversations.length === 0 && styles.emptyListContainer
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          refreshing={refreshing}
          updateCellsBatchingPeriod={50}
          onRefresh={refresh}
          windowSize={10}
        />

        <FloatingButton
          onPress={handleNewGroup}
          icon="add"
          style={styles.fab}
        />
      </KeyboardAvoidingView>

      <UserSelectionModal
        visible={showUserSelection}
        onClose={() => setShowUserSelection(false)}
        conversationType="group"
        onCreateConversation={handleCreateGroup}
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
    justifyContent: 'center',
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

export default GroupMessagesScreen;
