import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Chip,
  Searchbar,
  Button,
  Dialog,
  Portal,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminOrders } from '../../hooks/useAdmin';
import { ErrorState } from '../../components/ErrorState';
import type { Order } from '../../types/models';

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFA000',
  accepted: '#1976D2',
  in_transit: '#0077B6',
  empty_pickup: '#7B1FA2',
  delivered: '#388E3C',
  cancelled: '#D32F2F',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  in_transit: 'En tránsito',
  empty_pickup: 'Recoger vacío',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export function AdminOrdersScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useAdminOrders({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const orders = data?.data?.data || [];
  const meta = data?.data?.meta;

  if (isLoading && page === 1) {
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
      <Searchbar
        placeholder="Buscar pedidos..."
        value={search}
        onChangeText={(t) => { setSearch(t); setPage(1); }}
        style={styles.searchbar}
      />

      <View style={styles.chipRow}>
        {['', 'pending', 'accepted', 'in_transit', 'delivered', 'cancelled'].map(s => (
          <Chip
            key={s}
            selected={statusFilter === s}
            onPress={() => { setStatusFilter(s); setPage(1); }}
            style={styles.chip}
          >
            {s === '' ? 'Todos' : STATUS_LABELS[s] || s}
          </Chip>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  Pedido #{item._id.slice(-6)}
                </Text>
                <Chip
                  style={{ backgroundColor: STATUS_COLORS[item.status] + '22' }}
                  textStyle={{ color: STATUS_COLORS[item.status], fontSize: 11 }}
                >
                  {STATUS_LABELS[item.status] || item.status}
                </Chip>
              </View>
              <Text variant="bodySmall">
                ${item.total.toFixed(2)}  •  {item.quantity} garrafón(es)  •  {item.paymentMethod}
              </Text>
              <Text variant="bodySmall" style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString('es-MX', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </Text>
              <Button
                compact
                onPress={() => {
                  setSelected(item);
                  setShowDetail(true);
                }}
              >
                Ver detalle
              </Button>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (meta && page < meta.totalPages) setPage(p => p + 1);
        }}
      />

      <Portal>
        <Dialog visible={showDetail} onDismiss={() => setShowDetail(false)}>
          <Dialog.Title>Detalle del pedido</Dialog.Title>
          <Dialog.Content>
            {selected && (
              <>
                <Text variant="bodyMedium">ID: {selected._id}</Text>
                <Text variant="bodyMedium">Usuario: {selected.userId}</Text>
                <Text variant="bodyMedium">Estado: {STATUS_LABELS[selected.status]}</Text>
                <Text variant="bodyMedium">Total: ${selected.total.toFixed(2)}</Text>
                <Text variant="bodyMedium">Pago: {selected.paymentMethod}</Text>
                <Text variant="bodyMedium">Cantidad: {selected.quantity}</Text>
                {selected.subscriptionId && (
                  <Text variant="bodySmall">Suscripción: {selected.subscriptionId}</Text>
                )}
                <Text variant="bodySmall" style={{ marginTop: 8 }}>
                  Dirección: {selected.deliveryAddress.street}, {selected.deliveryAddress.city}
                </Text>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDetail(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  searchbar: { margin: 16, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8, flexWrap: 'wrap' },
  chip: { marginBottom: 4 },
  list: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dateText: { opacity: 0.5, marginTop: 2 },
});
