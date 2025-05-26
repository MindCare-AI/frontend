import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Brain, Heart, Shield, Users } from 'lucide-react-native';
import { gsap } from 'gsap';
import Logo from '../../assets/images/logo_mindcare.svg';

interface WelcomeSlideScreenProps {
  onNext: () => void;
  slide?: number;
  isActive?: boolean;
}

const slides = [
  {
    icon: Brain,
    title: "Welcome to MindCare AI",
    subtitle: "Your Personal Mental Wellness Companion",
    description: "Discover a new way to prioritize your mental health with AI-powered insights and professional support."
  },
  {
    icon: Heart,
    title: "Track Your Journey",
    subtitle: "Monitor Your Mental Wellness",
    description: "Log your moods, journal your thoughts, and track your progress with intelligent analytics."
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    subtitle: "Your Privacy Matters",
    description: "Your mental health data is encrypted and protected with enterprise-level security."
  },
  {
    icon: Users,
    title: "Connect with Professionals",
    subtitle: "Expert Care When You Need It",
    description: "Access verified therapists and schedule appointments that fit your lifestyle."
  }
];

const WelcomeSlideScreen: React.FC<WelcomeSlideScreenProps> = ({ 
  onNext, 
  slide = 0, 
  isActive = true 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconRef = useRef<View>(null);
  const titleRef = useRef<Text>(null);
  const subtitleRef = useRef<Text>(null);
  const descriptionRef = useRef<Text>(null);

  const currentSlide = slides[slide];
  const IconComponent = currentSlide.icon;

  useEffect(() => {
    if (isActive) {
      // GSAP animations for smooth entrance
      const tl = gsap.timeline();
      
      tl.from(iconRef.current, {
        scale: 0,
        rotation: 180,
        duration: 0.8,
        ease: "back.out(1.7)"
      })
      .from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4")
      .from(subtitleRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.3")
      .from(descriptionRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.2");
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>🧠</Text>
          </View>
          <Text style={styles.logoText}>MindCare AI</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome to Your Mental Wellness Journey</Text>
          <Text style={styles.subtitleText}>
            Let's get started with a few simple steps to personalize your experience
          </Text>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Get Started</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoPlaceholderText: {
    fontSize: 48,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002D62',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002D62',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  subtitleText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: '#002D62',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WelcomeSlideScreen;
