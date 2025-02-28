import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { markOnboardingComplete } from "../../utils/onboarding"; // Fixed import

interface OnboardingStep {
  title: string;
  description: string;
  image: any; // Changed to any for require() image source
}

type OnboardingScreenProps = {
  navigation: NavigationProp<any>;
};

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  const steps: OnboardingStep[] = [
    {
      title: "Welcome to MindCare AI",
      description: "Your AI companion for mental wellbeing and mindfulness",
      image: require('../../assets/images/logo_mindcare.svg'), // Fixed path
    },
    {
      title: "Track Your Mood",
      description: "Log how you're feeling daily to recognize patterns and improve self-awareness",
      image: require('../../assets/images/logo_mindcare.svg'), // Fixed path
    },
    {
      title: "Guided Meditation",
      description: "Access personalized meditation sessions to reduce stress and improve focus",
      image: require('../../assets/images/logo_mindcare.svg'), // Fixed path
    },
    {
      title: "AI-Powered Support",
      description: "Chat with our AI assistant anytime you need someone to talk to",
      image: require('../../assets/images/logo_mindcare.svg'), // Fixed path
    },
  ];

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(currentIndex + 1);
      flatListRef.current?.scrollToIndex({ animated: true, index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Mark onboarding as complete
    markOnboardingComplete();
    // Navigate to Welcome screen after onboarding
    navigation.navigate('Welcome'); // Using navigate instead of replace
  };

  const renderDot = (index: number) => {
    return (
      <View
        key={index}
        style={[
          styles.dot,
          {
            width: index === currentIndex ? 20 : 10,
            backgroundColor: index === currentIndex 
              ? '#002D62' 
              : index < currentIndex 
                ? '#002D6280' 
                : '#CFCFCF',
          }
        ]}
      />
    );
  };

  const renderItem = ({ item }: { item: OnboardingStep }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image 
            source={item.image} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dotsContainer}>
        {steps.map((_, index) => renderDot(index))}
      </View>

      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(_, index) => index.toString()}
      />

      <View style={styles.buttonContainer}>
        {currentIndex < steps.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={handleComplete} style={styles.getStartedButton}>
              <Text style={styles.nextButtonText}>Get Started</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  slide: {
    width,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4A90E280',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002D62',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#002D62',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
  },
  getStartedButton: {
    backgroundColor: '#002D62',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;