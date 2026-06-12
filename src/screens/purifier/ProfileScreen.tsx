import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Avatar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useLogout } from '../../hooks/useAuth';

export function PurifierProfileScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const activeMode = useThemeStore((s) => s.activeMode);
  const setActiveMode = useThemeStore((s) => s.setActiveMode);
  const { logout } = useLogout();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar.Icon size={80} icon="account" />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.firstName
              ? `${user.firstName} ${user.lastName || ''}`
              : user?.email}
          </Text>
          <Text variant="bodyMedium" style={styles.role}>
            Modo: Purificador
          </Text>
        </View>

        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium">Cambiar modo</Text>
            <View style={styles.modeButtons}>
              {(['consumer', 'purifier', 'delivery'] as const).map((mode) => {
                const hasRole = user?.roles?.includes(mode);
                if (!hasRole && mode !== 'consumer') return null;
                return (
                  <Button
                    key={mode}
                    mode={activeMode === mode ? 'contained' : 'outlined'}
                    compact
                    onPress={() => setActiveMode(mode)}
                    style={styles.modeButton}
                  >
                    {mode === 'consumer'
                      ? 'Consumidor'
                      : mode === 'purifier'
                        ? 'Purificador'
                        : 'Repartidor'}
                  </Button>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          textColor={theme.colors.error}
          onPress={logout}
          style={styles.logoutButton}
        >
          Cerrar sesión
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  name: { marginTop: 12, fontWeight: 'bold' },
  role: { opacity: 0.7, marginTop: 4 },
  section: { marginBottom: 16 },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  modeButton: { flex: 1, marginHorizontal: 4 },
  logoutButton: { marginTop: 24 },
});
