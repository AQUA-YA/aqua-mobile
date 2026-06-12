import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
  Dialog,
  Portal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrder } from '../../hooks/useOrders';
import { useDeliverOrder } from '../../hooks/useDelivery';
import { useOrderSocket } from '../../hooks/useOrderSocket';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  in_transit: 'En reparto',
  empty_pickup: 'Recogiendo vacío',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export function DeliveryActiveScreen({ route, navigation }: any) {
  const theme = useTheme();
  const { orderId } = route.params || {};
  const [showDeliverDialog, setShowDeliverDialog] = useState(false);
  const [emptyReturned, setEmptyReturned] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useOrder(orderId);
  const deliverMutation = useDeliverOrder();
  const showSnackbar = useSnackbarStore((s) => s.show);

  useOrderSocket({
    orderId,
    onStatusChange: () => refetch(),
  });

  const order = data?.data?.data;

  const handleUpdateStatus = async (status: string) => {
    try {
      const { ordersApi } = require('../../api/orders.api');
      await ordersApi.updateStatus(orderId, status);
      showSnackbar('Estado actualizado');
      refetch();
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  const handleDeliver = async () => {
    try {
      await deliverMutation.mutateAsync({
        orderId,
        emptyBottleReturned: emptyReturned,
      });
      setShowDeliverDialog(false);
      showSnackbar('Entrega completada');
      navigation.goBack();
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

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Text variant="bodyLarge">No hay pedido activo</Text>
        </View>
      </SafeAreaView>
    );
  }

  // status order for reference: pending, accepted, in_transit, empty_pickup, delivered

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.statusCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.statusText}>
              {STATUS_LABELS[order.status]}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.detailCard}>
          <Card.Content>
            <View style={styles.row}>
              <Text variant="bodyMedium">Cantidad:</Text>
              <Text variant="bodyMedium">{order.quantity} garrafón(es)</Text>
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium">Total a cobrar:</Text>
              <Text variant="bodyMedium" style={styles.amount}>
                ${order.total}
              </Text>
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium">Pago:</Text>
              <Text variant="bodyMedium">
                {order.paymentMethod === 'cash' ? 'Efectivo' : 'Monedero'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium">Dirección:</Text>
              <Text variant="bodySmall">
                {order.deliveryAddress.street}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.actionsTitle}>
              Acciones
            </Text>

            {order.status === 'accepted' && (
              <Button
                mode="contained"
                onPress={() => handleUpdateStatus('in_transit')}
                style={styles.actionButton}
              >
                Iniciar reparto
              </Button>
            )}

            {order.status === 'in_transit' && order.requiresEmptyPickup && (
              <Button
                mode="contained"
                onPress={() => handleUpdateStatus('empty_pickup')}
                style={styles.actionButton}
              >
                Recoger garrafón vacío
              </Button>
            )}

            {(order.status === 'in_transit' || order.status === 'empty_pickup') && (
              <Button
                mode="contained"
                onPress={() => setShowDeliverDialog(true)}
                style={styles.actionButton}
              >
                Marcar como entregado
              </Button>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => refetch()}
          style={styles.refreshButton}
        >
          Actualizar
        </Button>

        <Portal>
          <Dialog
            visible={showDeliverDialog}
            onDismiss={() => setShowDeliverDialog(false)}
          >
            <Dialog.Title>Confirmar entrega</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">
                ¿Estás seguro de marcar este pedido como entregado?
              </Text>
              {order.requiresEmptyPickup && (
                <View style={styles.switchRow}>
                  <Text variant="bodyMedium">Garrafón vacío devuelto</Text>
                  <Button
                    mode={emptyReturned ? 'contained' : 'outlined'}
                    compact
                    onPress={() => setEmptyReturned(!emptyReturned)}
                  >
                    {emptyReturned ? 'Sí' : 'No'}
                  </Button>
                </View>
              )}
              {order.paymentMethod === 'cash' && (
                <Text variant="bodySmall" style={styles.cashWarning}>
                  Recuerda cobrar ${order.total} en efectivo
                </Text>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDeliverDialog(false)}>
                Cancelar
              </Button>
              <Button
                onPress={handleDeliver}
                loading={deliverMutation.isPending}
              >
                Confirmar entrega
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
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  statusCard: { marginBottom: 16, alignItems: 'center' },
  statusText: { textAlign: 'center', fontWeight: 'bold', color: '#0077B6' },
  detailCard: { marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  amount: { fontWeight: 'bold', color: '#388E3C' },
  actionsCard: { marginBottom: 16 },
  actionsTitle: { marginBottom: 12 },
  actionButton: { marginBottom: 8 },
  refreshButton: { marginTop: 8 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  cashWarning: { color: '#D32F2F', marginTop: 8, fontStyle: 'italic' },
});
