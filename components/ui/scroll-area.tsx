"use client";

import React from "react";
import { Platform, ScrollView, ScrollViewProps, StyleSheet } from "react-native";

// Define common props
type CommonProps = {
  className?: string;
  style?: any;
  contentContainerStyle?: any;
};

// Native props including scroll events
type NativeScrollProps = ScrollViewProps & CommonProps & {
  scrollEventThrottle?: number;
  onMomentumScrollEnd?: () => void;
};

// Web props excluding native-specific properties
type WebScrollProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> & CommonProps;

// Union type for the component props
type ScrollAreaProps = {
  children: React.ReactNode;
  onContentSizeChange?: () => void;
} & (WebScrollProps | NativeScrollProps);

export const ScrollArea = React.forwardRef<HTMLDivElement | ScrollView, ScrollAreaProps>(
  ({ className = "", style, contentContainerStyle, children, onContentSizeChange, ...props }, ref) => {
    if (Platform.OS === "web") {
      // On web, filter out native-specific props
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={`overflow-y-auto ${className}`}
          style={{ ...webStyles.scrollArea, ...style }}
          {...(props as WebScrollProps)}
        >
          <div style={{ ...webStyles.content, ...contentContainerStyle }}>
            {children}
          </div>
        </div>
      );
    }

    // On native, use all props
    return (
      <ScrollView
        ref={ref as React.Ref<ScrollView>}
        style={[nativeStyles.scrollArea, style]}
        contentContainerStyle={[nativeStyles.content, contentContainerStyle]}
        onContentSizeChange={onContentSizeChange}
        {...(props as NativeScrollProps)}
      >
        {children}
      </ScrollView>
    );
  }
);

const webStyles = {
  scrollArea: {
    height: '100%',
    width: '100%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Using boxShadow instead of shadowColor
  } as const,
  content: {
    minHeight: '100%',
  } as const,
};

const nativeStyles = StyleSheet.create({
  scrollArea: {
    flex: 1,
    width: '100%',
    // Native shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexGrow: 1,
  },
});

ScrollArea.displayName = "ScrollArea";