import { Message } from '../types/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

class ChatService {
  private messageListeners: Function[] = [];
  private conversations: Map<string, Message[]> = new Map();
  
  /**
   * Add a listener for new messages
   * @param listener Function to call when a new message is received
   */
  public addMessageListener(listener: (message: Message) => void): void {
    this.messageListeners.push(listener);
  }
  
  /**
   * Remove a message listener
   * @param listener Function to remove from listeners
   */
  public removeMessageListener(listener: Function): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }
  
  /**
   * Handle a new message - notify all listeners and update local storage
   * @param message The new message
   */
  public handleNewMessage(message: Message): void {
    // Notify all listeners
    this.messageListeners.forEach(listener => listener(message));
    
    // Update conversation cache
    const conversationId = message.id.split('-')[0]; // Assuming message IDs include conversation ID prefix
    const conversationMessages = this.conversations.get(conversationId) || [];
    this.conversations.set(conversationId, [...conversationMessages, message]);
    
    // Update local storage
    this.persistMessages(conversationId, [...conversationMessages, message]);
  }
  
  /**
   * Get messages for a specific conversation
   * @param conversationId The conversation ID
   */
  public async getMessages(conversationId: string): Promise<Message[]> {
    // Try to get messages from cache first
    let messages = this.conversations.get(conversationId);
    
    // If not in cache, try to get from local storage
    if (!messages) {
      try {
        const storedMessages = await AsyncStorage.getItem(`chat_messages_${conversationId}`);
        if (storedMessages) {
          messages = JSON.parse(storedMessages);
          this.conversations.set(conversationId, messages || []);
        } else {
          messages = [];
        }
      } catch (error) {
        console.error('Error retrieving messages from storage:', error);
        messages = [];
      }
    }
    
    return messages || [];
  }
  
  /**
   * Persist messages to local storage
   * @param conversationId The conversation ID
   * @param messages Messages to persist
   */
  private async persistMessages(conversationId: string, messages: Message[]): Promise<void> {
    try {
      await AsyncStorage.setItem(`chat_messages_${conversationId}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Error storing messages:', error);
    }
  }
  
  /**
   * Fetch messages from API
   * @param conversationId The conversation ID
   */
  public async fetchMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await fetch(`${API_URL}/messaging/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      const messages: Message[] = data.messages;
      
      // Update cache and storage
      this.conversations.set(conversationId, messages);
      this.persistMessages(conversationId, messages);
      
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }
  
  /**
   * Clear messages for a conversation
   * @param conversationId The conversation ID
   */
  public async clearMessages(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId);
    try {
      await AsyncStorage.removeItem(`chat_messages_${conversationId}`);
    } catch (error) {
      console.error('Error removing messages from storage:', error);
    }
  }
}

const chatService = new ChatService();
export default chatService;