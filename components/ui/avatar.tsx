"use client";

import * as React from "react";
import { Platform, View, Image, Text, StyleSheet, Animated, ActivityIndicator } from "react-native";
import clsx from "clsx";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  // Additional native props:
  nativeSource?: { uri: string } | number; 
  fallback?: string;
  style?: any;
  className?: string;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = React.forwardRef<any, AvatarProps>((props, ref) => {
  const { nativeSource, fallback, className, style, children, src, alt, size = 'md', ...rest } = props;
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleLoad = () => {
    setIsLoading(false);
    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 64;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 24;
      case 'xl':
        return 32;
      default:
        return 18;
    }
  };

  const containerSize = getSize();
  const fontSize = getFontSize();

  const getFallbackText = () => {
    if (fallback) return fallback;
    if (alt) {
      return alt
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return '?';
  };

  if (Platform.OS === "web") {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={clsx("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
        style={style}
        {...rest}
      >
        {children}
      </AvatarPrimitive.Root>
    );
  } else {
    // Remove web-specific props before passing to the native View.
    const { tabIndex, onTouchStart, onTouchEnd, onTouchCancel, ...viewProps } = rest as any;
    return (
      <Animated.View
        ref={ref}
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
          },
          style,
        ]}
        accessibilityRole="image"
        accessibilityLabel={alt}
        {...(viewProps as React.ComponentProps<typeof View>)}
      >
        {src && !hasError ? (
          <>
            <Animated.Image
              source={{ uri: src }}
              style={[
                styles.image,
                {
                  width: containerSize,
                  height: containerSize,
                  opacity: fadeAnim,
                },
              ]}
              onLoad={handleLoad}
              onError={handleError}
            />
            {isLoading && (
              <View style={[styles.loadingContainer, { borderRadius: containerSize / 2 }]}>
                <ActivityIndicator size="small" color="#002D62" />
              </View>
            )}
          </>
        ) : (
          <View
            style={[
              styles.fallback,
              {
                width: containerSize,
                height: containerSize,
                borderRadius: containerSize / 2,
              },
            ]}
          >
            <Text
              style={[
                styles.fallbackText,
                {
                  fontSize,
                },
              ]}
              numberOfLines={1}
            >
              {getFallbackText()}
            </Text>
          </View>
        )}
        {children}
      </Animated.View>
    );
  }
});
Avatar.displayName = "Avatar";

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    backgroundColor: '#E4F0F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#002D62',
    fontWeight: '600',
  },
});

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
