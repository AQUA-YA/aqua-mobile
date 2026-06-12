import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Button,
  TextInput,
  Dialog,
  Portal,
  Snackbar,
  SegmentedButtons,
  Switch,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useAdminCoupons,
  useCreateAdminCoupon,
  useDeleteAdminCoupon,
  useAdminLoyaltyEvents,
  useCreateAdminLoyaltyEvent,
  useDeleteAdminLoyaltyEvent,
} from '../../hooks/useAdmin';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';


const COUPON_TYPE_LABELS: Record<string, string> = {
  amount: 'Monto fijo',
  percentage: 'Porcentaje',
  two_for_one: '2x1',
  free_delivery: 'Envío gratis',
};

export function AdminPromotionsScreen() {
  const [tab, setTab] = useState('coupons');

  return (
    <SafeAreaView style={[styles.container]}>
      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'coupons', label: 'Cupones' },
          { value: 'events', label: 'Eventos lealtad' },
        ]}
        style={styles.tabs}
      />
      {tab === 'coupons' ? <CouponsPanel /> : <LoyaltyEventsPanel />}
    </SafeAreaView>
  );
}

function CouponsPanel() {
  const { data, isLoading, isError, refetch, isRefetching } = useAdminCoupons();
  const createMutation = useCreateAdminCoupon();
  const deleteMutation = useDeleteAdminCoupon();

  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState('');
  const [couponType, setCouponType] = useState<'amount' | 'percentage' | 'two_for_one' | 'free_delivery'>('amount');
  const [value, setValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [maxUsesPerUser, setMaxUsesPerUser] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const items = data?.data?.data || [];

  const showMsg = (msg: string) => {
    setSnackbarMsg(msg);
  };

  const resetForm = () => {
    setCode('');
    setCouponType('amount');
    setValue('');
    setMaxUses('');
    setMaxUsesPerUser('');
    setStartsAt('');
    setEndsAt('');
  };

  const handleSave = async () => {
    const val = parseFloat(value);
    if (!val || val <= 0) {
      showMsg('Valor inválido');
      return;
    }
    if (!startsAt || !endsAt) {
      showMsg('Fechas de inicio y fin requeridas');
      return;
    }
    try {
      await createMutation.mutateAsync({
        code: code || undefined,
        type: couponType,
        value: val,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        maxUsesPerUser: maxUsesPerUser ? parseInt(maxUsesPerUser) : undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
      setShowCreate(false);
      resetForm();
      showMsg('Cupón creado');
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showMsg('Cupón eliminado');
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  if (isError) {
    return <ErrorState fullScreen={false} onRetry={() => refetch()} retrying={isRefetching} />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{item.code}</Text>
              <Switch value={item.isActive} onValueChange={() => {}} disabled />
            </View>
            <Text variant="bodySmall">
              {COUPON_TYPE_LABELS[item.type] || item.type}  •  {item.type === 'percentage' ? `${item.value}%` : `$${item.value}`}
            </Text>
            <Text variant="bodySmall">
              {item.maxUses ? `Máx: ${item.maxUses} usos` : 'Ilimitado'}
            </Text>
            <View style={styles.cardActions}>
              <Button compact textColor="#D32F2F" onPress={() => handleDelete(item._id)}>Eliminar</Button>
            </View>
          </Card.Content>
        </Card>
      )}
      ListHeaderComponent={
        <Button mode="contained" onPress={() => { resetForm(); setShowCreate(true); }} style={styles.addBtn}>
          Crear cupón global
        </Button>
      }
      contentContainerStyle={styles.panel}
    >
      <Portal>
        <Dialog visible={showCreate} onDismiss={() => setShowCreate(false)}>
          <Dialog.Title>Nuevo cupón global</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Código (opcional)" value={code} onChangeText={setCode} mode="outlined" style={styles.input} />

            <SegmentedButtons
              value={couponType}
              onValueChange={(v) => setCouponType(v as any)}
              buttons={[
                { value: 'amount', label: '$$' },
                { value: 'percentage', label: '%' },
                { value: 'two_for_one', label: '2x1' },
                { value: 'free_delivery', label: 'Envío' },
              ]}
              style={styles.segment}
            />

            {couponType !== 'free_delivery' && (
              <TextInput
                label={couponType === 'percentage' ? 'Porcentaje' : 'Monto'}
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
            )}

            <TextInput label="Inicio (YYYY-MM-DD)" value={startsAt} onChangeText={setStartsAt} mode="outlined" style={styles.input} />
            <TextInput label="Fin (YYYY-MM-DD)" value={endsAt} onChangeText={setEndsAt} mode="outlined" style={styles.input} />
            <TextInput label="Usos máximos" value={maxUses} onChangeText={setMaxUses} keyboardType="numeric" mode="outlined" style={styles.input} />
            <TextInput label="Usos por usuario" value={maxUsesPerUser} onChangeText={setMaxUsesPerUser} keyboardType="numeric" mode="outlined" style={styles.input} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreate(false)}>Cancelar</Button>
            <Button onPress={handleSave} loading={createMutation.isPending}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbarMsg} onDismiss={() => setSnackbarMsg('')} duration={3000}>
        {snackbarMsg}
      </Snackbar>
    </FlatList>
  );
}

function LoyaltyEventsPanel() {
  const { data, isLoading, isError, refetch, isRefetching } = useAdminLoyaltyEvents();
  const createMutation = useCreateAdminLoyaltyEvent();
  const deleteMutation = useDeleteAdminLoyaltyEvent();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [multiplier, setMultiplier] = useState('');
  const [eventStartsAt, setEventStartsAt] = useState('');
  const [eventEndsAt, setEventEndsAt] = useState('');
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const items = data?.data?.data || [];

  const showMsg = (msg: string) => {
    setSnackbarMsg(msg);
  };

  const resetForm = () => {
    setName('');
    setMultiplier('');
    setEventStartsAt('');
    setEventEndsAt('');
  };

  const handleSave = async () => {
    const mult = parseFloat(multiplier);
    if (!name.trim() || !mult || mult < 1) {
      showMsg('Nombre y multiplicador (>=1) requeridos');
      return;
    }
    if (!eventStartsAt || !eventEndsAt) {
      showMsg('Fechas requeridas');
      return;
    }
    try {
      await createMutation.mutateAsync({
        name,
        multiplier: mult,
        startsAt: new Date(eventStartsAt).toISOString(),
        endsAt: new Date(eventEndsAt).toISOString(),
      });
      setShowCreate(false);
      resetForm();
      showMsg('Evento creado');
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showMsg('Evento eliminado');
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  if (isError) {
    return <ErrorState fullScreen={false} onRetry={() => refetch()} retrying={isRefetching} />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Switch value={item.isActive} onValueChange={() => {}} disabled />
            </View>
            <Text variant="bodySmall">Multiplicador: {item.multiplier}x</Text>
            <Text variant="bodySmall">
              {new Date(item.startsAt).toLocaleDateString()} - {new Date(item.endsAt).toLocaleDateString()}
            </Text>
            <Button compact textColor="#D32F2F" onPress={() => handleDelete(item._id)}>Eliminar</Button>
          </Card.Content>
        </Card>
      )}
      ListHeaderComponent={
        <Button mode="contained" onPress={() => { resetForm(); setShowCreate(true); }} style={styles.addBtn}>
          Crear evento de lealtad
        </Button>
      }
      contentContainerStyle={styles.panel}
    >
      <Portal>
        <Dialog visible={showCreate} onDismiss={() => setShowCreate(false)}>
          <Dialog.Title>Nuevo evento de lealtad</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <TextInput label="Multiplicador (ej: 2)" value={multiplier} onChangeText={setMultiplier} keyboardType="numeric" mode="outlined" style={styles.input} />
            <TextInput label="Inicio (YYYY-MM-DD)" value={eventStartsAt} onChangeText={setEventStartsAt} mode="outlined" style={styles.input} />
            <TextInput label="Fin (YYYY-MM-DD)" value={eventEndsAt} onChangeText={setEventEndsAt} mode="outlined" style={styles.input} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreate(false)}>Cancelar</Button>
            <Button onPress={handleSave} loading={createMutation.isPending}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbarMsg} onDismiss={() => setSnackbarMsg('')} duration={3000}>
        {snackbarMsg}
      </Snackbar>
    </FlatList>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { margin: 16 },
  loading: { flex: 1, justifyContent: 'center' },
  panel: { padding: 16, paddingBottom: 32 },
  addBtn: { marginBottom: 16 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  input: { marginBottom: 12 },
  segment: { marginBottom: 16 },
});
