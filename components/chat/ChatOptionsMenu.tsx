import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onSearch: () => void;
  onClearHistory: () => void;
  onMute: () => void;
  onBlock?: () => void;
  isGroupChat: boolean;
  onViewParticipants?: () => void;
  onLeaveGroup?: () => void;
}

const ChatOptionsMenu: React.FC<ChatOptionsMenuProps> = ({
  visible,
  onClose,
  onSearch,
  onClearHistory,
  onMute,
  onBlock,
  isGroupChat,
  onViewParticipants,
  onLeaveGroup
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <View style={styles.handle} />
          
          <TouchableOpacity style={styles.menuItem} onPress={onSearch}>
            <Ionicons name="search" size={24} color="#007BFF" />
            <Text style={styles.menuText}>Search in Conversation</Text>
          </TouchableOpacity>
          
          {isGroupChat && (
            <TouchableOpacity style={styles.menuItem} onPress={onViewParticipants}>
              <Ionicons name="people" size={24} color="#007BFF" />
              <Text style={styles.menuText}>View Participants</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.menuItem} onPress={onMute}>
            <Ionicons name="notifications-off" size={24} color="#007BFF" />
            <Text style={styles.menuText}>Mute Notifications</Text>
          </TouchableOpacity>
          
          {!isGroupChat && (
            <TouchableOpacity style={styles.menuItem} onPress={onBlock}>
              <Ionicons name="ban" size={24} color="#FF3B30" />
              <Text style={styles.menuText}>Block User</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.menuItem} onPress={onClearHistory}>
            <Ionicons name="trash" size={24} color="#FF3B30" />
            <Text style={styles.menuText}>Clear Chat History</Text>
          </TouchableOpacity>
          
          {isGroupChat && (
            <TouchableOpacity style={styles.menuItem} onPress={onLeaveGroup}>
              <Ionicons name="exit" size={24} color="#FF3B30" />
              <Text style={styles.menuText}>Leave Group</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
});

export default ChatOptionsMenu;