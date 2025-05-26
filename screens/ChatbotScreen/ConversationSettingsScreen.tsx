// screens/ChatbotScreen/ConversationSettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useChatbot } from '../../hooks/ChatbotScreen/useChatbot';
import { ChatbotStackParamList } from '../../navigation/types';
import { ChatbotConversation } from '../../types/chatbot/chatbot';
import { globalStyles } from '../../styles/global';
import { formatDate } from '../../utils/dateUtils';

type ConversationSettingsRouteProp = RouteProp<
  ChatbotStackParamList,
  'ConversationSettings'
>;

type ConversationSettingsNavigationProp = StackNavigationProp<
  ChatbotStackParamList,
  'ConversationSettings'
>;

const ConversationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<ConversationSettingsNavigationProp>();
  const route = useRoute<ConversationSettingsRouteProp>();
  const { conversationId } = route.params;
  
  const { 
    conversations,
    updateConversation, 
    deleteConversation,
    loading, 
    error,
    fetchConversations
  } = useChatbot();
  
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);
  const [title, setTitle] = useState('');
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      await fetchConversations();
      const conversationData = conversations.find(conv => conv.id === conversationId) as ChatbotConversation;
      if (conversationData) {
        setConversation(conversationData);
        setTitle(conversationData.title);
        setActive(conversationData.is_active);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      Alert.alert('Error', 'Failed to load conversation details');
    }
  };

  const handleSave = async () => {
    if (!conversation) return;
    
    setIsSaving(true);
    try {
      await updateConversation(conversationId, {
        title: title.trim(),
        is_active: active,
      });
      
      // Navigate back to the conversation
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update conversation:', error);
      Alert.alert('Error', 'Failed to save conversation settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteConversation(conversationId);
              // Navigate back to the home screen after deletion
              navigation.navigate('ChatbotHome');
            } catch (error) {
              console.error('Failed to delete conversation:', error);
              Alert.alert('Error', 'Failed to delete conversation');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !conversation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={globalStyles.colors.primary} />
        <Text style={styles.loadingText}>Loading conversation settings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={globalStyles.colors.error} />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadConversation}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversation Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Conversation Title"
              placeholderTextColor={globalStyles.colors.neutralMedium}
              maxLength={100}
              autoCapitalize="sentences"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {active ? 'Active' : 'Archived'}
              </Text>
              <Switch
                value={active}
                onValueChange={setActive}
                trackColor={{
                  false: globalStyles.colors.neutralLight,
                  true: globalStyles.colors.primary,
                }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversation Info</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Created On</Text>
            <Text style={styles.infoValue}>{formatDate(conversation.created_at)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Last Activity</Text>
            <Text style={styles.infoValue}>{formatDate(conversation.last_activity)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Messages</Text>
            <Text style={styles.infoValue}>{conversation.message_count}</Text>
          </View>
        </View>
        
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={16} color="white" style={styles.buttonIcon} />
                <Text style={styles.deleteButtonText}>Delete Conversation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: globalStyles.colors.text,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: globalStyles.colors.neutralDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: globalStyles.colors.neutralLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: globalStyles.colors.text,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: globalStyles.colors.text,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: globalStyles.colors.neutralLight,
  },
  infoLabel: {
    fontSize: 14,
    color: globalStyles.colors.neutralDark,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: globalStyles.colors.text,
  },
  buttons: {
    marginTop: 12,
    marginBottom: 40,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: globalStyles.colors.primary,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: globalStyles.colors.error,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: globalStyles.colors.neutralDark,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: globalStyles.colors.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ConversationSettingsScreen;
