import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation.types';
import { useLogin } from '../../hooks/useAuth';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();
  const showSnackbar = useSnackbarStore(s => s.show);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showSnackbar('Ingresa tu correo y contraseña', true);
      return;
    }
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Title style={styles.title}>Iniciar sesión</Title>
        <TextInput
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loginMutation.isPending}
          disabled={loginMutation.isPending}
          style={styles.button}
        >
          Iniciar sesión
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.link}
        >
          Olvidé mi contraseña
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.navigate('RegisterEmail')}
          style={styles.link}
        >
          ¿No tienes cuenta? Regístrate
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
    marginBottom: 32,
  },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 6 },
  link: { marginTop: 8 },
});
