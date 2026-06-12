import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import type { User, AuthTokens } from '../types/models';

export const storage = createMMKV();

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isHydrated: boolean;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

const TOKENS_KEY = 'auth.tokens';
const USER_KEY = 'auth.user';

function loadTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  try {
    const raw = storage.getString(TOKENS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return { accessToken: null, refreshToken: null };
}

function loadUser(): User | null {
  try {
    const raw = storage.getString(USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

function saveTokens(accessToken: string, refreshToken: string) {
  storage.set(TOKENS_KEY, JSON.stringify({ accessToken, refreshToken }));
}

function saveUser(user: User) {
  storage.set(USER_KEY, JSON.stringify(user));
}

function clearStorage() {
  storage.remove(TOKENS_KEY);
  storage.remove(USER_KEY);
}

export const useAuthStore = create<AuthState>(set => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isHydrated: false,
  setTokens: (tokens: AuthTokens) => {
    saveTokens(tokens.accessToken, tokens.refreshToken);
    saveUser(tokens.user);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: tokens.user,
    });
  },
  setUser: (user: User) => {
    saveUser(user);
    set({ user });
  },
  clearAuth: () => {
    clearStorage();
    set({ accessToken: null, refreshToken: null, user: null });
  },
  hydrate: () => {
    const { accessToken, refreshToken } = loadTokens();
    const user = loadUser();
    set({ accessToken, refreshToken, user, isHydrated: true });
  },
}));
