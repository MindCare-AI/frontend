import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createShadow } from '../../styles/global';

interface ChatHeaderProps {
  title: string;
  isGroup?: boolean;
  isConnected?: boolean;
  onBack: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  isGroup = false,
  isConnected = false,
  onBack,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    ...createShadow(4, '#000', 0.1),
  },
  backButton: {
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  moreButton: {
    marginLeft: 16,
  },
});

export default ChatHeader;
