import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Share } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  Button,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminApi } from '../../api/admin.api';
import { getErrorMessage } from '../../api/client';

const REPORT_OPTIONS = [
  { key: 'users' as const, title: 'Usuarios', icon: 'account-multiple', desc: 'Lista completa de usuarios registrados' },
  { key: 'orders' as const, title: 'Pedidos', icon: 'clipboard-list', desc: 'Historial de todos los pedidos' },
  { key: 'sales' as const, title: 'Ventas', icon: 'cash', desc: 'Reporte de ventas por período' },
  { key: 'commissions' as const, title: 'Comisiones', icon: 'percent', desc: 'Comisiones generadas por período' },
];

export function AdminReportsScreen() {
  const theme = useTheme();
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: 'users' | 'orders' | 'sales' | 'commissions') => {
    setDownloading(type);
    try {
      const response = await adminApi.getReport(type);
      const csvContent = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

      await Share.share({
        message: csvContent,
        title: `Reporte ${type}.csv`,
      });
      setSnackbarMsg('Reporte generado');
    } catch (err) {
      setSnackbarMsg(getErrorMessage(err));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Reportes
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Descarga reportes en formato CSV para su análisis
        </Text>

        {REPORT_OPTIONS.map((opt) => (
          <Card key={opt.key} style={styles.card}>
            <Card.Content>
              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text variant="titleMedium">{opt.title}</Text>
                  <Text variant="bodySmall" style={styles.desc}>
                    {opt.desc}
                  </Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => handleDownload(opt.key)}
                  loading={downloading === opt.key}
                  disabled={!!downloading}
                >
                  CSV
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}

        <Card style={styles.noteCard}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.noteText}>
              Los reportes CSV se pueden abrir en Excel, Google Sheets o cualquier editor de hojas de cálculo.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

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
  content: { padding: 16, paddingBottom: 32 },
  title: { fontWeight: 'bold', marginBottom: 8 },
  subtitle: { opacity: 0.7, marginBottom: 24 },
  card: { marginBottom: 12 },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, marginRight: 16 },
  desc: { opacity: 0.6, marginTop: 4 },
  noteCard: { backgroundColor: '#E3F2FD', marginTop: 24 },
  noteText: { textAlign: 'center', opacity: 0.7 },
});
