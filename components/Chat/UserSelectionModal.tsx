import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_USERS } from '../../data/tunisianMockData';

export interface User {
  id: string | number;
  username: string; // Made required
  email?: string;
  full_name?: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
  user_type?: 'patient' | 'therapist';
  is_verified?: boolean;
}

interface UserSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  conversationType?: 'group' | 'direct';
  onCreateConversation?: (
    selectedUsers: User[],
    groupName?: string,
    groupDescription?: string
  ) => Promise<void>;
  users?: any[];
  loading?: boolean;
  onSelectUsers?: (selectedUsers: any[]) => Promise<void>;
  multiSelect?: boolean;
  title?: string;
  subtitle?: string;
  currentUserId?: string | number;
  creating?: boolean;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  visible,
  onClose,
  conversationType,
  onCreateConversation,
  currentUserId,
  creating = false,
  loading = false,
  users: initialUsers = [],
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  // Effect for handling visibility changes
  useEffect(() => {
    if (!visible) {
      // Reset state when modal closes
      setSelectedUsers([]);
      setGroupName('');
      setGroupDescription('');
    }
  }, [visible]);

  // Separate effect for handling initialUsers updates
  useEffect(() => {
    // If no initial users provided, use mock users
    const usersToFilter = initialUsers.length > 0 ? initialUsers : MOCK_USERS;
    
    // Only update users if the filtered result would be different
    const filteredUsers = usersToFilter.filter((user: User) => 
      user.id !== currentUserId && String(user.id) !== String(currentUserId)
    );
    // Remove duplicates based on user ID
    const uniqueUsers = filteredUsers.reduce((acc: User[], user: User) => {
      if (!acc.find(u => String(u.id) === String(user.id))) {
        acc.push(user);
      }
      return acc;
    }, []);
    // Use JSON stringify for deep comparison
    if (JSON.stringify(users) !== JSON.stringify(uniqueUsers)) {
      setUsers(uniqueUsers);
    }
  }, [initialUsers, currentUserId, users]);

  const handleUserToggle = (user: User) => {
    if (conversationType === 'direct') {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers(prev => {
        // Use string comparison to ensure proper matching
        const isSelected = prev.find(u => String(u.id) === String(user.id));
        if (isSelected) {
          return prev.filter(u => String(u.id) !== String(user.id));
        } else {
          return [...prev, user];
        }
      });
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one user');
      return;
    }

    if (conversationType === 'group' && !groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      if (conversationType === 'group') {
        const participantIds = selectedUsers.map(user => user.id);
        const trimmedName = groupName.trim();
        const trimmedDesc = groupDescription.trim();
        console.log('[UserSelectionModal] Creating group with:', {
          name: trimmedName,
          description: trimmedDesc,
          participants: participantIds,
        });
        
        // Mock group creation - simulate success
        const mockResponse = {
          id: `group_${Date.now()}`,
          name: trimmedName,
          description: trimmedDesc || "",
          participants: participantIds,
          created_at: new Date().toISOString()
        };

        if (onCreateConversation) {
          await onCreateConversation(selectedUsers, trimmedName, trimmedDesc);
        }

        // Close modal after successful creation
        onClose();
      } else if (onCreateConversation) {
        await onCreateConversation(selectedUsers, groupName, groupDescription);
        // Close modal after successful creation
        onClose();
      }
    } catch (error: any) {
      console.error('[UserSelectionModal] Error creating conversation:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create conversation';
      Alert.alert('Error', errorMessage);
    }
  };

  const canCreate = selectedUsers.length > 0 && 
    (conversationType === 'direct' || (conversationType === 'group' && groupName.trim()));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {conversationType === 'direct' ? 'Select User' : 'Create Group'}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={creating}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {conversationType === 'group' && (
            <View style={styles.groupForm}>
              <TextInput
                style={styles.input}
                placeholder="Group name"
                value={groupName}
                onChangeText={setGroupName}
                editable={!creating}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Group description (optional)"
                value={groupDescription}
                onChangeText={setGroupDescription}
                multiline
                numberOfLines={3}
                editable={!creating}
              />
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text>Loading users...</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item, index) => `user_${String(item.id || index)}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.userItem,
                    selectedUsers.find(u => String(u.id) === String(item.id)) && styles.selectedUser
                  ]}
                  onPress={() => handleUserToggle(item)}
                  disabled={creating}
                >
                  <Text style={styles.userName}>
                    {item.user_name || item.full_name || item.username || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown User'}
                  </Text>
                  <Text style={styles.userType}>{item.user_type}</Text>
                  {selectedUsers.find(u => String(u.id) === String(item.id)) && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.userList}
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={creating}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                (!canCreate || creating) && styles.disabledButton
              ]}
              onPress={handleCreate}
              disabled={!canCreate || creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>
                  {conversationType === 'direct' ? 'Start Chat' : 'Create Group'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  groupForm: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  userList: {
    maxHeight: 300,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedUser: {
    backgroundColor: '#E3F2FD',
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  userType: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default UserSelectionModal;
