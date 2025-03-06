"use client";

import React from "react";
import { Platform, View, ViewProps, StyleSheet } from "react-native";

// Define native props.
type NativeCardProps = {
  children: React.ReactNode;
  style?: any;
} & ViewProps;

// Define web props.
type WebCardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

// Union type for Card.
export type CardProps = NativeCardProps | WebCardProps;

export function Card({ children, style, ...props }: CardProps) {
  if (Platform.OS === "web") {
    const { className = "", ...rest } = props as WebCardProps;
    return (
      <div
        className={`bg-white shadow rounded-lg ${className}`}
        style={style as React.CSSProperties}
        {...rest}
      >
        {children}
      </div>
    );
  } else {
    return (
      <View style={[styles.card, style]} {...(props as NativeCardProps)}>
        {children}
      </View>
    );
  }
}

// Define CardContentProps explicitly to ensure required properties are present.
type CardContentProps = {
  children: React.ReactNode;
  style?: any;
  className?: string;
} & (ViewProps | React.HTMLAttributes<HTMLDivElement>);

export function CardContent({ children, style, ...props }: CardContentProps) {
  if (Platform.OS === "web") {
    const { className = "", ...rest } = props as WebCardProps;
    return (
      <div
        className={`p-4 ${className}`}
        style={style as React.CSSProperties}
        {...rest}
      >
        {children}
      </div>
    );
  } else {
    return (
      <View style={[styles.cardContent, style]} {...(props as NativeCardProps)}>
        {children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
});