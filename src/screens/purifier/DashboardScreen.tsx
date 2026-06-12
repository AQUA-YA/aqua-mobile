import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { purifiersApi } from '../../api/purifiers.api';
import { ErrorState } from '../../components/ErrorState';

export function PurifierDashboardScreen({ navigation }: any) {
  const theme = useTheme();
  const [selectedPurifierId, setSelectedPurifierId] = useState<string | null>(null);

  const { data: myPurifiers, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['purifiers', 'mine'],
    queryFn: () => purifiersApi.getMine(),
  });

  const purifiers = myPurifiers?.data?.data || [];

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

  if (purifiers.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No tienes purificadoras registradas
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Registra tu primera purificadora para comenzar a recibir pedidos
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Business')}
          >
            Registrar purificadora
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const activePurifier = selectedPurifierId
    ? purifiers.find((p) => p._id === selectedPurifierId)
    : purifiers[0];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Dashboard
        </Text>

        <Card style={styles.purifierSelector}>
          <Card.Content>
            <Text variant="titleMedium">Purificadora activa</Text>
            {purifiers.map((p) => (
              <List.Item
                key={p._id}
                title={p.name}
                description={p.address}
                onPress={() => setSelectedPurifierId(p._id)}
                right={() =>
                  (activePurifier?._id === p._id) ? (
                    <List.Icon icon="check-circle" color={theme.colors.primary} />
                  ) : null
                }
              />
            ))}
          </Card.Content>
        </Card>

        {activePurifier && (
          <>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleMedium">{activePurifier.name}</Text>
                <Text variant="bodySmall">{activePurifier.address}</Text>
                {activePurifier.averageRating && (
                  <Text variant="bodyMedium">
                    ★ {activePurifier.averageRating.toFixed(1)}
                  </Text>
                )}
              </Card.Content>
            </Card>

            <View style={styles.quickActions}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('PurifierOrders')}
                style={styles.actionButton}
              >
                Pedidos
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Business')}
                style={styles.actionButton}
              >
                Administrar
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { textAlign: 'center', marginBottom: 24, opacity: 0.7 },
  content: { padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  purifierSelector: { marginBottom: 16 },
  summaryCard: { marginBottom: 16 },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: { flex: 1, marginHorizontal: 4 },
});
