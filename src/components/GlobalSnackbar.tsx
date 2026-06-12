import React from 'react';
import { Snackbar } from 'react-native-paper';
import { create } from 'zustand';

interface SnackbarState {
  visible: boolean;
  message: string;
  isError: boolean;
  show: (message: string, isError?: boolean) => void;
  hide: () => void;
}

export const useSnackbarStore = create<SnackbarState>(set => ({
  visible: false,
  message: '',
  isError: false,
  show: (message: string, isError = false) =>
    set({ visible: true, message, isError }),
  hide: () => set({ visible: false, message: '', isError: false }),
}));

export function GlobalSnackbar() {
  const { visible, message, isError, hide } = useSnackbarStore();
  const theme = { colors: { error: '#D32F2F', primary: '#0077B6' } };

  return (
    <Snackbar
      visible={visible}
      onDismiss={hide}
      duration={4000}
      style={{
        backgroundColor: isError ? theme.colors.error : theme.colors.primary,
      }}
    >
      {message}
    </Snackbar>
  );
}
