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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useConversations } from '../../hooks/useConversations';
import { useAuth } from '../../contexts/AuthContext';

// Import directly from ConversationItem to ensure type consistency
import ConversationItem, { Conversation } from '../../components/Conversations/ConversationItem';
import ConversationHeader from '../../components/Conversations/ConversationHeader';
import EmptyConversationsList from '../../components/Conversations/EmptyConversationsList';
import FloatingButton from '../../components/Conversations/FloatingButton';

interface RootStackParamList {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  App: undefined;
  ChatScreen: { conversationId: string | number };
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
    let filteredList = conversations as Conversation[];
    
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
          const otherParticipant = conversation.participants.find(
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

  const handleConversationPress = (conversationId: string | number) => {
    navigation.navigate('ChatScreen', { conversationId });
  };

  const handleNewConversation = () => {
    navigation.navigate('NewConversation');
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  activeFilterButton: {
    backgroundColor: '#002D62',
    shadowColor: '#002D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ConversationsScreen;
