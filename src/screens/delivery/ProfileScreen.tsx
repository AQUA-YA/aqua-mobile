import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
  Switch,
  TextInput,
  Dialog,
  Portal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useDeliveryProfile,
  useUpdateAvailability,
  useKyc,
  useSubmitKyc,
  useDeliveryQr,
} from '../../hooks/useDelivery';
import { useLogout } from '../../hooks/useAuth';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';

export function DeliveryProfileScreen() {
  const theme = useTheme();
  const { logout } = useLogout();
  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useDeliveryProfile();
  const updateAvailability = useUpdateAvailability();
  const { data: kycData } = useKyc();
  const submitKyc = useSubmitKyc();
  const { data: qrData } = useDeliveryQr();
  const showSnackbar = useSnackbarStore((s) => s.show);

  const [showKycDialog, setShowKycDialog] = useState(false);
  const [idPhoto, setIdPhoto] = useState('');
  const [selfie, setSelfie] = useState('');

  const profile = profileData?.data?.data;
  const kycStatus = kycData?.data?.data?.status;
  const qrToken = qrData?.data?.data?.qrToken;

  const handleToggleAvailability = async () => {
    try {
      await updateAvailability.mutateAsync(!profile?.isAvailable);
      showSnackbar(
        profile?.isAvailable
          ? 'Te has marcado como no disponible'
          : 'Ya estás disponible para recibir pedidos',
      );
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  const handleSubmitKyc = async () => {
    if (!idPhoto.trim() || !selfie.trim()) {
      showSnackbar('Completa todos los campos', true);
      return;
    }
    try {
      await submitKyc.mutateAsync({ idPhoto, selfie });
      setShowKycDialog(false);
      showSnackbar('KYC enviado para revisión');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator style={styles.loading} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} retrying={isRefetching} />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium">Disponibilidad</Text>
            <View style={styles.switchRow}>
              <Text variant="bodyMedium">
                {profile?.isAvailable ? 'Disponible' : 'No disponible'}
              </Text>
              <Switch
                value={profile?.isAvailable || false}
                onValueChange={handleToggleAvailability}
                color={theme.colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium">Verificación KYC</Text>
            <Text variant="bodyMedium" style={styles.kycStatus}>
              Estado:{' '}
              {kycStatus === 'approved'
                ? '✓ Verificado'
                : kycStatus === 'pending'
                  ? '⏳ Pendiente'
                  : kycStatus === 'rejected'
                    ? '✗ Rechazado'
                    : '— No enviado'}
            </Text>
            {kycStatus !== 'approved' && (
              <Button
                mode="outlined"
                onPress={() => setShowKycDialog(true)}
                style={styles.actionButton}
              >
                {kycStatus ? 'Reenviar documentos' : 'Enviar documentos'}
              </Button>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium">Mi código QR</Text>
            <Text variant="bodySmall" style={styles.qrHint}>
              Los consumidores pueden escanear tu código QR para verificar tu
              identidad al entregar
            </Text>
            {qrToken && (
              <View style={styles.qrBox}>
                <Text variant="bodyMedium" style={styles.qrToken}>
                  {qrToken}
                </Text>
              </View>
            )}
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

        <Portal>
          <Dialog
            visible={showKycDialog}
            onDismiss={() => setShowKycDialog(false)}
          >
            <Dialog.Title>Verificación KYC</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Foto de identificación (base64)"
                value={idPhoto}
                onChangeText={setIdPhoto}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.dialogInput}
              />
              <TextInput
                label="Selfie (base64)"
                value={selfie}
                onChangeText={setSelfie}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.dialogInput}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowKycDialog(false)}>Cancelar</Button>
              <Button
                onPress={handleSubmitKyc}
                loading={submitKyc.isPending}
              >
                Enviar
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center' },
  content: { padding: 16 },
  section: { marginBottom: 16 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  kycStatus: { marginVertical: 8 },
  actionButton: { marginTop: 8 },
  qrHint: { marginVertical: 8, opacity: 0.6 },
  qrBox: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  qrToken: { fontWeight: 'bold', fontSize: 16, letterSpacing: 2 },
  logoutButton: { marginTop: 24 },
  dialogInput: { marginBottom: 12 },
});
