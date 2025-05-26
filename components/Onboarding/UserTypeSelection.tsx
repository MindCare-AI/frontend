import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Brain, Users } from 'lucide-react-native';

interface UserTypeOption {
  id: "patient" | "therapist";
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface UserTypeSelectionProps {
  onSelect: (userType: "patient" | "therapist") => void;
  onBack: () => void;
}

const userTypes: UserTypeOption[] = [
  {
    id: "patient",
    title: "I'm seeking support",
    description: "Access personalized mental wellness support and resources",
    icon: <Brain size={24} color="#002D62" />,
  },
  {
    id: "therapist",
    title: "I'm a mental health professional",
    description: "Manage your practice and connect with patients digitally",
    icon: <Users size={24} color="#002D62" />,
  },
];

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelect, onBack }) => {
  const [selected, setSelected] = useState<"patient" | "therapist" | null>(null);

  const handleSelect = (type: "patient" | "therapist") => {
    setSelected(type);
    setTimeout(() => onSelect(type), 300);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>How will you be using MindCare?</Text>
        <Text style={styles.subtitle}>
          Choose the option that best describes you to personalize your experience
        </Text>

        <View style={styles.optionsContainer}>
          {userTypes.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSelect(option.id)}
              style={[
                styles.optionButton,
                selected === option.id && styles.selectedOption
              ]}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.iconContainer,
                  selected === option.id && styles.selectedIconContainer
                ]}>
                  {option.icon}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002D62',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#002D62',
    backgroundColor: '#f8f8f8',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#E4F0F6',
  },
  selectedIconContainer: {
    backgroundColor: '#D1E7DD',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002D62',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  backButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#002D62',
  },
  backButtonText: {
    color: '#002D62',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserTypeSelection;