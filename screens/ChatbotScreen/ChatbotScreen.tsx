import React, { useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet, SafeAreaView,
  ActivityIndicator, StatusBar, Keyboard, Image
} from 'react-native';
import { useChatbot } from '../../hooks/ChatbotScreen/useChatbot';
import TypingIndicator from '../../components/ChatbotScreen/TypingIndicator';
import { ChatMessageBubble } from '../../components/ChatbotScreen/ChatMessageBubble';
import { AnimatedBotMessage } from '../../components/ChatbotScreen/AnimatedBotMessage';
import { useTheme } from '../../theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

export default function ChatbotScreen() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    isTyping,
    retryMessage,
    clearHistory
  } = useChatbot();
  
  const [input, setInput] = React.useState('');
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);
  const { colors } = useTheme();
  const dark = React.useMemo(() => {
    return colors.background === '#121212' || colors.primary === '#002D62';
  }, [colors]);
  
  const scrollViewRef = useRef<ScrollView | null>(null);
  const navigation = useNavigation();
  
  // Theme-based styles
  const dynamicStyles = {
    container: {
      backgroundColor: dark ? colors.darkBackground : colors.lightBackground
    },
    header: {
      backgroundColor: dark ? colors.primaryDark : colors.primary,
      borderBottomColor: dark ? '#2C2C2C' : '#E5E5E5'
    },
    headerTitle: {
      color: '#FFFFFF'
    },
    inputContainer: {
      backgroundColor: dark ? '#1E1E1E' : '#FFFFFF',
      borderTopColor: dark ? '#2C2C2C' : '#E5E5E5'
    },
    input: {
      backgroundColor: dark ? '#2C2C2C' : '#F5F5F5',
      color: dark ? '#FFFFFF' : '#000000'
    },
    sendButton: {
      backgroundColor: colors.primary
    }
  };

  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  // Helper to handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Animated.Text 
            entering={FadeIn.duration(500)}
            style={styles.loadingText}
          >
            Connecting to your AI assistant...
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <View style={[styles.header, dynamicStyles.header]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
              Samantha AI
            </Text>
            <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
              <Ionicons name="refresh-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {messages.length === 0 && (
            <Animated.View 
              entering={FadeIn.duration(800)}
              style={styles.emptyStateContainer}
            >
              <View style={styles.emptyStateIconContainer}>
                <Ionicons 
                  name="chatbubble-ellipses" 
                  size={100} 
                  color={colors.primary} 
                />
              </View>
              <Text style={styles.emptyStateTitle}>Welcome to Samantha AI</Text>
              <Text style={styles.emptyStateText}>
                I'm your personal mental health assistant. How can I help you today?
              </Text>
            </Animated.View>
          )}

          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageRow,
                msg.is_bot ? styles.botMessageRow : styles.userMessageRow
              ]}
            >
              {msg.is_bot ? (
                <AnimatedBotMessage message={msg.content}>
                  <ChatMessageBubble
                    message={msg.content}
                    isBot={true}
                    timestamp={new Date(msg.timestamp)}
                  />
                </AnimatedBotMessage>
              ) : (
                <ChatMessageBubble
                  message={msg.content}
                  isBot={false}
                  timestamp={new Date(msg.timestamp)}
                  status={msg.status === 'failed' ? undefined : msg.status}
                />
              )}
            </View>
          ))}

          {isTyping && (
            <View style={styles.typingContainer}>
              <TypingIndicator visible={isTyping} />
            </View>
          )}
          
          {/* Add extra space at bottom for better scrolling experience */}
          <View style={{ height: 20 }} />
        </ScrollView>

        <Animated.View 
          style={[styles.inputContainer, dynamicStyles.inputContainer]}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={dark ? '#AAAAAA' : '#888888'}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
            multiline={true}
            maxLength={1000}
            numberOfLines={5}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              dynamicStyles.sendButton,
              !input.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  keyboardAvoidingView: {
    flex: 1
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#002D62',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    padding: 8
  },
  clearButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    flex: 1
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1
  },
  messageRow: {
    marginVertical: 4
  },
  botMessageRow: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  userMessageRow: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  typingContainer: {
    marginLeft: 10,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 40
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#002D62',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    opacity: 0.5
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    textAlign: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#002D62'
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginVertical: 40
  },
  emptyStateIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 45, 98, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: '80%'
  }
});
