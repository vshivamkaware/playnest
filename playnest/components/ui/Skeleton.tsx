import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';

export interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width, height, borderRadius = 8, className, style, ...props }: SkeletonProps) {
  const opacity = useSharedValue(0.5);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: width as any,
          height: height as any,
          borderRadius,
        },
        style
      ]}
      className={`${isDark ? 'bg-zinc-800' : 'bg-gray-200'} ${className || ''}`}
      {...props}
    />
  );
}
