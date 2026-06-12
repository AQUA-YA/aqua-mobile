import { create } from 'zustand';
import { storage } from './authStore';
import type { ActiveMode } from '../types/enums';

interface ThemeState {
  isDarkMode: boolean;
  activeMode: ActiveMode;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  setActiveMode: (mode: ActiveMode) => void;
}

export const useThemeStore = create<ThemeState>(set => ({
  isDarkMode: storage.getBoolean('theme.dark') ?? false,
  activeMode: (storage.getString('activeMode') as ActiveMode) ?? 'consumer',
  toggleDarkMode: () =>
    set(state => {
      const newVal = !state.isDarkMode;
      storage.set('theme.dark', newVal);
      return { isDarkMode: newVal };
    }),
  setDarkMode: (dark: boolean) => {
    storage.set('theme.dark', dark);
    set({ isDarkMode: dark });
  },
  setActiveMode: (mode: ActiveMode) => {
    storage.set('activeMode', mode);
    set({ activeMode: mode });
  },
}));
