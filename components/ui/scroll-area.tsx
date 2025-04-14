"use client";

import React, { useState, useRef } from "react";
import {
  ScrollView,
  View,
  Platform,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

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
  onContentSizeChange?: (w: number, h: number) => void;
  showsScrollIndicator?: boolean;
} & (WebScrollProps | NativeScrollProps);

export const ScrollArea = React.forwardRef<HTMLDivElement | ScrollView, ScrollAreaProps>(
  ({ className = "", style, contentContainerStyle, children, onContentSizeChange, showsScrollIndicator = true, ...props }, ref) => {
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const scrollY = useRef(new Animated.Value(0)).current;
    const thumbHeight = Math.max(
      (containerHeight * containerHeight) / contentHeight,
      40
    );

    const handleLayout = (event: LayoutChangeEvent) => {
      setContainerHeight(event.nativeEvent.layout.height);
    };

    const handleContentSizeChange = (width: number, height: number) => {
      setContentHeight(height);
      onContentSizeChange?.(width, height);
    };

    const scrollIndicatorPosition = scrollY.interpolate({
      inputRange: [0, contentHeight - containerHeight],
      outputRange: [0, containerHeight - thumbHeight],
      extrapolate: "clamp",
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const handleScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { 
        useNativeDriver: true,
        listener: () => {
          // Show scrollbar
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }).start();

          // Hide scrollbar after scrolling stops
          clearTimeout(hideScrollbarTimeout.current);
          hideScrollbarTimeout.current = setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }).start();
          }, 1000);
        },
      }
    );

    const hideScrollbarTimeout = useRef<NodeJS.Timeout>();

    const handleScrollBeginDrag = () => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const handleScrollEndDrag = () => {
      clearTimeout(hideScrollbarTimeout.current);
      hideScrollbarTimeout.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 1000);
    };

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
      <View style={[styles.container, style]} onLayout={handleLayout}>
        <ScrollView
          ref={ref as React.Ref<ScrollView>}
          style={styles.scrollView}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onContentSizeChange={handleContentSizeChange}
          {...(props as NativeScrollProps)}
        >
          {children}
        </ScrollView>
        
        {showsScrollIndicator && containerHeight < contentHeight && (
          <Animated.View
            style={[
              styles.scrollbarTrack,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.scrollbarThumb,
                {
                  height: thumbHeight,
                  transform: [{ translateY: scrollIndicatorPosition }],
                },
              ]}
            />
          </Animated.View>
        )}
      </View>
    );
  }
);

ScrollArea.displayName = "ScrollArea";

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  scrollbarTrack: {
    width: 6,
    height: "100%",
    borderRadius: 3,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginLeft: 2,
    ...Platform.select({
      web: {
        position: "absolute",
        right: 2,
        top: 0,
      },
    }),
  },
  scrollbarThumb: {
    width: "100%",
    borderRadius: 3,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
});