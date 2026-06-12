import React, { useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAvailableOrders, useAcceptOrder } from '../../hooks/useDelivery';
import { useKyc } from '../../hooks/useDelivery';
import { getErrorMessage } from '../../api/client';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { ErrorState } from '../../components/ErrorState';

export function AvailableScreen({ navigation }: any) {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { data: kycData } = useKyc();
  const {
    data: ordersData,
    refetch,
    isLoading,
    isError,
    isRefetching,
  } = useAvailableOrders({
    lat: 19.4326,
    lng: -99.1332,
    radiusKm: 10,
  });
  const acceptMutation = useAcceptOrder();
  const showSnackbar = useSnackbarStore((s) => s.show);

  const kycStatus = kycData?.data?.data?.status;
  const kycApproved = kycStatus === 'approved';
  const orders = ordersData?.data?.data || [];

  const handleAccept = async (orderId: string) => {
    try {
      await acceptMutation.mutateAsync(orderId);
      showSnackbar('Pedido aceptado');
      navigation.navigate('Active', { orderId });
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!kycApproved) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.centerContent}>
          <Text variant="headlineSmall" style={styles.kycWarning}>
            {!kycStatus
              ? 'Completa tu verificación KYC para aceptar pedidos'
              : kycStatus === 'pending'
                ? 'Tu verificación está pendiente de aprobación'
                : 'Tu verificación fue rechazada. Vuelve a intentar'}
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('DeliveryProfile')}
          >
            Ir a KYC
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Text variant="titleLarge" style={styles.title}>
            Pedidos disponibles
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium">
                  {item.quantity} garrafón(es)
                </Text>
                <Text variant="titleMedium" style={styles.amount}>
                  ${item.total}
                </Text>
              </View>
              <Text variant="bodySmall">
                Pago: {item.paymentMethod === 'cash' ? 'Efectivo' : 'Monedero'}
              </Text>
              <Text variant="bodySmall">
                {item.deliveryAddress.street}
              </Text>
              <Button
                mode="contained"
                onPress={() => handleAccept(item._id)}
                loading={acceptMutation.isPending}
                disabled={acceptMutation.isPending}
                style={styles.acceptButton}
              >
                Aceptar pedido
              </Button>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          isError ? (
            <ErrorState
              fullScreen={false}
              onRetry={() => refetch()}
              retrying={isRefetching}
            />
          ) : !isLoading ? (
            <Text style={styles.emptyText}>
              No hay pedidos disponibles cerca
            </Text>
          ) : (
            <ActivityIndicator style={styles.loading} />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  kycWarning: { textAlign: 'center', marginBottom: 16 },
  title: { padding: 16, fontWeight: 'bold' },
  card: { marginHorizontal: 16, marginBottom: 8 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: { fontWeight: 'bold', color: '#0077B6' },
  acceptButton: { marginTop: 12 },
  emptyText: { textAlign: 'center', marginTop: 48, opacity: 0.5 },
  loading: { marginTop: 24 },
});
