import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

// Define your navigation parameters
type RootStackParamList = {
  Chat: {
    conversationId: number | string;
    conversationType: 'one_to_one' | 'group';
  };
  // Add other screens here
};

type ConversationType = 'one_to_one' | 'group';

interface OneToOneConversation {
  id: number | string;
  participants: Array<{ id: number; username: string }>;
  created_at: string;
  is_active: boolean;
}

interface GroupConversation {
  id: number | string;
  name: string;
  description: string;
  participants: number[];
  moderators: number[];
  is_private: boolean;
  created_at: string;
}

// Use this navigation type
type MessagingScreenNavigationProp = StackNavigationProp<MessagingStackParamList, 'Messaging'>;

const MessagingScreen: React.FC = () => {
  const navigation = useNavigation<MessagingScreenNavigationProp>();
  const { accessToken, user } = useAuth();
  const [conversationType, setConversationType] = useState<ConversationType>('one_to_one');
  const [conversations, setConversations] = useState<(OneToOneConversation | GroupConversation)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add debug logging
  useEffect(() => {
    console.log('Auth State:', { 
      hasToken: !!accessToken, 
      hasUser: !!user,
      userDetails: user 
    });
  }, [accessToken, user]);

  // Update fetch conversations to log more details
  const fetchConversations = useCallback(async () => {
    console.log('Attempting to fetch conversations:', {
      hasToken: !!accessToken,
      hasUser: !!user,
      userDetails: user
    });

    if (!accessToken) {
      console.error('Missing access token');
      setIsLoading(false);
      return;
    }

    // Remove user check since it might not be needed for fetching conversations
    let endpoint = '';
    if (conversationType === 'one_to_one') {
      endpoint = `${API_URL}/messaging/one_to_one/`;
    } else {
      endpoint = `${API_URL}/messaging/groups/`;
    }
    
    try {
      console.log('Fetching from endpoint:', endpoint);
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received conversations:', data);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, conversationType]);

  useEffect(() => {
    // Only check for accessToken
    if (accessToken) {
      fetchConversations();
    } else {
      setIsLoading(false);
    }
  }, [fetchConversations, accessToken]);

  // Modify the authentication guard to only check for accessToken
  // since that's what we need to fetch conversations
  if (!accessToken) {
    console.log('Authentication required:', { hasToken: !!accessToken });
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Authentication required.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  const renderConversationItem = (conv: OneToOneConversation | GroupConversation) => {
    let displayName = '';
    if (conversationType === 'one_to_one') {
      const participants = (conv as OneToOneConversation).participants;
      
      // Get user ID from conversation participants if user object is missing
      const userId = user?.id || participants?.find(p => p.username === user?.username)?.id;
      if (!userId) {
        // Just show the participants' names if we can't identify the current user
        displayName = participants.map(p => p.username).join(', ');
      } else {
        // Compare as numbers to ensure type match
        const other = participants.find((p) => p.id !== Number(userId));
        displayName = other ? other.username : 'Conversation';
      }
    } else {
      displayName = (conv as GroupConversation).name;
    }

    return (
      <TouchableOpacity 
        key={conv.id} 
        style={styles.conversationItem}
        onPress={() => {
          console.log('Navigating to chat with ID:', conv.id);
          navigation.navigate('Chat', {
            conversationId: conv.id,
            conversationType: conversationType
          });
        }}
      >
        <Text style={styles.conversationTitle}>{displayName}</Text>
        <Text style={styles.conversationTime}>
          {new Date(conv.created_at).toLocaleTimeString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Toggle selectors */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            conversationType === 'one_to_one' && styles.activeToggle,
          ]}
          onPress={() => setConversationType('one_to_one')}
        >
          <Text style={styles.toggleText}>One-to-One</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            conversationType === 'group' && styles.activeToggle,
          ]}
          onPress={() => setConversationType('group')}
        >
          <Text style={styles.toggleText}>Group</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.conversationsContainer}>
        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations available.</Text>
          </View>
        ) : (
          conversations.map((conv) => renderConversationItem(conv))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 5,
  },
  activeToggle: {
    backgroundColor: '#007BFF',
  },
  toggleText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  conversationsContainer: { flex: 1, padding: 10 },
  conversationItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    marginBottom: 10,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MessagingScreen;
