import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { StyleProp, ViewStyle } from 'react-native';

interface ThemedScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ThemedScreen({ children, style }: ThemedScreenProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
