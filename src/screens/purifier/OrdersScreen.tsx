import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders.api';
import { ErrorState } from '../../components/ErrorState';

export function PurifierOrdersScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const {
    data: available,
    isLoading: loadingAvailable,
    isError: errorAvailable,
    refetch: refetchAvailable,
    isRefetching: refetchingAvailable,
  } = useQuery({
    queryKey: ['orders', 'available', 'purifier'],
    queryFn: () => ordersApi.getAvailable({ lat: 19.4326, lng: -99.1332, radiusKm: 10 }),
  });

  const { data: assigned, isLoading: loadingAssigned } = useQuery({
    queryKey: ['orders', 'assigned', 'purifier'],
    queryFn: () => ordersApi.getMine({ status: 'accepted' }),
  });

  const acceptMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.accept(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const availableOrders = available?.data?.data || [];
  const assignedOrders = assigned?.data?.data || [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={assignedOrders}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <>
            <Text variant="titleLarge" style={styles.title}>
              Pedidos disponibles
            </Text>
            {errorAvailable ? (
              <ErrorState
                fullScreen={false}
                onRetry={() => refetchAvailable()}
                retrying={refetchingAvailable}
              />
            ) : loadingAvailable ? (
              <ActivityIndicator style={styles.loading} />
            ) : availableOrders.length === 0 ? (
              <Text style={styles.emptyText}>No hay pedidos disponibles</Text>
            ) : (
              availableOrders.map((order) => (
                <Card key={order._id} style={styles.card}>
                  <Card.Content>
                    <View style={styles.cardRow}>
                      <Text variant="bodyMedium">
                        {order.quantity} garrafón(es)
                      </Text>
                      <Text variant="bodyMedium" style={styles.amount}>
                        ${order.total}
                      </Text>
                    </View>
                    <Text variant="bodySmall">
                      {order.deliveryAddress.street}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => acceptMutation.mutate(order._id)}
                      loading={acceptMutation.isPending}
                      style={styles.acceptButton}
                    >
                      Aceptar
                    </Button>
                  </Card.Content>
                </Card>
              ))
            )}

            <Text variant="titleLarge" style={[styles.title, styles.assignedTitle]}>
              Mis pedidos activos
            </Text>
            {loadingAssigned ? (
              <ActivityIndicator style={styles.loading} />
            ) : assignedOrders.length === 0 ? (
              <Text style={styles.emptyText}>No hay pedidos activos</Text>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardRow}>
                <Text variant="bodyMedium">
                  {item.quantity} garrafón(es)
                </Text>
                <Chip>
                  {item.status === 'accepted'
                    ? 'Aceptado'
                    : item.status === 'in_transit'
                      ? 'En reparto'
                      : item.status}
                </Chip>
              </View>
              <Text variant="bodySmall">
                {item.deliveryAddress.street}
              </Text>
              <Text variant="bodySmall">
                ${item.total} - {item.paymentMethod === 'cash' ? 'Efectivo' : 'Monedero'}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { margin: 16 },
  title: { padding: 16, paddingBottom: 8, fontWeight: 'bold' },
  assignedTitle: { marginTop: 16 },
  card: { marginHorizontal: 16, marginBottom: 8 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amount: { fontWeight: 'bold', color: '#0077B6' },
  acceptButton: { marginTop: 8 },
  emptyText: { textAlign: 'center', padding: 16, opacity: 0.5 },
});
