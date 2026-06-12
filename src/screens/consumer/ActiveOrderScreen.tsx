import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
  TextInput,
  Dialog,
  Portal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrder, useCancelOrder } from '../../hooks/useOrders';
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

export function ActiveOrderScreen({ route, navigation }: any) {
  const theme = useTheme();
  const { orderId } = route.params;
  const { data, isLoading, isError, refetch, isRefetching } = useOrder(orderId);
  const cancelMutation = useCancelOrder();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const order = data?.data?.data;

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        id: orderId,
        reason: cancelReason || 'Cancelado por el usuario',
      });
      setShowCancelDialog(false);
      showSnackbar('Pedido cancelado');
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
    return <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} />;
  }

  const canCancel = order.status !== 'delivered' && order.status !== 'cancelled';
  const isActive = order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.statusCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.statusText}>
              {STATUS_LABELS[order.status] || order.status}
            </Text>
            {isActive && (
              <ActivityIndicator
                style={styles.liveIndicator}
                size="small"
              />
            )}
          </Card.Content>
        </Card>

        <Card style={styles.detailCard}>
          <Card.Content>
            <View style={styles.row}>
              <Text variant="bodyMedium">Cantidad:</Text>
              <Text variant="bodyMedium">{order.quantity} garrafón(es)</Text>
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium">Total:</Text>
              <Text variant="bodyMedium">${order.total}</Text>
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium">Método de pago:</Text>
              <Text variant="bodyMedium">
                {order.paymentMethod === 'cash' ? 'Efectivo' : 'Monedero'}
              </Text>
            </View>
            {order.tip ? (
              <View style={styles.row}>
                <Text variant="bodyMedium">Propina:</Text>
                <Text variant="bodyMedium">${order.tip}</Text>
              </View>
            ) : null}
            <View style={styles.row}>
              <Text variant="bodyMedium">Dirección:</Text>
              <Text variant="bodySmall">
                {order.deliveryAddress.street}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => refetch()}
          style={styles.refreshButton}
        >
          Actualizar
        </Button>

        {canCancel && (
          <Button
            mode="text"
            textColor={theme.colors.error}
            onPress={() => setShowCancelDialog(true)}
            style={styles.cancelButton}
          >
            Cancelar pedido
          </Button>
        )}

        <Portal>
          <Dialog
            visible={showCancelDialog}
            onDismiss={() => setShowCancelDialog(false)}
          >
            <Dialog.Title>Cancelar pedido</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">
                ¿Estás seguro de cancelar este pedido?
              </Text>
              <TextInput
                label="Motivo (opcional)"
                value={cancelReason}
                onChangeText={setCancelReason}
                mode="outlined"
                style={styles.dialogInput}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowCancelDialog(false)}>
                No, mantener
              </Button>
              <Button
                textColor={theme.colors.error}
                onPress={handleCancel}
                loading={cancelMutation.isPending}
              >
                Sí, cancelar
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
  statusCard: { marginBottom: 16, alignItems: 'center' },
  statusText: { textAlign: 'center', fontWeight: 'bold', color: '#0077B6' },
  liveIndicator: { marginTop: 8 },
  detailCard: { marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  refreshButton: { marginTop: 8 },
  cancelButton: { marginTop: 16 },
  dialogInput: { marginTop: 12 },
});
