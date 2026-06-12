import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Chip,
  useTheme,
  ActivityIndicator,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyOrders } from '../../hooks/useOrders';
import { ErrorState } from '../../components/ErrorState';

const ORDER_STATUSES = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'accepted', label: 'Aceptados' },
  { value: 'in_transit', label: 'En reparto' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  in_transit: 'En reparto',
  empty_pickup: 'Recogiendo vacío',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export function OrderHistoryScreen({ navigation }: any) {
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: orders,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMyOrders(statusFilter || undefined);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const allOrders = orders || [];

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
      <FlatList
        data={allOrders}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.filters}>
            <Text variant="titleMedium" style={styles.title}>
              Mis pedidos
            </Text>
            <FlatList
              horizontal
              data={ORDER_STATUSES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Chip
                  selected={statusFilter === item.value}
                  onPress={() => setStatusFilter(item.value)}
                  style={styles.chip}
                >
                  {item.label}
                </Chip>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() =>
              navigation.navigate('ActiveOrder', { orderId: item._id })
            }
          >
            <Card.Content>
              <View style={styles.cardRow}>
                <Text variant="bodyMedium">
                  {item.quantity} garrafón(es)
                </Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  ${item.total}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text variant="bodySmall" style={styles.status}>
                  {STATUS_LABELS[item.status] || item.status}
                </Text>
                <Text variant="bodySmall">
                  {new Date(item.createdAt).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        ListFooterComponent={
          hasNextPage ? (
            <Button onPress={() => fetchNextPage()} mode="text">
              Cargar más
            </Button>
          ) : null
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No hay pedidos</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center' },
  filters: { padding: 16, paddingBottom: 8 },
  title: { marginBottom: 12 },
  chip: { marginRight: 8 },
  card: { marginHorizontal: 16, marginBottom: 8 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  amount: { fontWeight: 'bold' },
  status: { opacity: 0.6 },
  empty: { textAlign: 'center', marginTop: 48, opacity: 0.5 },
});
