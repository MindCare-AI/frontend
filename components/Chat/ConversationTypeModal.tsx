import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConversationTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: 'group' | 'direct') => void;
}

const ConversationTypeModal: React.FC<ConversationTypeModalProps> = ({
  visible,
  onClose,
  onSelectType,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>New Conversation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>Choose conversation type</Text>
          
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => {
              onSelectType('group');
              onClose();
            }}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="people" size={32} color="#007AFF" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Group</Text>
              <Text style={styles.optionDescription}>
                Create a group conversation with multiple participants
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => {
              onSelectType('direct');
              onClose();
            }}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="person" size={32} color="#007AFF" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Direct</Text>
              <Text style={styles.optionDescription}>
                Start a private conversation with a therapist
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default ConversationTypeModal;
