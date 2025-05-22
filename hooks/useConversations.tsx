import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import types for our data
interface Participant {
  id: string | number;
  full_name?: string;
  profile_pic?: string;
}

interface Message {
  id: string | number;
  content: string;
  timestamp: string;
  sender_id: string | number;
  is_read: boolean;
}

interface Conversation {
  id: string | number;
  is_group: boolean;
  name?: string;
  participants: Participant[];
  last_message?: Message;
  unread_count: number;
}

// Add this type for the API response
type ConversationsApiResponse = {
  one_to_one?: Conversation[];
  groups?: Conversation[];
  [key: string]: any;
};

// Import the API function with a different name to avoid conflict
import { getConversations as apiGetConversations } from '../API/conversations';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, user } = useAuth();

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const data = await apiGetConversations();
      // Use type assertion to avoid TS property errors
      const apiData = data as ConversationsApiResponse;
      let allConversations: Conversation[] = [];
      
      if (apiData && typeof apiData === 'object') {
        // Process one-to-one conversations
        if (Array.isArray(apiData.one_to_one)) {
          // Make sure each conversation has is_group=false
          const oneToOneConversations = apiData.one_to_one.map(conv => ({
            ...conv,
            is_group: false
          }));
          allConversations = allConversations.concat(oneToOneConversations);
        }
        
        // Process group conversations
        if (Array.isArray(apiData.groups)) {
          // Make sure each conversation has is_group=true
          const groupConversations = apiData.groups.map(conv => ({
            ...conv,
            is_group: true
          }));
          allConversations = allConversations.concat(groupConversations);
        }
      } else if (Array.isArray(data)) {
        // Handle if API returns flat array instead
        allConversations = data.map(conv => ({
          ...conv,
          is_group: !!conv.name // Assume conversations with names are groups
        }));
      }

      // Sort conversations by the most recent message
      const sortedConversations = allConversations.sort((a: Conversation, b: Conversation) => {
        const aTime = a.last_message?.timestamp ? new Date(a.last_message.timestamp).getTime() : 0;
        const bTime = b.last_message?.timestamp ? new Date(b.last_message.timestamp).getTime() : 0;
        return bTime - aTime;
      });
      
      console.log('Loaded conversations:', sortedConversations.length, 
        'Direct:', sortedConversations.filter(c => !c.is_group).length,
        'Group:', sortedConversations.filter(c => c.is_group).length);
      
      setConversations(sortedConversations);
      await AsyncStorage.setItem('cachedConversations', JSON.stringify(sortedConversations));
      setError(null);
    } catch (err) {
      console.error('Error in useConversations:', err);
      setError('Failed to load conversations');
      
      // Try to load cached conversations if available
      try {
        const cachedData = await AsyncStorage.getItem('cachedConversations');
        if (cachedData) {
          setConversations(JSON.parse(cachedData));
        }
      } catch (cacheErr) {
        console.error('Error loading cached conversations:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Pull-to-refresh functionality
  const refreshConversations = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await apiGetConversations();
      const apiData = data as ConversationsApiResponse;
      let allConversations: Conversation[] = [];
      
      if (apiData && typeof apiData === 'object') {
        // Process one-to-one conversations
        if (Array.isArray(apiData.one_to_one)) {
          const oneToOneConversations = apiData.one_to_one.map(conv => ({
            ...conv,
            is_group: false
          }));
          allConversations = allConversations.concat(oneToOneConversations);
        }
        
        // Process group conversations
        if (Array.isArray(apiData.groups)) {
          const groupConversations = apiData.groups.map(conv => ({
            ...conv,
            is_group: true
          }));
          allConversations = allConversations.concat(groupConversations);
        }
      } else if (Array.isArray(data)) {
        allConversations = data.map(conv => ({
          ...conv,
          is_group: !!conv.name
        }));
      }

      // Sort conversations by the most recent message
      const sortedConversations = allConversations.sort((a: Conversation, b: Conversation) => {
        const aTime = a.last_message?.timestamp ? new Date(a.last_message.timestamp).getTime() : 0;
        const bTime = b.last_message?.timestamp ? new Date(b.last_message.timestamp).getTime() : 0;
        return bTime - aTime;
      });
      
      setConversations(sortedConversations);
      await AsyncStorage.setItem('cachedConversations', JSON.stringify(sortedConversations));
      setError(null);
    } catch (err) {
      console.error('Error refreshing conversations:', err);
      setError('Failed to refresh conversations');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Subscribe to conversation updates (optional - for real-time features)
  const subscribeToUpdates = useCallback(() => {
    // Implement WebSocket connection using WS_BASE_URL from config
    // This would handle real-time updates for new messages
    return () => {
      // Cleanup WebSocket connection
    };
  }, []);

  // Initial load of conversations
  useEffect(() => {
    fetchConversations();
    
    // Optional: Set up WebSocket for real-time updates
    const unsubscribe = subscribeToUpdates();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchConversations, subscribeToUpdates]);

  // Add a new conversation to the list
  const addConversation = useCallback((newConversation: Conversation) => {
    setConversations(prev => [newConversation, ...prev]);
  }, []);

  // Update an existing conversation
  const updateConversation = useCallback((updatedConversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
  }, []);

  return {
    conversations,
    loading,
    refreshing,
    error,
    refreshConversations,
    fetchConversations,
    addConversation,
    updateConversation
  };
};
