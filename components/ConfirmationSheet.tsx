import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react-native';
import { format } from 'date-fns';

interface ConfirmationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  therapist: any;
  date: Date | undefined;
  time: string | null;
  onConfirm: () => void;
  isLoading: boolean;
}

const ConfirmationSheet: React.FC<ConfirmationSheetProps> = ({
  isOpen,
  onClose,
  therapist,
  date,
  time,
  onConfirm,
  isLoading
}) => {
  if (!therapist || !date || !time) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Confirm Appointment</Text>
          </View>
          
          <View style={styles.content}>
            {/* Therapist Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <User size={18} color="#6B7280" />
                <Text style={styles.infoTitle}>Therapist</Text>
              </View>
              <View style={styles.therapistInfo}>
                <Image 
                  source={{ uri: therapist.image }}
                  style={styles.therapistImage}
                />
                <View>
                  <Text style={styles.therapistName}>{therapist.name}</Text>
                  <Text style={styles.therapistSpecialty}>{therapist.specialty}</Text>
                </View>
              </View>
            </View>
            
            {/* Date Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <CalendarIcon size={18} color="#6B7280" />
                <Text style={styles.infoTitle}>Date</Text>
              </View>
              <Text style={styles.infoText}>
                {format(date, 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
            
            {/* Time Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Clock size={18} color="#6B7280" />
                <Text style={styles.infoTitle}>Time</Text>
              </View>
              <Text style={styles.infoText}>{time}</Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              <Text style={styles.confirmButtonText}>
                {isLoading ? 'Processing...' : 'Confirm Booking'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  therapistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  therapistImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  therapistSpecialty: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoText: {
    fontSize: 16,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: 'black',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ConfirmationSheet;