import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput as NativeTextInput,
  ScrollView as NativeScrollView,
  TouchableOpacity as NativeTouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config';

// Import web-specific UI components from your design system
import { ScrollArea } from '../../components/ui/scroll-area';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// Choose wrappers based on platform
const ScrollContainer = Platform.OS === 'web' ? ScrollArea : NativeScrollView;
const TextInputComponent = Platform.OS === 'web' ? Input : NativeTextInput;
const ButtonComponent = Platform.OS === 'web' ? Button : NativeTouchableOpacity;

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  is_chatbot: boolean;
  message_type: string;
}

// Firebase config (client-side only - do not use service account credentials)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "mindcare-41d45.firebaseapp.com",
  databaseURL: "https://mindcare-41d45.firebaseio.com",
  projectId: "mindcare-41d45",
  storageBucket: "mindcare-41d45.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { accessToken } = useAuth();
  const scrollViewRef = useRef<any>(null);
  const typingOpacity = useRef(new Animated.Value(1)).current;

  // Initialize chatbot conversation with the backend.
  const initializeChatbotConversation = useCallback(async (): Promise<number | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/messaging/chatbot/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to initialize conversation');
      const data = await response.json();
      setConversationId(data.id);
      return data.id;
    } catch (error) {
      Alert.alert('Error', 'Failed to start chatbot conversation');
      console.error(error);
      return null;
    }
  }, [accessToken]);

  // Subscribe to Firebase Realtime Database updates.
  const subscribeToMessages = useCallback(() => {
    if (!conversationId) return;
    const messagesRef = firebase.database().ref(`conversations/${conversationId}/messages`);
    messagesRef.orderByChild('timestamp').on('child_added', snapshot => {
      const msg = snapshot.val();
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: snapshot.key!,
          sender: msg.sender,
          content: msg.message,
          timestamp: msg.timestamp,
          is_chatbot: msg.sender === 'Samantha',
          message_type: 'text',
        },
      ]);
      // Once Samantha responds, stop showing the typing indicator.
      if (msg.sender === 'Samantha') setIsTyping(false);
    });
    return () => messagesRef.off();
  }, [conversationId]);

  // Typing animation effect.
  useEffect(() => {
    if (isTyping) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingOpacity, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(typingOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isTyping, typingOpacity]);

  // Initialize conversation and subscribe to its messages.
  useEffect(() => {
    initializeChatbotConversation();
  }, [initializeChatbotConversation]);

  useEffect(() => {
    subscribeToMessages();
  }, [subscribeToMessages]);

  // Send message to the backend.
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !conversationId || !accessToken) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/messaging/conversations/${conversationId}/messages/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation: conversationId,
            content: input.trim(),
            is_chatbot: false,
            message_type: "text"
          }),
        }
      );

      if (response.ok) {
        console.log("Message sent successfully");
        setInput(''); // Clear the input field
        setIsTyping(true);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      } else {
        const errorData = await response.json();
        console.error("Send message error:", errorData);
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert('Error', 'Failed to send message');
    }
  }, [input, conversationId, accessToken]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat with Samantha 🤖</Text>
        </View>

        <ScrollContainer
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesList}
          {...(Platform.OS !== "web"
            ? { onContentSizeChange: () => scrollViewRef.current?.scrollToEnd({ animated: true }) }
            : {})}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageRow,
                msg.is_chatbot ? styles.botMessageRow : styles.userMessageRow,
              ]}
            >
              {msg.is_chatbot && (
                <View style={styles.avatar}>
                  <Text>🤖</Text>
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.is_chatbot ? styles.botBubble : styles.userBubble,
                ]}
              >
                <Text style={msg.is_chatbot ? styles.botText : styles.userText}>
                  {msg.content}
                </Text>
              </View>
              {!msg.is_chatbot && (
                <View style={styles.avatar}>
                  <Text>👤</Text>
                </View>
              )}
            </View>
          ))}
          {isTyping && (
            <Animated.View style={[styles.typingIndicator, { opacity: typingOpacity }]}>
              <Text style={styles.typingText}>Samantha is typing...</Text>
            </Animated.View>
          )}
        </ScrollContainer>

        <View style={styles.inputContainer}>
          <TextInputComponent
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            onSubmitEditing={sendMessage}
          />
          <ButtonComponent
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </ButtonComponent>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  keyboardAvoidingView: { flex: 1 },
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#002D62', textAlign: 'center' },
  messagesContainer: { flex: 1 },
  messagesList: { padding: 16 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  botMessageRow: { justifyContent: 'flex-start' },
  userMessageRow: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginVertical: 4 },
  botBubble: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', marginLeft: 8 },
  userBubble: { backgroundColor: '#002D62', marginRight: 8 },
  botText: { color: '#333333' },
  userText: { color: '#FFFFFF' },
  typingIndicator: { padding: 8, marginLeft: 48 },
  typingText: { color: '#666666', fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E5E5', alignItems: 'center' },
  input: { flex: 1, marginRight: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#F5F5F5', borderRadius: 24, fontSize: 16, color: '#333333' },
  sendButton: { width: 60, height: 44, borderRadius: 22, backgroundColor: '#002D62', alignItems: 'center', justifyContent: 'center' },
  sendButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
});