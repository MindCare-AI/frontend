import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Heart, Brain, Users, Target } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

interface WellnessGoal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface PatientWellnessGoalsProps {
  onNext: () => void;
  onBack: () => void;
}

const wellnessGoals: WellnessGoal[] = [
  {
    id: 'anxiety_management',
    title: 'Manage Anxiety',
    description: 'Learn coping strategies and techniques to reduce anxiety',
    icon: <Brain size={24} />,
  },
  {
    id: 'depression_support',
    title: 'Depression Support',
    description: 'Get support and tools to manage depressive episodes',
    icon: <Heart size={24} />,
  },
  {
    id: 'stress_reduction',
    title: 'Stress Reduction',
    description: 'Develop healthy stress management techniques',
    icon: <Target size={24} />,
  },
  {
    id: 'relationship_improvement',
    title: 'Improve Relationships',
    description: 'Enhance communication and relationship skills',
    icon: <Users size={24} />,
  },
];

const PatientWellnessGoals: React.FC<PatientWellnessGoalsProps> = ({ onNext, onBack }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const markOnboardingComplete = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      throw error;
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      // Save selected goals to storage or send to API
      if (selectedGoals.length > 0) {
        await AsyncStorage.setItem('wellness_goals', JSON.stringify(selectedGoals));
      }

      // Mark onboarding as complete
      await markOnboardingComplete();

      // Navigate to the main app
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'App' as never }],
        })
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Fallback to onNext if navigation fails
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What are your wellness goals?</Text>
        <Text style={styles.subtitle}>
          Select the areas where you'd like support. This helps us understand your journey.
        </Text>

        <View style={styles.goalsContainer}>
          {wellnessGoals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoals.includes(goal.id) && styles.selectedGoal
              ]}
              onPress={() => toggleGoal(goal.id)}
            >
              <View style={styles.goalContent}>
                <View style={[
                  styles.iconContainer,
                  selectedGoals.includes(goal.id) && styles.selectedIconContainer
                ]}>
                  {goal.icon}
                </View>
                <View style={styles.goalText}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.nextButton, isLoading && styles.disabledButton]} 
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? 'Completing...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  content: {
    padding: 30,
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
  goalsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGoal: {
    borderColor: '#002D62',
    backgroundColor: '#f8f8f8',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  goalText: {
    flex: 1,
    gap: 4,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002D62',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  backButton: {
    flex: 1,
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
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#002D62',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
});

export default PatientWellnessGoals;
