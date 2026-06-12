import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getErrorMessage } from '../api/client';
import { usersApi } from '../api/users.api';
import type { AuthTokens } from '../types/models';
import type { ActiveMode, Role } from '../types/enums';

// Selecciona el modo inicial según los roles del usuario, priorizando el de
// mayor privilegio. RootNavigator usa activeMode para decidir qué stack mostrar,
// así que debe sincronizarse en cada inicio de sesión.
const MODE_PRIORITY: ActiveMode[] = ['admin', 'purifier', 'delivery', 'consumer'];

function pickDefaultMode(roles: Role[] | undefined): ActiveMode {
  return MODE_PRIORITY.find(mode => roles?.includes(mode)) ?? 'consumer';
}

export function useLogin() {
  const setTokens = useAuthStore(s => s.setTokens);
  const setActiveMode = useThemeStore(s => s.setActiveMode);

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await authApi.login(email, password);
      return response.data.data;
    },
    onSuccess: data => {
      const tokens = data as unknown as AuthTokens;
      setTokens(tokens);
      setActiveMode(pickDefaultMode(tokens.user?.roles));
    },
    onError: () => {},
  });
}

export function useRegisterEmail() {
  return useMutation({
    mutationFn: (email: string) => authApi.register(email),
  });
}

export function useVerifyCode() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyCode(email, code),
  });
}

export function useSetPassword() {
  const setTokens = useAuthStore(s => s.setTokens);
  const setActiveMode = useThemeStore(s => s.setActiveMode);

  return useMutation({
    mutationFn: ({
      email,
      code,
      password,
    }: {
      email: string;
      code: string;
      password: string;
    }) => authApi.setPassword(email, code, password),
    onSuccess: data => {
      const tokens = data.data.data as unknown as AuthTokens;
      setTokens(tokens);
      setActiveMode(pickDefaultMode(tokens.user?.roles));
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  const setTokens = useAuthStore(s => s.setTokens);
  const setActiveMode = useThemeStore(s => s.setActiveMode);

  return useMutation({
    mutationFn: ({
      email,
      code,
      newPassword,
    }: {
      email: string;
      code: string;
      newPassword: string;
    }) => authApi.resetPassword(email, code, newPassword),
    onSuccess: (_, variables) => {
      authApi.login(variables.email, variables.newPassword).then(res => {
        const tokens = res.data.data as unknown as AuthTokens;
        setTokens(tokens);
        setActiveMode(pickDefaultMode(tokens.user?.roles));
      });
    },
  });
}

export function useCompleteProfile() {
  const setUser = useAuthStore(s => s.setUser);

  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      birthDate: string;
      gender: string;
      referralCode?: string;
    }) => usersApi.updateProfile(data),
    onSuccess: response => {
      setUser(response.data.data);
    },
  });
}

export function useMe() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.getMe();
      return response.data.data;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const clearAuth = useAuthStore(s => s.clearAuth);
  const setActiveMode = useThemeStore(s => s.setActiveMode);

  const logout = () => {
    setActiveMode('consumer');
    clearAuth();
  };

  return { logout };
}

export function useAuthError(error: unknown): string {
  if (!error) return '';
  return getErrorMessage(error);
}
