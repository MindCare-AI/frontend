// screens/ChatScreen/components/EditHistoryModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatTime } from '../../../utils/helpers';

interface EditHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  history: Array<{
    content: string;
    edited_at: string;
    edited_by: {
      id: string;
      name: string;
    };
  }>;
  currentContent: string;
}

const EditHistoryModal: React.FC<EditHistoryModalProps> = ({
  visible,
  onClose,
  history,
  currentContent,
}) => {
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyContent}>{item.content}</Text>
      <View style={styles.historyFooter}>
        <Text style={styles.editedBy}>{item.edited_by?.name || 'Unknown'}</Text>
        <Text style={styles.editedAt}>{formatTime(item.edited_at)}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit History</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.currentVersion}>
            <Text style={styles.currentLabel}>Current Version:</Text>
            <Text style={styles.currentContent}>{currentContent}</Text>
          </View>

          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.historyList}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  currentVersion: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  currentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  currentContent: {
    fontSize: 16,
    color: '#333',
  },
  historyList: {
    paddingBottom: 16,
  },
  historyItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editedBy: {
    fontSize: 12,
    color: '#666',
  },
  editedAt: {
    fontSize: 12,
    color: '#999',
  },
});

export default EditHistoryModal;