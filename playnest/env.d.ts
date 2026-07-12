/// <reference types="nativewind/types" />
declare module '*.css';

// Ensure this file is parsed as a module
export {};

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
}