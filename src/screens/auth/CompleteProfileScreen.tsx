import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import {
  Button,
  Text,
  TextInput,
  Title,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation.types';
import { useCompleteProfile } from '../../hooks/useAuth';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'CompleteProfile'>;

export function CompleteProfileScreen({ navigation }: Props) {
  const theme = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const completeMutation = useCompleteProfile();
  const showSnackbar = useSnackbarStore(s => s.show);

  const handleSkip = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showSnackbar('Nombre y apellido son obligatorios', true);
      return;
    }
    try {
      await completeMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate,
        gender,
        referralCode: referralCode.trim() || undefined,
      });
      showSnackbar('Perfil completado exitosamente');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.title}>Completa tu perfil</Title>
        <Text style={styles.subtitle}>
          Esta información ayuda a tus repartidores a identificarte
        </Text>
        <TextInput
          label="Nombre *"
          value={firstName}
          onChangeText={setFirstName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Apellido *"
          value={lastName}
          onChangeText={setLastName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Fecha de nacimiento"
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="YYYY-MM-DD"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Género"
          value={gender}
          onChangeText={setGender}
          placeholder="Hombre / Mujer / Otro"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Código de referido (opcional)"
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
          mode="outlined"
          style={styles.input}
        />
        <HelperText type="info" visible>
          Si alguien te invitó, ingresa su código aquí
        </HelperText>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={completeMutation.isPending}
          disabled={completeMutation.isPending}
          style={styles.button}
        >
          Guardar perfil
        </Button>
        <Button mode="text" onPress={handleSkip} style={styles.skipButton}>
          Saltar por ahora
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: { textAlign: 'center', marginBottom: 32, opacity: 0.7 },
  input: { marginBottom: 12 },
  button: { marginTop: 16, paddingVertical: 6 },
  skipButton: { marginTop: 8 },
});
