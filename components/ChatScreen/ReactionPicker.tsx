import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ReactionPickerProps {
  onSelect: (reaction: string) => void;
  onClose: () => void;
}

// Enhanced emoji mapping with more modern and consistent reactions
const REACTION_MAP: { [key: string]: string } = {
  like: '👍',
  heart: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠'
};

const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, onClose }) => {
  // Animation values for container and each reaction
  const containerAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = Object.keys(REACTION_MAP).map(() => useRef(new Animated.Value(0)).current);
  
  useEffect(() => {
    // Animate container appearance
    Animated.spring(containerAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
    
    // Animate each reaction with staggered timing
    Animated.stagger(
      50,
      scaleAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);
  
  const handleReactionSelect = (reaction: string) => {
    // Provide haptic feedback on reaction selection
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate out
    Animated.parallel([
      Animated.timing(containerAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      ...scaleAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ),
    ]).start(() => {
      onSelect(reaction);
    });
  };
  
  const handleClose = () => {
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate container disappearance
    Animated.parallel([
      Animated.timing(containerAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      ...scaleAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: containerAnim,
          transform: [
            { scale: containerAnim },
            { translateY: containerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              })
            }
          ]
        }
      ]}
    >
      <View style={styles.reactionsRow}>
        {Object.entries(REACTION_MAP).map(([key, emoji], index) => (
          <Animated.View
            key={key}
            style={{
              opacity: scaleAnims[index],
              transform: [
                { scale: scaleAnims[index] },
                { translateY: scaleAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  })
                }
              ]
            }}
          >
            <TouchableOpacity 
              style={styles.reactionButton}
              onPress={() => handleReactionSelect(key)}
              activeOpacity={0.7}
            >
              <Text style={styles.reactionText}>{emoji}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={handleClose}
        activeOpacity={0.7}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 3px 10px rgba(0,0,0,0.16)',
      },
    }),
  },
  reactionsRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  reactionButton: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: 'transparent',
    marginHorizontal: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
    }),
  },
  reactionText: {
    fontSize: 22,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 12,
  }
});

export default ReactionPicker;