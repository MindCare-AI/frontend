import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  border?: boolean;
}

const Avatar = ({ src, alt, size = 'md', border = false }: AvatarProps) => {
  const [hasError, setHasError] = useState(false);
  
  const sizeValues = {
    sm: 32,
    md: 40,
    lg: 48,
  };
  
  const avatarSize = sizeValues[size];
  const borderWidth = border ? 2 : 0;
  
  const styles = StyleSheet.create({
    container: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: '#D8B4FE', // mindcare-lavender
      overflow: 'hidden',
      borderWidth: borderWidth,
      borderColor: 'white',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    fallbackContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: '#8B5CF6', // mindcare-purple
      justifyContent: 'center',
      alignItems: 'center',
    },
    fallbackText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: size === 'sm' ? 16 : size === 'md' ? 20 : 24,
    }
  });
  
  // Create a fallback avatar with first letter of alt text
  const renderFallback = () => (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>
        {alt.charAt(0).toUpperCase()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {hasError ? (
        renderFallback()
      ) : (
        <Image
          source={{ uri: src }}
          style={styles.image}
          onError={() => setHasError(true)}
        />
      )}
    </View>
  );
};

export default Avatar;