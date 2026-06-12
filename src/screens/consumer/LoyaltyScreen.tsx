import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, useTheme, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyLoyalty } from '../../hooks/useBusiness';
import { ErrorState } from '../../components/ErrorState';

const EXCHANGE_RATES = [
  { points: 100, benefit: '$10 de descuento' },
  { points: 250, benefit: '$30 de descuento' },
  { points: 500, benefit: 'Garrafón gratis (20L)' },
  { points: 1000, benefit: 'Garrafón gratis (20L) ×2' },
];

export function LoyaltyScreen() {
  const theme = useTheme();
  const { data: loyaltyData, isLoading, isError, refetch, isRefetching } =
    useMyLoyalty();

  const loyalty = loyaltyData?.data?.data;
  const totalPoints = loyalty?.totalPoints ?? 0;
  const entries = loyalty?.entries?.data ?? [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.balanceCard}>
          <Card.Content style={styles.balanceContent}>
            <Text variant="titleMedium">Tus puntos</Text>
            <Text
              variant="displaySmall"
              style={{ fontWeight: 'bold', marginVertical: 8, color: theme.colors.primary }}
            >
              {totalPoints}
            </Text>
            <Text variant="bodySmall">
              Puntos acumulados · Vencen a los 90 días
            </Text>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Tabla de canje
        </Text>
        {EXCHANGE_RATES.map((rate, idx) => (
          <Card key={idx} style={styles.card}>
            <Card.Content>
              <View style={styles.exchangeRow}>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                  {rate.points} pts
                </Text>
                <Text variant="bodyMedium" style={{ marginLeft: 12 }}>
                  {rate.benefit}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Historial
        </Text>

        {isLoading && <Text variant="bodyMedium">Cargando...</Text>}

        {isError && (
          <ErrorState
            fullScreen={false}
            onRetry={() => refetch()}
            retrying={isRefetching}
          />
        )}

        {!isLoading && !isError && entries.length === 0 && (
          <Text variant="bodyMedium" style={{ textAlign: 'center', marginVertical: 24 }}>
            Sin movimientos de puntos aún
          </Text>
        )}

        {entries.map((entry) => (
          <List.Item
            key={entry._id}
            title={`${entry.type === 'earned' ? '+' : '-'}${entry.points} pts`}
            description={
              entry.reference ||
              (entry.type === 'earned'
                ? 'Ganados'
                : entry.type === 'redeemed'
                  ? 'Canjeados'
                  : 'Vencidos')
            }
            left={(props) => (
              <List.Icon
                {...props}
                icon={
                  entry.type === 'earned'
                    ? 'plus-circle'
                    : entry.type === 'redeemed'
                      ? 'minus-circle'
                      : 'clock-outline'
                }
              />
            )}
            right={() => (
              <Text variant="bodySmall">
                {new Date(entry.createdAt).toLocaleDateString()}
              </Text>
            )}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  balanceCard: { marginBottom: 24 },
  balanceContent: { alignItems: 'center', paddingVertical: 16 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  card: { marginBottom: 8 },
  exchangeRow: { flexDirection: 'row', alignItems: 'center' },
});
