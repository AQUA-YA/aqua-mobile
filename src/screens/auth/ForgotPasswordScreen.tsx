import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation.types';
import { useForgotPassword } from '../../hooks/useAuth';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const forgotMutation = useForgotPassword();
  const showSnackbar = useSnackbarStore(s => s.show);

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      showSnackbar('Ingresa un correo válido', true);
      return;
    }
    try {
      await forgotMutation.mutateAsync(email.trim());
      showSnackbar('Código enviado a tu correo');
      navigation.navigate('ResetPassword', { email: email.trim() });
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Title style={styles.title}>Recuperar contraseña</Title>
        <Text style={styles.subtitle}>Te enviaremos un código a tu correo</Text>
        <TextInput
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleSendCode}
          loading={forgotMutation.isPending}
          disabled={forgotMutation.isPending}
          style={styles.button}
        >
          Enviar código
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.link}
        >
          Volver al inicio de sesión
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
  link: { marginTop: 16 },
});
