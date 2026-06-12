import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation.types';
import { useRegisterEmail } from '../../hooks/useAuth';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterEmail'>;

export function RegisterEmailScreen({ navigation }: Props) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const registerMutation = useRegisterEmail();
  const showSnackbar = useSnackbarStore(s => s.show);

  const handleContinue = async () => {
    if (!email.trim() || !email.includes('@')) {
      showSnackbar('Ingresa un correo electrónico válido', true);
      return;
    }
    try {
      await registerMutation.mutateAsync(email.trim());
      navigation.navigate('VerifyCode', { email: email.trim() });
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Title style={styles.title}>Crear cuenta</Title>
        <Text style={styles.subtitle}>
          Ingresa tu correo electrónico para comenzar
        </Text>
        <TextInput
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleContinue}
          loading={registerMutation.isPending}
          disabled={registerMutation.isPending}
          style={styles.button}
        >
          Continuar
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.link}
        >
          ¿Ya tienes cuenta? Inicia sesión
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
