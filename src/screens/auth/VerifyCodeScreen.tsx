import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation.types';
import { useVerifyCode } from '../../hooks/useAuth';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyCode'>;

export function VerifyCodeScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { email } = route.params;
  const [code, setCode] = useState('');
  const verifyMutation = useVerifyCode();
  const showSnackbar = useSnackbarStore(s => s.show);

  const handleVerify = async () => {
    if (!code.trim() || code.length < 6) {
      showSnackbar('Ingresa el código de 6 caracteres', true);
      return;
    }
    try {
      await verifyMutation.mutateAsync({ email, code: code.trim() });
      navigation.navigate('SetPassword', { email, code: code.trim() });
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Title style={styles.title}>Verifica tu correo</Title>
        <Text style={styles.subtitle}>
          Ingresa el código de 6 caracteres que enviamos a {email}
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
        <Button
          mode="contained"
          onPress={handleVerify}
          loading={verifyMutation.isPending}
          disabled={verifyMutation.isPending}
          style={styles.button}
        >
          Verificar
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.link}
        >
          Cambiar correo
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
  input: { marginBottom: 16, textAlign: 'center', fontSize: 24 },
  button: { marginTop: 8, paddingVertical: 6 },
  link: { marginTop: 16 },
});
