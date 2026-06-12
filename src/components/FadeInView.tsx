import React, { useEffect, useRef } from 'react';
import { Animated, type ViewProps } from 'react-native';

interface FadeInViewProps extends ViewProps {
  delay?: number;
  duration?: number;
}

export function FadeInView({ children, delay = 0, duration = 300, style, ...props }: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration, delay]);

  return (
    <Animated.View style={[{ opacity }, style]} {...props}>
      {children}
    </Animated.View>
  );
}
