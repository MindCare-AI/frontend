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
import { useConversations } from '../../hooks/messagingScreen/useConversations';
import { useAuth } from '../../contexts/AuthContext';
import { createShadow } from '../../styles/global';
import { getAllUsers, createConversation, createGroupConversation } from '../../API/conversations';

// Import the Conversation type from types/navigation
import { Conversation } from '../../types/navigation';

// Define types not included in the navigation types
interface Participant {
  id: string | number;
  full_name?: string;
  username?: string;
  profile_pic?: string;
}

// Extend the Conversation type with properties we need, omitting 'participants' to redefine it
type ExtendedConversation = Omit<Conversation, 'participants'> & {
  is_group: boolean;
  name?: string;
  participants: Participant[];
  other_user_name?: string;
  other_participant?: {
    id: number;
    username?: string;
    full_name?: string;
  };
};

import ConversationItem from '../../components/Conversations/ConversationItem';
import ConversationHeader from '../../components/Conversations/ConversationHeader';
import EmptyConversationsList from '../../components/Conversations/EmptyConversationsList';
import FloatingButton from '../../components/Conversations/FloatingButton';
import ConversationTypeModal from '../../components/Chat/ConversationTypeModal';
import UserSelectionModal from '../../components/Chat/UserSelectionModal';

interface RootStackParamList {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  App: undefined;
  ChatScreen: { 
    conversationId: string | number;
    conversationTitle?: string;
    isGroup?: boolean;
  };
  NewConversation: undefined;
  Settings: undefined;
  [key: string]: object | undefined; // Add index signature for other screens
}

// Filter modes for conversation types
type FilterMode = 'all' | 'direct' | 'group';

// Extract the message item into a separate functional component
// This allows us to use hooks properly for each item
const AnimatedConversationItem = ({ 
  item, 
  index, 
  userId, 
  onPress 
}: { 
  item: any; 
  index: number; 
  userId: string | number;
  onPress: (id: string | number) => void;
}) => {
  const itemFadeAnim = useRef(new Animated.Value(0)).current;
  const itemTranslateY = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Stagger the animation based on item index
    const delay = index * 50;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(itemFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(itemTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }, delay);
  }, [index]);
  
  return (
    <Animated.View style={{
      opacity: itemFadeAnim,
      transform: [{ translateY: itemTranslateY }]
    }}>
      <ConversationItem
        conversation={item as any}
        userId={userId}
        onPress={() => onPress(item.id)}
      />
    </Animated.View>
  );
};

// Add this interface with other type definitions
interface User {
  id: string | number;
  username: string;
  email?: string;
  full_name?: string;
  user_type?: 'patient' | 'therapist';
}

// Add this interface near the top with other type definitions
interface ConversationCreateResponse {
  id: string | number;
  name?: string;
  is_group: boolean;
  participants: Participant[];
  created_at: string;
  other_user_name?: string;
}

const ConversationsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  const {
    conversations,
    loading,
    refreshing,
    error,
    refreshConversations
  } = useConversations();

  // Modal states
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedConversationType, setSelectedConversationType] = useState<'group' | 'direct'>('direct');
  const [creating, setCreating] = useState(false);

  // Apply entrance animation when conversations load
  useEffect(() => {
    if (!loading && conversations.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [loading, conversations.length]);

  // Filter conversations based on search query and selected filter mode
  const filteredConversations = useCallback(() => {
    let filteredList = conversations as ExtendedConversation[];
    
    // First apply type filter - make sure is_group property is respected
    if (filterMode === 'direct') {
      filteredList = filteredList.filter(conversation => conversation.is_group === false);
    } else if (filterMode === 'group') {
      filteredList = filteredList.filter(conversation => conversation.is_group === true);
    }
    
    // Then apply search filter if needed
    if (searchQuery.trim()) {
      filteredList = filteredList.filter(conversation => {
        // For direct messages, search by the other person's name
        if (!conversation.is_group) {
          // First try other_user_name from API
          if (conversation.other_user_name) {
            return conversation.other_user_name.toLowerCase().includes(searchQuery.toLowerCase());
          }
          
          // Then try other_participant
          if (conversation.other_participant?.username) {
            return conversation.other_participant.username.toLowerCase().includes(searchQuery.toLowerCase());
          }
          
          // Then try finding by participant ID
          const otherParticipant = conversation.participants?.find(
            p => p.id !== user?.id
          );
          return otherParticipant?.full_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            otherParticipant?.username
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        } 
        // For groups, search by group name
        return conversation.name?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    return filteredList;
  }, [conversations, searchQuery, user?.id, filterMode]);

  const handleConversationPress = (id: string | number) => {
    console.log('[ConversationsScreen] → opening chat screen for convo:', id);
    
    // Get the conversation details to pass along
    const conversation = conversations.find(c => c.id === id) as ExtendedConversation;
    const conversationTitle = conversation?.name || 
                            conversation?.other_user_name || 
                            `Chat ${id}`;
    const isGroup = conversation?.is_group || false;
    
    // Navigate with complete details
    navigation.navigate('ChatScreen', {
      conversationId: id,
      conversationTitle: conversationTitle,
      isGroup: isGroup
    });
  };

  const handleNewConversation = () => {
    setShowTypeModal(true);
  };
  
  const handleSelectConversationType = (type: 'group' | 'direct') => {
    setSelectedConversationType(type);
    setShowUserModal(true);
  };

  const handleCreateConversation = async (
    selectedUsers: User[],
    groupName?: string,
    groupDescription?: string
  ) => {
    if (!user) return;

    setCreating(true);
    try {
      let newConversation: ConversationCreateResponse;

      if (selectedConversationType === 'direct') {
        // Create one-to-one conversation
        const participant = selectedUsers[0];
        newConversation = await createConversation(participant.id);
        
        console.log('[ConversationsScreen] ✅ Direct conversation created:', newConversation);
        
        // Close modals first
        setShowUserModal(false);
        setShowTypeModal(false);
        
        Alert.alert(
          'Success',
          `Direct conversation with ${participant.username} created successfully!`,
          [
            {
              text: 'Open Chat',
              onPress: () => {
                navigation.navigate('ChatScreen', {
                  conversationId: newConversation.id,
                  conversationTitle: participant.username,
                  isGroup: false
                });
              }
            },
            { text: 'OK' }
          ]
        );
      } else {
        // Create group conversation
        const participantIds = selectedUsers.map(u => u.id);
        newConversation = await createGroupConversation(
          groupName || '',
          groupDescription || '',
          participantIds
        );
        
        console.log('[ConversationsScreen] ✅ Group conversation created:', newConversation);
        
        // Close modals first
        setShowUserModal(false);
        setShowTypeModal(false);
        
        Alert.alert(
          'Success',
          `Group "${groupName}" created successfully!`,
          [
            {
              text: 'Open Chat',
              onPress: () => {
                navigation.navigate('ChatScreen', {
                  conversationId: newConversation.id,
                  conversationTitle: groupName || 'Group Chat',
                  isGroup: true
                });
              }
            },
            { text: 'OK' }
          ]
        );
      }

      // Refresh conversations list after successful creation
      console.log('[ConversationsScreen] 🔄 Refreshing conversations after creation...');
      await refreshConversations();
      
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert(
        'Error',
        'Failed to create conversation. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  const getFilterButtonStyle = (mode: FilterMode) => {
    return [
      styles.filterButton,
      filterMode === mode ? styles.activeFilterButton : null
    ];
  };
  
  const getFilterTextStyle = (mode: FilterMode) => {
    return [
      styles.filterButtonText,
      filterMode === mode ? styles.activeFilterText : null
    ];
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#002D62" />
        <ConversationHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002D62" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#002D62" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <LinearGradient colors={['#E4F0F6', '#FFFFFF']} style={styles.gradient}>
          <ConversationHeader />
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#888"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Filter tabs */}
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={getFilterButtonStyle('all')} 
              onPress={() => setFilterMode('all')}
            >
              <Text style={getFilterTextStyle('all')}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={getFilterButtonStyle('direct')} 
              onPress={() => setFilterMode('direct')}
            >
              <Text style={getFilterTextStyle('direct')}>Direct Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={getFilterButtonStyle('group')} 
              onPress={() => setFilterMode('group')}
            >
              <Text style={getFilterTextStyle('group')}>Groups</Text>
            </TouchableOpacity>
          </View>
          
          <Animated.View style={{ 
            flex: 1, 
            opacity: fadeAnim,
            transform: [{ translateY: translateY }]
          }}>
            <FlatList
              data={filteredConversations()}
              keyExtractor={(item: any) => {
                // Create a genuinely unique key by combining multiple properties
                const typePrefix = item.is_group ? 'group' : 'one2one';
                
                // Include timestamp to differentiate between items with same ID
                const timestamp = item.last_message?.timestamp 
                  ? new Date(item.last_message.timestamp).getTime() 
                  : 0;
                  
                // Add some participant information for further uniqueness
                const participantInfo = item.participants 
                  ? item.participants.map((p: {id: string | number}) => p.id).join('_')
                  : '';
                  
                // Combine all data points into a unique string
                return `${typePrefix}_${item.id}_${timestamp}_${participantInfo}`;
              }}
              renderItem={({ item, index }: { item: any, index: number }) => (
                <AnimatedConversationItem 
                  item={item} 
                  index={index} 
                  userId={user?.id || ''}
                  onPress={handleConversationPress}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshConversations}
                  colors={['#002D62']}
                  tintColor="#002D62"
                />
              }
              ListEmptyComponent={
                <EmptyConversationsList
                  isSearching={searchQuery.length > 0}
                  error={error}
                  onRetry={refreshConversations}
                  onStartConversation={handleNewConversation}
                  filterMode={filterMode}
                />
              }
            />
          </Animated.View>
          
          <FloatingButton onPress={handleNewConversation} />
          
          {/* Conversation type selection modal */}
          <ConversationTypeModal
            visible={showTypeModal}
            onClose={() => setShowTypeModal(false)}
            onSelectType={handleSelectConversationType}
          />

          {/* User selection modal for creating conversations */}
          <UserSelectionModal
            visible={showUserModal}
            onClose={() => setShowUserModal(false)}
            conversationType={selectedConversationType}
            onCreateConversation={handleCreateConversation}
            currentUserId={user?.id || 0}
            creating={creating}
          />
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002D62',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    ...createShadow(2, '#000', 0.1),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    ...createShadow(1, '#000', 0.1),
  },
  activeFilterButton: {
    backgroundColor: '#002D62',
    ...createShadow(3, '#002D62', 0.3),
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  conversationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ConversationsScreen;
