import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Button,
  TextInput,
  SegmentedButtons,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminCommissionConfig, useUpdateCommissionConfig } from '../../hooks/useAdmin';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';

export function AdminCommissionsScreen() {
  const theme = useTheme();
  const { data, isLoading, isError, refetch, isRefetching } = useAdminCommissionConfig();
  const updateMutation = useUpdateCommissionConfig();

  const config = data?.data?.data;

  const [type, setType] = useState<'fixed' | 'percentage' | 'disabled'>('disabled');
  const [value, setValue] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const showMsg = (msg: string) => {
    setSnackbarMsg(msg);
  };

  const handleOpenEdit = () => {
    if (config) {
      setType(config.type);
      setValue(String(config.value));
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    const val = parseFloat(value);
    if (type !== 'disabled' && (!val || val < 0)) {
      showMsg('Ingresa un valor válido');
      return;
    }
    try {
      await updateMutation.mutateAsync({ type, value: type === 'disabled' ? 0 : val });
      setShowForm(false);
      showMsg('Configuración actualizada');
    } catch (err) {
      showMsg(getErrorMessage(err));
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Configuración actual
            </Text>
            {config ? (
              <>
                <View style={styles.configRow}>
                  <Text variant="bodyMedium">Tipo:</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {config.type === 'fixed' ? 'Fija' : config.type === 'percentage' ? 'Porcentaje' : 'Desactivada'}
                  </Text>
                </View>
                {config.type !== 'disabled' && (
                  <View style={styles.configRow}>
                    <Text variant="bodyMedium">Valor:</Text>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                      {config.type === 'fixed' ? `$${config.value.toFixed(2)}` : `${config.value}%`}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text variant="bodyMedium" style={{ opacity: 0.5 }}>Sin configuración</Text>
            )}
          </Card.Content>
        </Card>

        {!showForm ? (
          <Button mode="contained" onPress={handleOpenEdit} style={styles.editBtn}>
            Editar configuración
          </Button>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Editar comisión
              </Text>

              <SegmentedButtons
                value={type}
                onValueChange={(v) => setType(v as 'fixed' | 'percentage' | 'disabled')}
                buttons={[
                  { value: 'percentage', label: 'Porcentaje' },
                  { value: 'fixed', label: 'Fija' },
                  { value: 'disabled', label: 'Desactivar' },
                ]}
                style={styles.segment}
              />

              {type !== 'disabled' && (
                <TextInput
                  label={type === 'fixed' ? 'Monto fijo ($)' : 'Porcentaje (%)'}
                  value={value}
                  onChangeText={setValue}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                />
              )}

              <View style={styles.formActions}>
                <Button onPress={() => setShowForm(false)}>Cancelar</Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={updateMutation.isPending}
                >
                  Guardar
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Snackbar
        visible={!!snackbarMsg}
        onDismiss={() => setSnackbarMsg('')}
        duration={3000}
      >
        {snackbarMsg}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 16 },
  sectionTitle: { marginBottom: 12, fontWeight: 'bold' },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  editBtn: { marginBottom: 16 },
  segment: { marginBottom: 16 },
  input: { marginBottom: 16 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
