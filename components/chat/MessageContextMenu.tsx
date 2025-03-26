import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageContextMenuProps {
  visible: boolean;
  onClose: () => void;
  isCurrentUserMessage: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReact?: () => void;
  onCopy?: () => void;
  onForward?: () => void;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  visible,
  onClose,
  isCurrentUserMessage,
  onEdit,
  onDelete,
  onReact,
  onCopy,
  onForward
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          {isCurrentUserMessage && (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
                <Ionicons name="pencil" size={22} color="#007BFF" />
                <Text style={styles.menuText}>Edit Message</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
                <Ionicons name="trash" size={22} color="#FF3B30" />
                <Text style={styles.menuText}>Delete Message</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
            </>
          )}
          
          <TouchableOpacity style={styles.menuItem} onPress={onReact}>
            <Ionicons name="happy" size={22} color="#007BFF" />
            <Text style={styles.menuText}>Add Reaction</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={onCopy}>
            <Ionicons name="copy" size={22} color="#007BFF" />
            <Text style={styles.menuText}>Copy Text</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={onForward}>
            <Ionicons name="arrow-redo" size={22} color="#007BFF" />
            <Text style={styles.menuText}>Forward</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 300,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 4,
  }
});

export default MessageContextMenu;