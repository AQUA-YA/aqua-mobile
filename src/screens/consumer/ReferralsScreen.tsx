import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, useTheme, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyReferrals } from '../../hooks/useBusiness';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { ErrorState } from '../../components/ErrorState';

export function ReferralsScreen() {
  const theme = useTheme();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { data: referralsData, isLoading, isError, refetch, isRefetching } =
    useMyReferrals();

  const info = referralsData?.data?.data;

  const handleCopyCode = () => {
    showSnackbar('Código copiado (simulado)');
  };

  const handleShare = () => {
    showSnackbar('Compartir enlace (próximamente)');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.balanceCard}>
          <Card.Content style={styles.balanceContent}>
            <Text variant="titleMedium">Tus referidos</Text>
            {isLoading ? (
              <Text variant="bodyMedium">Cargando...</Text>
            ) : isError ? (
              <ErrorState
                fullScreen={false}
                onRetry={() => refetch()}
                retrying={isRefetching}
              />
            ) : (
              <>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text
                      variant="headlineSmall"
                      style={{ fontWeight: 'bold', color: theme.colors.primary }}
                    >
                      {info?.totalReferrals ?? 0}
                    </Text>
                    <Text variant="bodySmall">Total invitados</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text
                      variant="headlineSmall"
                      style={{ fontWeight: 'bold', color: theme.colors.primary }}
                    >
                      ${(info?.totalBonusEarned ?? 0).toFixed(2)}
                    </Text>
                    <Text variant="bodySmall">Ganado total</Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text
                      variant="headlineSmall"
                      style={{ fontWeight: 'bold', color: theme.colors.primary }}
                    >
                      ${(info?.currentMonthBonus ?? 0).toFixed(2)}
                    </Text>
                    <Text variant="bodySmall">Este mes</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text
                      variant="headlineSmall"
                      style={{ fontWeight: 'bold', color: theme.colors.primary }}
                    >
                      ${(info?.monthlyCap ?? 0).toFixed(2)}
                    </Text>
                    <Text variant="bodySmall">Tope mensual</Text>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              Comparte tu código y gana $10 por cada amigo que se registre y haga
              su primer pedido
            </Text>
            <Button
              mode="contained"
              onPress={handleCopyCode}
              style={{ marginBottom: 8 }}
            >
              Copiar código de referido
            </Button>
            <Button mode="outlined" onPress={handleShare}>
              Compartir enlace
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  balanceCard: { marginBottom: 24 },
  balanceContent: { alignItems: 'center', paddingVertical: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 16 },
  stat: { alignItems: 'center' },
  card: { marginBottom: 8 },
});
