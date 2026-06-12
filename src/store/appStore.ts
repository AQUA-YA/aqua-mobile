import { create } from 'zustand';
import type { Role } from '../types/enums';

interface AppState {
  isHydrated: boolean;
  setHydrated: () => void;
  getActiveRoles: (roles: Role[]) => Role[];
}

export const useAppStore = create<AppState>(set => ({
  isHydrated: false,
  setHydrated: () => set({ isHydrated: true }),
  getActiveRoles: (roles: Role[]) => roles,
}));
