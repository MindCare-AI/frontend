//screens/MessagingScreen/MessagingScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, SectionList, Text, Alert, StatusBar, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator'; // Adjust path as needed
import useConversations from '../../hooks/MessagingScreen/useConversations';
import ConversationItem from '../../components/MessagingScreen/ConversationItem';
import SearchBar from '../../components/MessagingScreen/SearchBar';
import NewChatButton from '../../components/MessagingScreen/NewChatButton';
import { LoadingIndicator, ErrorMessage } from '../../components/ui';
import { API_URL } from '../../config'; // Ensure correct API_URL
import { useAuth } from '../../contexts/AuthContext';
import TypingIndicator from '../../components/ChatScreen/TypingIndicator';
import { globalStyles } from '../../styles/global';

type MessagingScreenNavigationProp = StackNavigationProp<MessagingStackParamList, 'Messaging'>;

interface Props {
  navigation: MessagingScreenNavigationProp;
}

interface TypingIndicatorProps {
  visible: boolean;
  conversationId: string;
}

const MessagingScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { accessToken } = useAuth();
  const { conversations, loading, error, searchQuery, handleSearch, loadMore, refresh, typingIndicators } = useConversations();
  
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const createNewConversation = async () => {
    try {
      const response = await fetch(`${API_URL}/messaging/one_to_one/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      const data = await response.json();
      return data.id.toString();
    } catch (error) {
      console.error('Create conversation error:', error);
      Alert.alert('Error', 'Could not create conversation');
      return null;
    }
  };

  return (
    <Animated.View style={[{ 
      flex: 1,
      backgroundColor: globalStyles.colors.background,
      }, { opacity: fadeAnim }]}
    >
      <StatusBar 
        backgroundColor={globalStyles.colors.primary} 
        barStyle="light-content" 
      />
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      
      {error && <ErrorMessage message="Failed to load conversations" onRetry={refresh} />}
      
      {loading && conversations.length === 0 ? (
        <LoadingIndicator />
      ) : (
        <SectionList
          sections={[
            { 
              title: 'Direct Messages', 
              data: conversations.filter(c => c.conversation_type === 'one_to_one') 
            },
            { 
              title: 'Group Chats', 
              data: conversations.filter(c => c.conversation_type === 'group') 
            }
          ]}
          renderItem={({ item }) => (
            <ConversationItem 
              conversation={{
                ...item,
                lastMessage: item.lastMessage || '',
                timestamp: item.timestamp || '',
                unreadCount: item.unreadCount ?? 0,
              }}
              onPress={() => navigation.navigate('Chat', {
                conversationId: String(item.id),
                conversationType: (item.conversation_type === 'direct' || item.conversation_type === 'chatbot')
                  ? 'one_to_one'
                  : item.conversation_type,
                title: item.name || item.otherParticipant?.name || 'Chat',
              })}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={{
              backgroundColor: globalStyles.colors.background,
              paddingVertical: globalStyles.spacing.sm,
              paddingHorizontal: globalStyles.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: globalStyles.colors.border,
              marginTop: globalStyles.spacing.xs,
              marginBottom: globalStyles.spacing.xxs,
              borderRadius: globalStyles.spacing.xs,
              shadowColor: globalStyles.colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <Text style={{
                ...globalStyles.caption,
                color: globalStyles.colors.primary,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}>{section.title}</Text>
            </View>
          )}
          onEndReached={loadMore}
          onRefresh={refresh}
          refreshing={loading}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{
                ...globalStyles.title3,
                color: globalStyles.colors.textPrimary,
                marginBottom: globalStyles.spacing.sm,
              }}>No conversations yet</Text>
              <Text style={{
                ...globalStyles.body,
                color: globalStyles.colors.textSecondary,
                textAlign: 'center',
                lineHeight: 24,
                maxWidth: '80%',
              }}>
                Start a new chat to begin messaging</Text>
            </View>
          }
        />
      )}
      
      {typingIndicators && (
        <TypingIndicator 
          visible={typingIndicators.length > 0} 
          conversationId={conversations[0]?.id || ''} 
        />
      )}
      
      <NewChatButton
        onPress={async () => {
          const newId = await createNewConversation();
          if (newId) {
            navigation.navigate('Chat', {
              conversationId: newId,
              conversationType: 'one_to_one',
              title: 'New Chat',
            });
          }
        }}
      />
    </Animated.View>
  );
};

const styles = {
  listContent: {
    padding: globalStyles.spacing.md,
    paddingBottom: globalStyles.spacing.xxl * 2.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: globalStyles.spacing.xl,
    marginTop: globalStyles.spacing.xxl,
  },
};

export default MessagingScreen;
