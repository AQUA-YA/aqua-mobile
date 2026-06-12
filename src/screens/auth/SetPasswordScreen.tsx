import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation.types';
import { useSetPassword } from '../../hooks/useAuth';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'SetPassword'>;

export function SetPasswordScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { email, code } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const setPasswordMutation = useSetPassword();
  const showSnackbar = useSnackbarStore(s => s.show);

  const handleSubmit = async () => {
    if (password.length < 8) {
      showSnackbar('La contraseña debe tener al menos 8 caracteres', true);
      return;
    }
    if (password !== confirmPassword) {
      showSnackbar('Las contraseñas no coinciden', true);
      return;
    }
    try {
      await setPasswordMutation.mutateAsync({ email, code, password });
      navigation.reset({ index: 0, routes: [{ name: 'CompleteProfile' }] });
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Title style={styles.title}>Crea tu contraseña</Title>
        <Text style={styles.subtitle}>Mínimo 8 caracteres</Text>
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={setPasswordMutation.isPending}
          disabled={setPasswordMutation.isPending}
          style={styles.button}
        >
          Crear cuenta
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: { textAlign: 'center', marginBottom: 32, opacity: 0.7 },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 6 },
});
