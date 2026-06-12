import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  useTheme,
  ActivityIndicator,
  List,
  Dialog,
  Portal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet, useDeposit, useTransactions } from '../../hooks/useWallet';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';

const TRANSACTION_LABELS: Record<string, string> = {
  deposit: 'Depósito',
  payment: 'Pago',
  earning: 'Cobro',
  commission: 'Comisión',
  withdrawal: 'Retiro',
  referral_bonus: 'Bono referido',
  points_redemption: 'Canje puntos',
  refund: 'Reembolso',
};

export function ConsumerWalletScreen() {
  const theme = useTheme();
  const { data: walletData, isLoading, isError, refetch, isRefetching } =
    useWallet();
  const depositMutation = useDeposit();
  const { data: transactionsData } = useTransactions();
  const showSnackbar = useSnackbarStore((s) => s.show);

  const [showDeposit, setShowDeposit] = useState(false);
  const [amount, setAmount] = useState('');
  // const [filterType] = useState('');

  const wallet = walletData?.data?.data;
  const transactions = transactionsData?.data?.data?.data || [];

  const handleDeposit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) {
      showSnackbar('El monto mínimo es $1', true);
      return;
    }
    try {
      await depositMutation.mutateAsync(amt);
      setShowDeposit(false);
      setAmount('');
      showSnackbar('Depósito solicitado exitosamente');
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.balanceCard}>
          <Card.Content style={styles.balanceContent}>
            <Text variant="titleMedium" style={styles.balanceLabel}>
              Saldo disponible
            </Text>
            <Text variant="headlineLarge" style={styles.balanceAmount}>
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </Text>
            <View style={styles.balanceStats}>
              <View style={styles.stat}>
                <Text variant="bodySmall">Depositado</Text>
                <Text variant="bodyMedium">
                  ${wallet?.totalDeposited?.toFixed(2) || '0.00'}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text variant="bodySmall">Gastado</Text>
                <Text variant="bodyMedium">
                  ${wallet?.totalSpent?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => setShowDeposit(true)}
          style={styles.depositButton}
        >
          Depositar
        </Button>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Movimientos recientes
        </Text>

        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay movimientos aún
          </Text>
        ) : (
          transactions.slice(0, 20).map((tx) => (
            <List.Item
              key={tx._id}
              title={TRANSACTION_LABELS[tx.type] || tx.type}
              description={new Date(tx.createdAt).toLocaleDateString('es-MX')}
              right={() => (
                <Text
                  variant="bodyMedium"
                  style={{
                    color: tx.amount > 0 ? '#388E3C' : '#D32F2F',
                    fontWeight: 'bold',
                  }}
                >
                  {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                </Text>
              )}
            />
          ))
        )}

        <Portal>
          <Dialog visible={showDeposit} onDismiss={() => setShowDeposit(false)}>
            <Dialog.Title>Depositar</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Monto"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                mode="outlined"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDeposit(false)}>Cancelar</Button>
              <Button
                onPress={handleDeposit}
                loading={depositMutation.isPending}
              >
                Depositar
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
  balanceCard: { marginBottom: 16 },
  balanceContent: { alignItems: 'center', padding: 16 },
  balanceLabel: { opacity: 0.7 },
  balanceAmount: { fontWeight: 'bold', color: '#0077B6', marginVertical: 8 },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  stat: { alignItems: 'center' },
  depositButton: { marginBottom: 24 },
  sectionTitle: { marginBottom: 8 },
  emptyText: { textAlign: 'center', opacity: 0.5, marginTop: 24 },
});
