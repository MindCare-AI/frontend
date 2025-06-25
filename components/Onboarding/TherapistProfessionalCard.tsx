import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

interface TherapistProfessionalCardProps {
  onNext: () => void
  onBack: () => void
}

const TherapistProfessionalCard: React.FC<TherapistProfessionalCardProps> = ({
  onNext,
  onBack,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>Professional Card Verification</Text>
    <Text style={styles.body}>
      Please confirm your professional card details or upload a photo of your
      professional card to proceed.
    </Text>
    <View style={styles.buttons}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onNext} style={styles.nextButton}>
        <Text style={styles.nextText}>Continue</Text>
      </TouchableOpacity>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E4F0F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#002D62',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#002D62',
    borderRadius: 8,
  },
  backText: {
    color: '#002D62',
    fontSize: 16,
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  nextText: {
    color: '#FFF',
    fontSize: 16,
  },
})

export default TherapistProfessionalCard