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
}

const userTypes: UserTypeOption[] = [
  {
    id: "patient",
    title: "I'm a Patient",
    description: "Access personalized mental wellness support and resources",
    icon: <Brain size={24} color="#000" />,
  },
  {
    id: "therapist",
    title: "I'm a Therapist",
    description: "Manage your practice and connect with patients digitally",
    icon: <Users size={24} color="#000" />,
  },
];

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<"patient" | "therapist" | null>(null);

  const handleSelect = (type: "patient" | "therapist") => {
    setSelected(type);
    setTimeout(() => onSelect(type), 300);
  };

  return (
    <View style={styles.container}>
      {userTypes.map((option, index) => (
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
              <Text style={styles.title}>{option.title}</Text>
              <Text style={styles.description}>{option.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  optionButton: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#000',
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
    backgroundColor: '#eee',
  },
  selectedIconContainer: {
    backgroundColor: '#e0e0e0',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default UserTypeSelection;