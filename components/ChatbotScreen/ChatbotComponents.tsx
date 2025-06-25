import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ChatbotConversation, ChatbotConversationListItem, ChatMessage } from '../../types/chatbot/chatbot';

// Conversation List Item Component
interface ConversationListItemProps {
  conversation: ChatbotConversation | ChatbotConversationListItem;
  onPress: () => void;
  onLongPress?: () => void;
  onDelete?: () => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  onPress,
  onLongPress,
  onDelete,
}) => {
  const getLastMessageText = () => {
    if ('last_message' in conversation && conversation.last_message) {
      return conversation.last_message.content.length > 50
        ? conversation.last_message.content.substring(0, 50) + '...'
        : conversation.last_message.content;
    }
    if ('last_message_preview' in conversation && conversation.last_message_preview) {
      return conversation.last_message_preview.preview;
    }
    return 'No messages yet';
  };

  const getLastMessageTime = () => {
    if ('last_message' in conversation && conversation.last_message) {
      return new Date(conversation.last_message.timestamp).toLocaleDateString();
    }
    if ('last_message_preview' in conversation && conversation.last_message_preview) {
      return new Date(conversation.last_message_preview.timestamp).toLocaleDateString();
    }
    return new Date(conversation.created_at).toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.conversationItem, !conversation.is_active && styles.inactiveConversation]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationTitle} numberOfLines={1}>
            {conversation.title}
          </Text>
          <Text style={styles.conversationTime}>
            {getLastMessageTime()}
          </Text>
        </View>
        
        <Text style={styles.lastMessage} numberOfLines={2}>
          {getLastMessageText()}
        </Text>
        
        <View style={styles.conversationFooter}>
          <Text style={styles.messageCount}>
            {conversation.message_count} messages
          </Text>
          {!conversation.is_active && (
            <View style={styles.archivedBadge}>
              <Text style={styles.archivedText}>Archived</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        {onDelete && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Icon name="delete-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
        <Icon name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
};

// Conversation List Component
interface ConversationListProps {
  conversations: (ChatbotConversation | ChatbotConversationListItem)[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onConversationPress: (conversation: ChatbotConversation | ChatbotConversationListItem) => void;
  onConversationLongPress?: (conversation: ChatbotConversation | ChatbotConversationListItem) => void;
  onDeleteConversation?: (conversation: ChatbotConversation | ChatbotConversationListItem) => void;
  onCreateNew: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  loading,
  refreshing,
  onRefresh,
  onConversationPress,
  onConversationLongPress,
  onDeleteConversation,
  onCreateNew,
}) => {
  if (loading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.conversationListContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Conversations</Text>
        <TouchableOpacity style={styles.newChatButton} onPress={onCreateNew}>
          <Icon name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <ConversationListItem
            conversation={item}
            onPress={() => onConversationPress(item)}
            onLongPress={() => onConversationLongPress?.(item)}
            onDelete={onDeleteConversation ? () => onDeleteConversation(item) : undefined}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="chat-bubble-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>Start a new chat to begin</Text>
            <TouchableOpacity style={styles.startChatButton} onPress={onCreateNew}>
              <Text style={styles.startChatText}>Start New Chat</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: ChatMessage;
  showSender?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, showSender = false }) => {
  return (
    <View style={[
      styles.messageContainer,
      message.is_bot ? styles.botMessage : styles.userMessage
    ]}>
      {showSender && (
        <Text style={styles.senderName}>{message.sender_name}</Text>
      )}
      
      <View style={[
        styles.messageBubble,
        message.is_bot ? styles.botBubble : styles.userBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.is_bot ? styles.botText : styles.userText
        ]}>
          {message.content}
        </Text>
        
        {message.is_bot && message.chatbot_method && (
          <Text style={styles.methodText}>
            Method: {message.chatbot_method}
          </Text>
        )}
        
        <Text style={[
          styles.timestamp,
          message.is_bot ? styles.botTimestamp : styles.userTimestamp
        ]}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );
};

// Conversation Options Modal
interface ConversationOptionsModalProps {
  visible: boolean;
  conversation: ChatbotConversation | ChatbotConversationListItem | null;
  onClose: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onClear: () => void;
  onDelete: () => void;
}

export const ConversationOptionsModal: React.FC<ConversationOptionsModalProps> = ({
  visible,
  conversation,
  onClose,
  onEdit,
  onToggleActive,
  onClear,
  onDelete,
}) => {
  if (!conversation) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{conversation.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.modalOption} onPress={onEdit}>
            <Icon name="edit" size={20} color="#374151" />
            <Text style={styles.modalOptionText}>Edit Title</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.modalOption} onPress={onToggleActive}>
            <Icon 
              name={conversation.is_active ? "archive" : "unarchive"} 
              size={20} 
              color="#374151" 
            />
            <Text style={styles.modalOptionText}>
              {conversation.is_active ? "Archive" : "Unarchive"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.modalOption} onPress={onClear}>
            <Icon name="clear-all" size={20} color="#F59E0B" />
            <Text style={[styles.modalOptionText, styles.warningText]}>Clear Messages</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.modalOption} onPress={onDelete}>
            <Icon name="delete" size={20} color="#EF4444" />
            <Text style={[styles.modalOptionText, styles.dangerText]}>Delete Conversation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Edit Title Modal
interface EditTitleModalProps {
  visible: boolean;
  currentTitle: string;
  onClose: () => void;
  onSave: (newTitle: string) => void;
}

export const EditTitleModal: React.FC<EditTitleModalProps> = ({
  visible,
  currentTitle,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(currentTitle);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.editModalContent}>
          <Text style={styles.editModalTitle}>Edit Conversation Title</Text>
          
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter conversation title"
            maxLength={255}
            autoFocus
          />
          
          <View style={styles.editModalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Conversation List Item Styles with enhanced animations and shadows
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.1)',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: 4,
    transform: [{ scale: 1 }],
  },
  inactiveConversation: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  archivedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  archivedText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
  },

  // Enhanced Conversation List Styles
  conversationListContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  newChatButton: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startChatText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Enhanced Message Styles with better animations
  messageContainer: {
    marginVertical: 6,
    maxWidth: '85%',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 12,
    fontWeight: '500',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#1F2937',
  },
  methodText: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 6,
    opacity: 0.8,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  botTimestamp: {
    color: '#9CA3AF',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 144, 226, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  warningText: {
    color: '#F59E0B',
  },
  dangerText: {
    color: '#EF4444',
  },

  // Edit Modal Styles
  editModalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
});
