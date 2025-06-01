import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyConversationsListProps {
  isSearching?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onStartConversation?: () => void;
  filterMode?: 'all' | 'direct' | 'group';
  title?: string;
  subtitle?: string;
  onCreateConversation?: () => void;
  loading?: boolean;
}

const EmptyConversationsList: React.FC<EmptyConversationsListProps> = ({
  isSearching = false,
  error = null,
  onRetry,
  onStartConversation,
  filterMode = 'all',
}) => {
  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.message}>{error}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Search with no results
  if (isSearching) {
    return (
      <View style={styles.container}>
        <Ionicons name="search-outline" size={64} color="#002D62" />
        <Text style={styles.title}>No results found</Text>
        <Text style={styles.message}>
          We couldn't find any conversations matching your search.
        </Text>
      </View>
    );
  }

  // Filter-specific empty states
  if (filterMode === 'direct') {
    return (
      <View style={styles.container}>
        <Ionicons name="person-outline" size={64} color="#3498db" />
        <Text style={styles.title}>No direct messages</Text>
        <Text style={styles.message}>
          You don't have any direct messages yet. Start a conversation with a therapist.
        </Text>
        {onStartConversation && (
          <TouchableOpacity style={styles.button} onPress={onStartConversation}>
            <Text style={styles.buttonText}>Start a Direct Message</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (filterMode === 'group') {
    return (
      <View style={styles.container}>
        <Ionicons name="people-outline" size={64} color="#9b59b6" />
        <Text style={styles.title}>No group conversations</Text>
        <Text style={styles.message}>
          You're not part of any group conversations yet. Create or join a group chat.
        </Text>
        {onStartConversation && (
          <TouchableOpacity style={styles.button} onPress={onStartConversation}>
            <Text style={styles.buttonText}>Create a Group</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default empty state
  return (
    <View style={styles.container}>
      <Ionicons name="chatbubble-ellipses-outline" size={64} color="#002D62" />
      <Text style={styles.title}>No conversations yet</Text>
      <Text style={styles.message}>
        Start a conversation with a therapist or join a support group.
      </Text>
      {onStartConversation && (
        <TouchableOpacity style={styles.button} onPress={onStartConversation}>
          <Text style={styles.buttonText}>Start a Conversation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#002D62',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EmptyConversationsList;
