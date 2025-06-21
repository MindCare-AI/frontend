import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Brain, Stethoscope, ArrowRight } from 'lucide-react-native';
import { gsap } from 'gsap';

interface UserTypeSelectionProps {
  onSelect: (userType: "patient" | "therapist") => void;
  onNext: () => void;
}

const EnhancedUserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelect, onNext }) => {
  const [selected, setSelected] = useState<"patient" | "therapist" | null>(null);
  const patientRef = useRef<View>(null);
  const therapistRef = useRef<View>(null);
  const nextButtonRef = useRef<View>(null);

  useEffect(() => {
    // Entrance animations
    const tl = gsap.timeline();
    
    tl.from([patientRef.current, therapistRef.current], {
      scale: 0.8,
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.2,
      ease: "back.out(1.7)"
    });
  }, []);

  const handleSelect = (type: "patient" | "therapist") => {
    setSelected(type);
    onSelect(type);
    
    // Animate selection
    gsap.to(type === "patient" ? patientRef.current : therapistRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
    
    gsap.to(type === "patient" ? therapistRef.current : patientRef.current, {
      scale: 0.95,
      opacity: 0.6,
      duration: 0.3,
      ease: "power2.out"
    });

    // Show next button
    gsap.from(nextButtonRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      delay: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What brings you to MindCare?</Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          ref={patientRef}
          onPress={() => handleSelect("patient")}
          style={[
            styles.optionCard,
            selected === "patient" && styles.selectedCard
          ]}
        >
          <View style={styles.iconContainer}>
            <Brain size={48} />
          </View>
          <Text style={[styles.optionTitle, selected === "patient" && styles.selectedText]}>
            I'm seeking support
          </Text>
          <Text style={[styles.optionDescription, selected === "patient" && styles.selectedDescription]}>
            Access mental wellness tools, track your journey, and connect with professionals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          ref={therapistRef}
          onPress={() => handleSelect("therapist")}
          style={[
            styles.optionCard,
            selected === "therapist" && styles.selectedCard
          ]}
        >
          <View style={styles.iconContainer}>
            <Stethoscope size={48} />
          </View>
          <Text style={[styles.optionTitle, selected === "therapist" && styles.selectedText]}>
            I'm a mental health professional
          </Text>
          <Text style={[styles.optionDescription, selected === "therapist" && styles.selectedDescription]}>
            Manage your practice, connect with patients, and provide care digitally
          </Text>
        </TouchableOpacity>
      </View>

      {selected && (
        <TouchableOpacity
          ref={nextButtonRef}
          onPress={onNext}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <ArrowRight size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002D62',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 40,
  },
  optionCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#002D62',
    borderColor: '#4A90A4',
  },
  iconContainer: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002D62',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedText: {
    color: '#fff',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedDescription: {
    color: '#E4F0F6',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90A4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnhancedUserTypeSelection;
