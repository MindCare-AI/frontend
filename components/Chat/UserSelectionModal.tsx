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
import { getAllUsers } from '../../API/conversations';

interface User {
  id: string | number;
  username: string;
  email?: string;
  full_name?: string;
  user_type?: 'patient' | 'therapist';
}

interface UserSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  conversationType: 'group' | 'direct';
  onCreateConversation: (
    selectedUsers: User[],
    groupName?: string,
    groupDescription?: string
  ) => Promise<void>;
  currentUserId: string | number;
  creating?: boolean;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  visible,
  onClose,
  conversationType,
  onCreateConversation,
  currentUserId,
  creating = false,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  useEffect(() => {
    if (visible) {
      loadUsers();
    } else {
      // Reset state when modal closes
      setSelectedUsers([]);
      setGroupName('');
      setGroupDescription('');
    }
  }, [visible]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      // Filter out current user
      const filteredUsers = response.filter((user: User) => user.id !== currentUserId);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (user: User) => {
    if (conversationType === 'direct') {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers(prev => {
        const isSelected = prev.find(u => u.id === user.id);
        if (isSelected) {
          return prev.filter(u => u.id !== user.id);
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
      await onCreateConversation(selectedUsers, groupName, groupDescription);
    } catch (error) {
      // Error handling is done in parent component
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
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.userItem,
                    selectedUsers.find(u => u.id === item.id) && styles.selectedUser
                  ]}
                  onPress={() => handleUserToggle(item)}
                  disabled={creating}
                >
                  <Text style={styles.userName}>{item.username}</Text>
                  <Text style={styles.userType}>{item.user_type}</Text>
                  {selectedUsers.find(u => u.id === item.id) && (
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
