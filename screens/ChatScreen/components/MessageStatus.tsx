//screens/ChatScreen/components/MessageStatus.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read' | 'failed' | undefined;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
  if (!status || status === 'failed') {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Icon 
        name={status === 'read' ? 'checkmark-done' : 'checkmark'} 
        size={16} 
        color={status === 'read' ? '#4CD964' : '#8E8E93'} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
  },
});

export default MessageStatus;