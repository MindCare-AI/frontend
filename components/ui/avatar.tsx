"use client";

import * as React from "react";
import { Platform, View, Image, Text, StyleSheet } from "react-native";
import clsx from "clsx";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  // Additional native props:
  nativeSource?: { uri: string } | number; 
  fallback?: string;
  style?: any;
  className?: string;
}

export const Avatar = React.forwardRef<any, AvatarProps>((props, ref) => {
  const { nativeSource, fallback, className, style, children, ...rest } = props;
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
      <View ref={ref} style={[styles.avatar, style]} {...(viewProps as React.ComponentProps<typeof View>)}>
        {nativeSource ? (
          <Image source={nativeSource} style={styles.image} />
        ) : (
          <Text style={styles.fallbackText}>{fallback}</Text>
        )}
        {children}
      </View>
    );
  }
});
Avatar.displayName = "Avatar";

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fallbackText: {
    fontSize: 16,
    color: "#fff",
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
