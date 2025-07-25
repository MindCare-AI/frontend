import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Brain, Users, ArrowRight } from 'lucide-react-native';

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
    icon: <Brain size={24} />,
  },
  {
    id: "therapist",
    title: "I'm a mental health professional",
    description: "Manage your practice and connect with patients digitally",
    icon: <Users size={24} />,
  },
];

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelect, onBack }) => {
  const [selected, setSelected] = useState<"patient" | "therapist" | null>(null);

  const handleSelect = (type: "patient" | "therapist") => {
    setSelected(type);
  };

  const handleNext = () => {
    if (selected) {
      // Directly pass the selected type to the parent component
      onSelect(selected);
    }
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

        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.disabledButton]}
          disabled={!selected}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <ArrowRight size={20} />
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
    marginBottom: 40,
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
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#002D62',
    paddingVertical: 16,
    borderRadius: 10,
    gap: 10,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#9FB1C7',
    opacity: 0.7,
  },
});

export default UserTypeSelection;