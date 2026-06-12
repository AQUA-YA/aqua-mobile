import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeliveryHistory } from '../../hooks/useDelivery';
import { ErrorState } from '../../components/ErrorState';

export function DeliveryHistoryScreen(_props: any) {
  const theme = useTheme();
  const { data, isLoading, isError, refetch, isRefetching } =
    useDeliveryHistory();

  const deliveries = data?.data?.data?.data || [];

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
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
        data={deliveries}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <Text variant="titleLarge" style={styles.title}>
            Mis entregas
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardRow}>
                <Text variant="bodyMedium">
                  {item.quantity} garrafón(es)
                </Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  ${item.total}
                </Text>
              </View>
              <Text variant="bodySmall">
                {item.deliveryAddress.street}
              </Text>
              <Text variant="bodySmall">
                {new Date(item.createdAt).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text variant="bodySmall">
                Pago: {item.paymentMethod === 'cash' ? 'Efectivo' : 'Monedero'}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay entregas aún</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center' },
  title: { padding: 16, fontWeight: 'bold' },
  card: { marginHorizontal: 16, marginBottom: 8 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amount: { fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 48, opacity: 0.5 },
});
