import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../config'; // Ensure this is properly defined in your config
import { useAuth } from '../../contexts/AuthContext';
import { AnimatedBotMessage } from '../../components/ChatbotScreen/AnimatedBotMessage'; // updated import
import TypingIndicator from '../../components/ChatbotScreen/TypingIndicator';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  is_chatbot?: boolean;
  status?: 'sending' | 'sent' | 'failed';
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { accessToken } = useAuth();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const typingOpacity = useRef(new Animated.Value(1)).current;
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chatbot conversation
  const initializeChatbotConversation = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/messaging/chatbot/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initial_message: "Hello, I need help." }) // added required field
      });

      if (!response.ok) throw new Error('Failed to initialize chatbot conversation');

      const data = await response.json();
      setConversationId(data.id);
      return data.id;
    } catch (error) {
      Alert.alert('Error', 'Could not start chatbot conversation');
      console.error(error);
      return null;
    }
  }, [accessToken]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      const response = await fetch(`${API_URL}/messaging/chatbot/${conversationId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      // If response contains a "messages" key, process as before.
      if (data.messages) {
        const messagesArray = Array.isArray(data.messages) ? data.messages : [];
        const formattedMessages = messagesArray.map((msg: any) => ({
          id: msg.id.toString(),
          sender: msg.is_chatbot ? 'Samantha' : 'You',
          content: msg.content,
          timestamp: msg.timestamp,
          is_chatbot: msg.is_chatbot,
        }));
        if (
          formattedMessages.length > 0 &&
          formattedMessages[formattedMessages.length - 1].is_chatbot
        ) {
          setIsTyping(false);
        }
        setMessages(formattedMessages);
      } else {
        console.info('No messages key found in response:', data);
        // Instead of clearing messages, simply turn off the typing indicator.
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [conversationId, accessToken]);

  // Send a message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !conversationId) return;

    const tempId = Date.now().toString();
    const tempMessage: Message = {
      id: tempId,
      content: input.trim(),
      sender: 'You',
      timestamp: new Date().toISOString(),
      status: 'sending',
      is_chatbot: false
    };

    try {
      setMessages(prev => [...prev, tempMessage]);
      setInput('');
      setIsTyping(true);

      const response = await fetch(`${API_URL}/messaging/chatbot/${conversationId}/send_message/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.response) {
        const formattedBot = {
          id: `bot-${Date.now()}`,
          content: data.response,
          sender: 'Samantha',
          timestamp: new Date().toISOString(),
          is_chatbot: true
        };

        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, status: 'sent' } : msg
        ));
        
        setTimeout(() => {
          setMessages(prev => [...prev, formattedBot]);
          setIsTyping(false);
        }, 500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
      setIsTyping(false);
      Alert.alert('Error', errorMessage);
    }
  }, [input, conversationId, accessToken]);

  // Typing animation
  useEffect(() => {
    if (isTyping) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingOpacity, { toValue: 0.3, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(typingOpacity, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isTyping, typingOpacity]);

  // Initialize conversation
  useEffect(() => {
    initializeChatbotConversation();
  }, [initializeChatbotConversation]);

  // Setup polling
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      pollingRef.current = setInterval(fetchMessages, 3000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [conversationId, fetchMessages]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat with Samantha 🤖</Text>
        </View>

        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <View key={index} style={[styles.messageRow, msg.is_chatbot ? styles.botMessageRow : styles.userMessageRow]}>
              <View style={[styles.messageBubble, msg.is_chatbot ? styles.botBubble : styles.userBubble]}>
                {msg.is_chatbot ? (
                  <AnimatedBotMessage message={msg.content} />
                ) : (
                  <Text style={msg.is_chatbot ? styles.botText : styles.userText}>{msg.content}</Text>
                )}
              </View>
            </View>
          ))}
          {isTyping && <TypingIndicator visible={isTyping} />}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            value={input} 
            onChangeText={setInput} 
            placeholder="Type a message..." 
            onSubmitEditing={sendMessage}  // Add this line
          />
          <TouchableOpacity 
            style={[styles.sendButton, !input.trim() && { opacity: 0.5 }]} 
            onPress={sendMessage} 
            disabled={!input.trim()}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  keyboardAvoidingView: { flex: 1 },
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#002D62' },
  messagesContainer: { paddingHorizontal: 12, paddingBottom: 20 },
  messageRow: { flexDirection: 'row', marginVertical: 5 },
  botMessageRow: { justifyContent: 'flex-start' },
  userMessageRow: { justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  botBubble: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5' },
  userBubble: { backgroundColor: '#002D62' },
  botText: { color: '#333' },
  userText: { color: '#FFF' },
  typingIndicator: { padding: 8, marginLeft: 10 },
  typingText: { color: '#666', fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E5E5' },
  input: { flex: 1, marginRight: 12, padding: 10, backgroundColor: '#F5F5F5', borderRadius: 24, fontSize: 16 },
  sendButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#002D62' },
  sendButtonText: { color: '#FFF', fontWeight: 'bold' },
});