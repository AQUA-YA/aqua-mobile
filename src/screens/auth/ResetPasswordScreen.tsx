import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation.types';
import { useResetPassword } from '../../hooks/useAuth';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ route }: Props) {
  const theme = useTheme();
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const resetMutation = useResetPassword();
  const showSnackbar = useSnackbarStore(s => s.show);

  const handleReset = async () => {
    if (newPassword.length < 8) {
      showSnackbar('La contraseña debe tener al menos 8 caracteres', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showSnackbar('Las contraseñas no coinciden', true);
      return;
    }
    try {
      await resetMutation.mutateAsync({ email, code, newPassword });
      showSnackbar('Contraseña actualizada exitosamente');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Title style={styles.title}>Nueva contraseña</Title>
        <Text style={styles.subtitle}>
          Ingresa el código que recibiste y tu nueva contraseña
        </Text>
        <TextInput
          label="Código de verificación"
          value={code}
          onChangeText={setCode}
          maxLength={6}
          autoCapitalize="characters"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Nueva contraseña"
          value={newPassword}
          onChangeText={setNewPassword}
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
          onPress={handleReset}
          loading={resetMutation.isPending}
          disabled={resetMutation.isPending}
          style={styles.button}
        >
          Restablecer contraseña
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
