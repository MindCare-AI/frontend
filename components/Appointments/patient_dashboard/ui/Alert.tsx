"use client"

import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme as useNativeBase } from "native-base";
import { useTheme } from "../../../../theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";

type AlertStatus = "info" | "warning" | "success" | "error";

interface AlertProps {
  status?: AlertStatus;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactElement<{ color?: string; size?: number }>;
  style?: any;
}

export const Alert: React.FC<AlertProps> = ({ status = "info", title, children, icon, style }) => {
  const nbTheme = useNativeBase();
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();

  // Responsive layout adjustments
  const isMobile = width < 768;
  const padding = isMobile ? 10 : 16;
  const iconSize = isMobile ? 18 : 22;
  const borderRadius = isMobile ? 4 : 6;

  const getBackgroundColor = () => {
    if (isDarkMode) {
      switch (status) {
        case "info":
          return nbTheme.colors.blue[900];
        case "warning":
          return nbTheme.colors.yellow[900];
        case "success":
          return nbTheme.colors.green[900];
        case "error":
          return nbTheme.colors.red[900];
        default:
          return nbTheme.colors.blue[900];
      }
    } else {
      switch (status) {
        case "info":
          return nbTheme.colors.blue[50];
        case "warning":
          return nbTheme.colors.yellow[50];
        case "success":
          return nbTheme.colors.green[50];
        case "error":
          return nbTheme.colors.red[50];
        default:
          return nbTheme.colors.blue[50];
      }
    }
  };
  const getBorderColor = () => {
    if (isDarkMode) {
      switch (status) {
        case "info":
          return nbTheme.colors.blue[700];
        case "warning":
          return nbTheme.colors.yellow[700];
        case "success":
          return nbTheme.colors.green[700];
        case "error":
          return nbTheme.colors.red[700];
        default:
          return nbTheme.colors.blue[700];
      }
    } else {
      switch (status) {
        case "info":
          return nbTheme.colors.blue[200];
        case "warning":
          return nbTheme.colors.yellow[200];
        case "success":
          return nbTheme.colors.green[200];
        case "error":
          return nbTheme.colors.red[200];
        default:
          return nbTheme.colors.blue[200];
      }
    }
  };
  const getIconColor = () => {
    switch (status) {
      case "info":
        return nbTheme.colors.blue[500];
      case "warning":
        return nbTheme.colors.yellow[500];
      case "success":
        return nbTheme.colors.green[500];
      case "error":
        return nbTheme.colors.red[500];
      default:
        return nbTheme.colors.blue[500];
    }
  };
  
  const getIconName = () => {
    switch (status) {
      case "info":
        return "information-circle";
      case "warning":
        return "warning";
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      default:
        return "information-circle";
    }
  };  const getTitleColor = () => {
    if (isDarkMode) {
      switch (status) {
        case "info":
          return nbTheme.colors.blue[300];
        case "warning":
          return nbTheme.colors.yellow[300];
        case "success":
          return nbTheme.colors.green[300];
        case "error":
          return nbTheme.colors.red[300];
        default:
          return nbTheme.colors.blue[300];
      }
    } else {
      switch (status) {
        case "info":
          return nbTheme.colors.blue[800];
        case "warning":
          return nbTheme.colors.yellow[800];
        case "success":
          return nbTheme.colors.green[800];
        case "error":
          return nbTheme.colors.red[800];
        default:
          return nbTheme.colors.blue[800];
      }
    }
  };
  const getTextColor = () => {
    if (isDarkMode) {
      switch (status) {
        case "info":
          return nbTheme.colors.blue[100];
        case "warning":
          return nbTheme.colors.yellow[100];
        case "success":
          return nbTheme.colors.green[100];
        case "error":
          return nbTheme.colors.red[100];
        default:
          return nbTheme.colors.blue[100];
      }
    } else {
      switch (status) {
        case "info":
          return nbTheme.colors.blue[700];
        case "warning":
          return nbTheme.colors.yellow[700];
        case "success":
          return nbTheme.colors.green[700];
        case "error":
          return nbTheme.colors.red[700];
        default:
          return nbTheme.colors.blue[700];
      }
    }
  };
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          padding,
          borderRadius,
        },
        style,
      ]}
    >
      {icon ? (
        <View style={styles.iconContainer}>
          {React.cloneElement(icon, { color: getIconColor(), size: iconSize })}
        </View>
      ) : (
        <View style={styles.iconContainer}>
          <Ionicons name={getIconName() as any} size={iconSize} color={getIconColor()} />
        </View>
      )}
      <View style={styles.contentContainer}>
        {title && (
          <Text 
            style={[
              styles.title, 
              { 
                color: getTitleColor(),
                fontSize: isMobile ? 13 : 15,
              }
            ]}
          >
            {title}
          </Text>
        )}
        <Text 
          style={[
            styles.text, 
            { 
              color: getTextColor(),
              fontSize: isMobile ? 12 : 14,
            }
          ]}
        >
          {children}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: 2,
  },
  text: {
    lineHeight: 20,
  },
});
