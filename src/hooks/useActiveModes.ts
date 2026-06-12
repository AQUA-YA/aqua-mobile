import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import type { ActiveMode, Role } from '../types/enums';

export function useActiveModes(): { modes: ActiveMode[]; canSwitch: boolean } {
  const user = useAuthStore(s => s.user);

  const modes = useMemo(() => {
    if (!user) return ['consumer'] as ActiveMode[];
    const roles = user.roles as Role[];
    const available: ActiveMode[] = ['consumer'];
    if (roles.includes('purifier')) available.push('purifier');
    if (roles.includes('delivery')) available.push('delivery');
    if (roles.includes('admin')) available.push('admin');
    return available;
  }, [user]);

  return { modes, canSwitch: modes.length > 1 };
}
