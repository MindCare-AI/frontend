declare module '*.svg' {
    import React from 'react';
    import { SvgProps } from 'react-native-svg';
    const content: React.FC<SvgProps>;
    export default content;
  }
  
  // Add this for better web compatibility
  declare module 'react-native-svg' {
    export interface SvgProps {
      width?: number | string;
      height?: number | string;
    }
  }
  
  // Fix hasTouchableProperty compatibility issue
  declare global {
    namespace ReactNativeSvg {
      interface SvgProps {
        onPress?: () => void;
        onPressIn?: () => void;
        onPressOut?: () => void;
      }
    }
    
    // Add gesture handler polyfill declaration
    var __gestureHandlerPolyfill: {
      hasTouchableProperty: () => boolean;
    } | undefined;
    
    // Global polyfill function
    function hasTouchableProperty(): boolean;
    
    interface Window {
      hasTouchableProperty(): boolean;
      require: any;
    }
    
    var global: {
      hasTouchableProperty(): boolean;
      require: any;
    } & typeof globalThis;
  }

  // Gesture handler module augmentation
  declare module 'react-native-gesture-handler' {
    export function hasTouchableProperty(): boolean;
    export const State: {
      UNDETERMINED: number;
      FAILED: number;
      BEGAN: number;
      CANCELLED: number;
      ACTIVE: number;
      END: number;
    };
  }