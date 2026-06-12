import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Button,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboardMetrics, useDashboardHeatmap } from '../../hooks/useAdmin';
import { ErrorState } from '../../components/ErrorState';

function StatCard({ title, value }: { title: string; value: string | number }) {
  const theme = useTheme();
  return (
    <Card style={styles.statCard}>
      <Card.Content style={styles.statContent}>
        <Text
          variant="displaySmall"
          style={[styles.statValue, { color: theme.colors.primary }]}
        >
          {value}
        </Text>
        <Text variant="bodySmall" style={styles.statLabel}>
          {title}
        </Text>
      </Card.Content>
    </Card>
  );
}

export function AdminDashboardScreen({ navigation }: any) {
  const theme = useTheme();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');

  // Memoizado por `period`: si se recalculara en cada render, `to` (la hora
  // actual) cambiaría siempre, generando una queryKey nueva en cada render y un
  // bucle infinito de fetch (spinner que nunca termina).
  const dateParams = useMemo(() => {
    const now = new Date();
    if (period === 'week') {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    if (period === 'month') {
      const from = new Date(now);
      from.setMonth(from.getMonth() - 1);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    return undefined;
  }, [period]);

  const {
    data: metricsData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useDashboardMetrics(dateParams);
  const { data: heatmapData } = useDashboardHeatmap(dateParams);

  const metrics = metricsData?.data?.data;

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
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Dashboard Admin
        </Text>

        <View style={styles.chipRow}>
          {(['week', 'month', 'all'] as const).map(p => (
            <Chip
              key={p}
              selected={period === p}
              onPress={() => setPeriod(p)}
              style={styles.chip}
            >
              {p === 'week' ? '7 días' : p === 'month' ? '30 días' : 'Todo'}
            </Chip>
          ))}
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Usuarios" value={metrics?.totalUsers ?? 0} />
          <StatCard title="Pedidos" value={metrics?.totalOrders ?? 0} />
          <StatCard
            title="Ingresos"
            value={`$${(metrics?.totalRevenue ?? 0).toFixed(0)}`}
          />
          <StatCard
            title="Suscripciones"
            value={metrics?.activeSubscriptions ?? 0}
          />
          <StatCard title="Referidos" value={metrics?.totalReferrals ?? 0} />
          <StatCard title="KYC pendientes" value={metrics?.pendingKycs ?? 0} />
        </View>

        {metrics?.topPurifiers && metrics.topPurifiers.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Top Purificadoras
              </Text>
              {metrics.topPurifiers.map((p, i) => (
                <View key={p._id} style={styles.topItem}>
                  <Text variant="bodyMedium">
                    {i + 1}. {p.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.topCount}>
                    {p.orderCount} pedidos
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {heatmapData?.data?.data && heatmapData.data.data.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Mapa de calor - {heatmapData.data.data.length} zonas
              </Text>
              <Text variant="bodySmall" style={styles.heatmapHint}>
                Hay {heatmapData.data.data.reduce((s, p) => s + p.count, 0)}{' '}
                pedidos en las zonas activas
              </Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.quickActions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AdminUsers')}
            style={styles.actionBtn}
          >
            Usuarios
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AdminOrders')}
            style={styles.actionBtn}
          >
            Pedidos
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AdminPurifiers')}
            style={styles.actionBtn}
          >
            Purificadoras
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  chip: { marginBottom: 4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: { flex: 1, minWidth: '45%' },
  statContent: { alignItems: 'center', padding: 12 },
  statValue: { fontWeight: 'bold' },
  statLabel: { opacity: 0.7, marginTop: 4 },
  sectionCard: { marginBottom: 16 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 8 },
  topItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  topCount: { opacity: 0.6 },
  heatmapHint: { opacity: 0.6, fontStyle: 'italic' },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: { flex: 1, minWidth: '30%' },
});
