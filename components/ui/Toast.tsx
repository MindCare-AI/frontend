import React, { useEffect, useRef } from "react";
import {
  Provider as ToastProvider,
  Viewport as ToastViewportPrimitive,
  Root as ToastPrimitive,
  Title as ToastTitlePrimitive,
  Description as ToastDescriptionPrimitive,
  Action as ToastActionPrimitive,
  Close as ToastClosePrimitive,
} from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { View, Text, TouchableOpacity, Animated, StyleSheet, AccessibilityInfo, Platform } from "react-native";
import { X, Check, AlertCircle, Info } from "lucide-react-native";
import * as Haptics from 'expo-haptics';
import { cn } from "../../lib/utils";

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastViewportPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastViewportPrimitive>
>(({ className, ...props }, ref) => (
  <ToastViewportPrimitive
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastViewportPrimitive.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
        success: "border-green-500 bg-green-50 text-green-900",
        error: "border-red-500 bg-red-50 text-red-900",
        info: "border-blue-500 bg-blue-50 text-blue-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Define ToastActionElement with the necessary properties
interface ToastActionElement {
  label: string;
  onPress: () => void;
}

// Define ToastProps type
type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitive> & 
  VariantProps<typeof toastVariants> & {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastActionElement;
    onDismiss?: () => void;
  };

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive>,
  ToastProps
>(({ className, variant, title, description, action, onDismiss, ...props }, ref) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Trigger haptic feedback based on variant
    if (Platform.OS !== 'web') {
      switch (variant) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    // Announce for screen readers
    const announcement = title 
      ? `${title.toString()}: ${description?.toString()}` 
      : description?.toString() || '';
    AccessibilityInfo.announceForAccessibility(announcement);

    // Show animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress animation
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Auto hide
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <Check size={20} color="#059669" />;
      case 'error':
        return <AlertCircle size={20} color="#DC2626" />;
      case 'info':
        return <Info size={20} color="#2563EB" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return '#ECFDF5';
      case 'error':
        return '#FEF2F2';
      case 'info':
        return '#EFF6FF';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBackgroundColor(),
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={title 
        ? `${title?.toString() || ''}: ${description?.toString() || ''}` 
        : description?.toString() || ''}
    >
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.textContainer}>
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
          <Text style={styles.message} numberOfLines={2}>
            {description}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <X size={20} color={variant === "destructive" ? "#fff" : "#000"} />
        </TouchableOpacity>
      </View>

      {action && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});
Toast.displayName = ToastPrimitive.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastActionPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastActionPrimitive>
>(({ className, ...props }, ref) => (
  <ToastActionPrimitive
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastActionPrimitive.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastClosePrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastClosePrimitive>
>(({ className, ...props }, ref) => (
  <ToastClosePrimitive
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X size={16} />
  </ToastClosePrimitive>
));
ToastClose.displayName = ToastClosePrimitive.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastTitlePrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastTitlePrimitive>
>(({ className, ...props }, ref) => (
  <ToastTitlePrimitive
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastTitlePrimitive.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastDescriptionPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastDescriptionPrimitive>
>(({ className, ...props }, ref) => (
  <ToastDescriptionPrimitive
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastDescriptionPrimitive.displayName;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#002D62',
    opacity: 0.2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
  },
  closeButton: {
    padding: 4,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#002D62',
    textAlign: 'center',
  },
});

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};