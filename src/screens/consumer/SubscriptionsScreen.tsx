import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  TextInput,
  Dialog,
  Portal,
  SegmentedButtons,
  RadioButton,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';
import { useWaterTypes, useBottleSizes } from '../../hooks/usePurifiers';
import {
  useMySubscriptions,
  useCreateSubscription,
  usePauseSubscription,
  useResumeSubscription,
  useCancelSubscription,
} from '../../hooks/useSubscriptions';

export function SubscriptionsScreen() {
  const theme = useTheme();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { data: subsData, isLoading, isError, refetch, isRefetching } =
    useMySubscriptions();
  const { data: waterTypesData } = useWaterTypes();
  const { data: bottleSizesData } = useBottleSizes();
  const createSub = useCreateSubscription();
  const pauseSub = usePauseSubscription();
  const resumeSub = useResumeSubscription();
  const cancelSub = useCancelSubscription();

  const [showCreate, setShowCreate] = useState(false);
  const [waterTypeId, setWaterTypeId] = useState('');
  const [bottleSizeId, setBottleSizeId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [hour, setHour] = useState('10:00');

  const subscriptions = subsData?.data?.data?.data || [];
  const waterTypes = waterTypesData?.data?.data?.data || [];
  const bottleSizes = bottleSizesData?.data?.data?.data || [];

  const getWaterName = (id: string) => waterTypes.find((w) => w._id === id)?.name || id;
  const getBottleName = (id: string) => {
    const b = bottleSizes.find((bs) => bs._id === id);
    return b ? (b.name || `${b.liters}L`) : id;
  };

  const freqLabel: Record<string, string> = {
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
  };

  const handleCreate = async () => {
    if (!waterTypeId || !bottleSizeId) {
      showSnackbar('Selecciona tipo de agua y tamaño', true);
      return;
    }
    try {
      await createSub.mutateAsync({
        waterTypeId,
        bottleSizeId,
        quantity: parseInt(quantity, 10) || 1,
        frequency,
        dayOfWeek: frequency === 'weekly' ? parseInt(dayOfWeek, 10) : undefined,
        hour: hour || undefined,
      });
      setShowCreate(false);
      setWaterTypeId('');
      setBottleSizeId('');
      setQuantity('1');
      setFrequency('weekly');
      showSnackbar('Suscripción creada');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await pauseSub.mutateAsync(id);
      showSnackbar('Suscripción pausada');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  const handleResume = async (id: string) => {
    try {
      await resumeSub.mutateAsync(id);
      showSnackbar('Suscripción reanudada');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelSub.mutateAsync(id);
      showSnackbar('Suscripción cancelada');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Mis suscripciones
        </Text>

        <Button
          mode="contained"
          onPress={() => setShowCreate(true)}
          style={styles.addButton}
        >
          Nueva suscripción
        </Button>

        {isLoading && <Text variant="bodyMedium">Cargando...</Text>}

        {isError && (
          <ErrorState
            fullScreen={false}
            onRetry={() => refetch()}
            retrying={isRefetching}
          />
        )}

        {!isLoading && !isError && subscriptions.length === 0 && (
          <Text variant="bodyMedium" style={styles.emptyText}>
            Sin suscripciones activas
          </Text>
        )}

        {subscriptions.map((sub) => (
          <Card key={sub._id} style={styles.card}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium">
                    {getWaterName(sub.waterTypeId)} - {getBottleName(sub.bottleSizeId)}
                  </Text>
                  <Text variant="bodySmall">
                    {sub.quantity}x · {freqLabel[sub.frequency] || sub.frequency}
                    {sub.dayOfWeek !== undefined && ` · Día ${sub.dayOfWeek + 1}`}
                  </Text>
                  <Text variant="bodySmall">
                    {sub.isActive ? (sub.isPaused ? 'Pausada' : 'Activa') : 'Cancelada'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  {sub.isActive && !sub.isPaused && (
                    <IconButton icon="pause" onPress={() => handlePause(sub._id)} />
                  )}
                  {sub.isActive && sub.isPaused && (
                    <IconButton icon="play" onPress={() => handleResume(sub._id)} />
                  )}
                  {sub.isActive && (
                    <IconButton icon="delete" onPress={() => handleCancel(sub._id)} />
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={showCreate} onDismiss={() => setShowCreate(false)}>
          <Dialog.Title>Nueva suscripción</Dialog.Title>
          <Dialog.Content>
            <Text variant="labelLarge" style={{ marginBottom: 8 }}>Tipo de agua</Text>
            {waterTypes.map((wt) => (
              <RadioButton.Item
                key={wt._id}
                label={wt.name}
                value={wt._id}
                status={waterTypeId === wt._id ? 'checked' : 'unchecked'}
                onPress={() => setWaterTypeId(wt._id)}
              />
            ))}
            <Text variant="labelLarge" style={{ marginBottom: 8 }}>Tamaño</Text>
            {bottleSizes.map((bs) => (
              <RadioButton.Item
                key={bs._id}
                label={bs.name || `${bs.liters}L`}
                value={bs._id}
                status={bottleSizeId === bs._id ? 'checked' : 'unchecked'}
                onPress={() => setBottleSizeId(bs._id)}
              />
            ))}
            <TextInput
              label="Cantidad"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              mode="outlined"
              style={{ marginBottom: 12 }}
            />
            <SegmentedButtons
              value={frequency}
              onValueChange={(val) => setFrequency(val as 'weekly' | 'biweekly' | 'monthly')}
              buttons={[
                { value: 'weekly', label: 'Semanal' },
                { value: 'biweekly', label: 'Quincenal' },
                { value: 'monthly', label: 'Mensual' },
              ]}
              style={{ marginBottom: 12 }}
            />
            {frequency === 'weekly' && (
              <TextInput
                label="Día de la semana (0=Dom, 1=Lun...6=Sáb)"
                value={dayOfWeek}
                onChangeText={setDayOfWeek}
                keyboardType="number-pad"
                mode="outlined"
                style={{ marginBottom: 12 }}
              />
            )}
            <TextInput
              label="Hora (HH:MM)"
              value={hour}
              onChangeText={setHour}
              mode="outlined"
              style={{ marginBottom: 12 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreate(false)}>Cancelar</Button>
            <Button onPress={handleCreate} loading={createSub.isPending}>
              Crear
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  addButton: { marginBottom: 16 },
  card: { marginBottom: 8 },
  emptyText: { textAlign: 'center', marginVertical: 24 },
});
