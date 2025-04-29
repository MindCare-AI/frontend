"use client";

import React, { useState } from 'react';
import { Platform, View, Image, Text, StyleSheet, Animated, ActivityIndicator } from "react-native";
import clsx from "clsx";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { globalStyles } from '../../styles/global';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  source?: { uri: string };
  fallback: string;
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  size = 'md', 
  source, 
  fallback,
  style 
}) => {
  const [hasError, setHasError] = useState(!source);

  const getSize = () => {
    switch (size) {
      case 'sm': return 32;
      case 'lg': return 64;
      case 'xl': return 96;
      default: return 48; // md
    }
  };

  const containerSize = getSize();
  
  const styles = StyleSheet.create({
    container: {
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
      overflow: 'hidden',
      backgroundColor: globalStyles.colors.neutralLight,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: globalStyles.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    image: {
      width: '100%',
      height: '100%',
    },
    fallbackContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: globalStyles.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fallbackText: {
      color: globalStyles.colors.white,
      fontWeight: 'bold',
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 24 : size === 'xl' ? 32 : 18,
    }
  });

  return (
    <View style={[styles.container, style]}>
      {!hasError && source ? (
        <Image
          source={source}
          style={styles.image}
          onError={() => setHasError(true)}
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>
            {fallback.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
};

export interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {}

export const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, AvatarImageProps>(
  ({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
      ref={ref}
      className={clsx("aspect-square h-full w-full rounded-full object-cover", className)}
      {...props}
    />
  )
);
AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {}

export const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={clsx(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-sm font-medium",
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = "AvatarFallback";
