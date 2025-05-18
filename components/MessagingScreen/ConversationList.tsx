import React from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import { Conversation } from '../../types/messaging';
import { ConversationItem } from './ConversationItem';
import { globalStyles } from '../../styles/global';

interface ConversationListProps {
  conversations: Conversation[];
  onConversationPress: (conversation: Conversation) => void;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ConversationList({
  conversations,
  onConversationPress,
  onEndReached,
  refreshing = false,
  onRefresh,
}: ConversationListProps) {
  const renderItem = ({ item }: ListRenderItemInfo<Conversation>) => (
    <ConversationItem
      conversation={item}
      onPress={() => onConversationPress(item)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[globalStyles.colors.primary]}
            tintColor={globalStyles.colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.backgroundLight,
  },
  listContent: {
    flexGrow: 1,
  },
});