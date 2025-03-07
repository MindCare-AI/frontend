import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';

type ChatScreenRouteProp = RouteProp<MessagingStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { conversationId, conversationType } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { accessToken } = useAuth();
  
  useEffect(() => {
    // Fetch messages for this conversation
    const fetchMessages = async () => {
      if (!accessToken) return;
      
      try {
        const endpoint = conversationType === 'one_to_one' 
          ? `${API_URL}/messaging/one_to_one/messages/?conversation=${conversationId}` 
          : `${API_URL}/messaging/groups/messages/?conversation=${conversationId}`;
          
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };
    
    fetchMessages();
  }, [conversationId, conversationType, accessToken]);
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !accessToken) return;
    
    try {
      const endpoint = conversationType === 'one_to_one' 
        ? `${API_URL}/messaging/one_to_one/messages/` 
        : `${API_URL}/messaging/groups/messages/`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          conversation: conversationId
        }),
      });
      
      if (response.ok) {
        setNewMessage('');
        // Refresh messages after sending
        const updatedResponse = await fetch(`${endpoint}?conversation=${conversationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setMessages(data);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Conversation ID: {conversationId}</Text>
      
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.sender}>{item.sender.username}</Text>
            <Text style={styles.messageContent}>{item.content}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
          </View>
        )}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageContent: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;