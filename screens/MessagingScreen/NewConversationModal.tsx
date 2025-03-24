import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import ConversationService from '../../services/ConversationService';

export type ConversationType = 'one_to_one' | 'group';

interface User {
  id: number;
  username: string;
  profile_pic?: string;
}

interface NewConversationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: () => void;
  conversationType: ConversationType;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  visible,
  onClose,
  onCreate,
  conversationType
}) => {
  const [activeTab, setActiveTab] = useState<'one_to_one' | 'group'>('one_to_one');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { accessToken } = useAuth();
  
  // Fetch users based on search query
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // Optionally add a user type filter. For instance, if one_to_one, search for patients.
        const userTypeQuery = conversationType === 'one_to_one' ? '&user_type=patient' : '';
        const response = await fetch(
          `${API_URL}/users/search/?q=${encodeURIComponent(searchQuery)}${userTypeQuery}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.results || data);
      } catch (error) {
        console.error('Error searching users:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to search users.';
        Alert.alert('Error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce search requests
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchUsers();
      }
    }, 500);
    
    return () => clearTimeout(handler);
  }, [searchQuery, accessToken, conversationType]);
  
  const handleCreateOneToOne = async (userId: number) => {
    if (!accessToken) return;
  
    setIsCreating(true);
    try {
      const result = await ConversationService.createOneToOneConversation(accessToken, userId);
      // Optionally, you can log the conversation id and username here
      // const selectedUser = users.find(user => user.id === userId);
  
      // Instead of calling onConversationCreated, use onCreate to signal success.
      onCreate();
      onClose();
    } catch (error) {
      console.error('Failed to create conversation:', error);
      Alert.alert('Error', 'Failed to create conversation. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleCreateGroup = async () => {
    if (!accessToken || !groupName.trim() || selectedUsers.length === 0) {
      Alert.alert('Error', 'Please enter a group name and select at least one user');
      return;
    }
  
    setIsCreating(true);
    try {
      const participantIds = selectedUsers.map(user => user.id);
      const result = await ConversationService.createGroupConversation(
        accessToken,
        groupName,
        participantIds,
        groupDescription
      );
      // Instead of calling onConversationCreated, use onCreate to signal success.
      onCreate();
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  
  const resetForm = () => {
    setActiveTab('one_to_one');
    setSearchQuery('');
    setSelectedUsers([]);
    setGroupName('');
    setGroupDescription('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {conversationType === 'one_to_one' ? 'New Conversation' : 'New Group'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'one_to_one' && styles.activeTab]}
              onPress={() => setActiveTab('one_to_one')}
            >
              <Text style={[styles.tabText, activeTab === 'one_to_one' && styles.activeTabText]}>
                Direct Message
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'group' && styles.activeTab]}
              onPress={() => setActiveTab('group')}
            >
              <Text style={[styles.tabText, activeTab === 'group' && styles.activeTabText]}>
                Group Chat
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'group' && (
            <View style={styles.groupInfoContainer}>
              <TextInput
                style={styles.input}
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
              />
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Group Description (optional)"
                value={groupDescription}
                onChangeText={setGroupDescription}
                multiline
                numberOfLines={2}
              />
              
              {selectedUsers.length > 0 && (
                <View style={styles.selectedUsersContainer}>
                  <Text style={styles.sectionTitle}>Selected Users ({selectedUsers.length})</Text>
                  <FlatList
                    data={selectedUsers}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.selectedUserChip}
                        onPress={() => toggleUserSelection(item)}
                      >
                        <Text style={styles.selectedUserText}>{item.username}</Text>
                        <Ionicons name="close-circle" size={16} color="#FFF" />
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>
          )}
          
          <TextInput
            style={[styles.input, styles.searchInput]}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          {isLoading ? (
            <ActivityIndicator style={styles.loader} size="large" color="#007BFF" />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id.toString()}
              style={styles.usersList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No users found' : 'Type to search for users'}
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.userItem,
                    activeTab === 'group' && selectedUsers.some(u => u.id === item.id) && styles.selectedUserItem
                  ]}
                  onPress={() => 
                    activeTab === 'one_to_one' 
                      ? handleCreateOneToOne(item.id) 
                      : toggleUserSelection(item)
                  }
                >
                  <View style={styles.userItemContent}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {item.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.userName}>{item.username}</Text>
                  </View>
                  
                  {activeTab === 'group' && selectedUsers.some(u => u.id === item.id) && (
                    <Ionicons name="checkmark-circle" size={24} color="#007BFF" />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
          
          {activeTab === 'group' && (
            <TouchableOpacity 
              style={[
                styles.createButton,
                (!groupName.trim() || selectedUsers.length === 0) && styles.disabledButton
              ]}
              onPress={handleCreateGroup}
              disabled={!groupName.trim() || selectedUsers.length === 0 || isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Create Group</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#007BFF',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 15,
    marginTop: 15,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  searchInput: {
    marginBottom: 10,
  },
  usersList: {
    flex: 1,
    marginHorizontal: 15,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedUserItem: {
    backgroundColor: '#F0F8FF',
  },
  userItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    marginTop: 20,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    margin: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupInfoContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 15,
  },
  selectedUsersContainer: {
    marginHorizontal: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  selectedUserText: {
    color: '#FFFFFF',
    marginRight: 6,
  },
});

export default NewConversationModal;