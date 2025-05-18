import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search } from 'lucide-react-native';
import { UserList } from '../../components/MessagingScreen/UserList';
import { useMessaging } from '../../contexts/MessagingContext';
import { globalStyles } from '../../styles/global';
import { debounce } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { messagingService } from '../../services/messagingService';
import { API_URL } from '../../config';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

interface User {
  id: number;  // Changed from string to number to match the backend
  name: string;
}

export default function NewChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const searchUsers = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setUsers([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const response = await fetch(
          `${API_URL}/users/search/?query=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
            },
          }
        );
        const data = await response.json();
        setUsers(data.filter((u: User) => u.id !== user?.id));
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setSearching(false);
      }
    }, 300),
    [user?.id]
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchUsers(text);
  };

  const handleUserPress = async (selectedUser: { id: string; name: string }) => {
    try {
      const conversation = await messagingService.createOneToOneConversation(
        selectedUser.id
      );
      navigation.replace('Chat', {
        conversationId: conversation.id,
        conversationType: 'one_to_one',  // Added required field
        title: selectedUser.name,
        otherParticipantId: parseInt(selectedUser.id)  // Added optional field
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={globalStyles.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
          autoCapitalize="none"
        />
        {searching && (
          <ActivityIndicator size="small" color={globalStyles.colors.primary} />
        )}
      </View>

      <UserList
        users={users.map(u => ({ ...u, id: u.id.toString() }))}
        onUserPress={handleUserPress}
        loading={searching}
        emptyMessage={
          searchQuery
            ? 'No users found'
            : 'Start typing to search for users'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.backgroundLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: globalStyles.colors.textPrimary,
  },
});