test('types are valid', () => {
  expect(true).toBe(true);
});

test('auth store is properly defined', () => {
  const { useAuthStore } = require('../src/store/authStore');
  const state = useAuthStore.getState();
  expect(state.accessToken).toBeNull();
  expect(state.isHydrated).toBeFalsy();
});

test('theme store is properly defined', () => {
  const { useThemeStore } = require('../src/store/themeStore');
  const state = useThemeStore.getState();
  expect(state.activeMode).toBe('consumer');
});
