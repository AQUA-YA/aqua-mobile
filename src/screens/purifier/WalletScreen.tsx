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
import { useWallet, useWithdraw, useTransactions } from '../../hooks/useWallet';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';

export function PurifierWalletScreen() {
  const theme = useTheme();
  const { data: walletData, isLoading, isError, refetch, isRefetching } = useWallet();
  const withdrawMutation = useWithdraw();
  const { data: txData } = useTransactions();
  const showSnackbar = useSnackbarStore((s) => s.show);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');

  const wallet = walletData?.data?.data;
  const transactions = txData?.data?.data?.data || [];

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) {
      showSnackbar('Monto inválido', true);
      return;
    }
    if (wallet && amt > wallet.balance) {
      showSnackbar('Saldo insuficiente', true);
      return;
    }
    try {
      await withdrawMutation.mutateAsync(amt);
      setShowWithdraw(false);
      setAmount('');
      showSnackbar('Solicitud de retiro enviada');
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
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text variant="bodySmall">Ganado</Text>
                <Text variant="bodyMedium">
                  ${wallet?.totalEarned?.toFixed(2) || '0.00'}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text variant="bodySmall">Retirado</Text>
                <Text variant="bodyMedium">
                  ${wallet?.totalSpent?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => setShowWithdraw(true)}
          style={styles.withdrawButton}
        >
          Retirar fondos
        </Button>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Movimientos
        </Text>

        {transactions.slice(0, 20).map((tx) => (
          <Card key={tx._id} style={styles.txCard}>
            <Card.Content style={styles.txRow}>
              <View>
                <Text variant="bodyMedium">{tx.type}</Text>
                <Text variant="bodySmall">
                  {new Date(tx.createdAt).toLocaleDateString('es-MX')}
                </Text>
              </View>
              <Text
                variant="bodyMedium"
                style={{
                  color: tx.amount > 0 ? '#388E3C' : '#D32F2F',
                  fontWeight: 'bold',
                }}
              >
                {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        ))}

        <Portal>
          <Dialog
            visible={showWithdraw}
            onDismiss={() => setShowWithdraw(false)}
          >
            <Dialog.Title>Retirar fondos</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Monto a retirar"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                mode="outlined"
              />
              <Text variant="bodySmall" style={styles.hint}>
                Saldo disponible: ${wallet?.balance?.toFixed(2)}
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowWithdraw(false)}>Cancelar</Button>
              <Button
                onPress={handleWithdraw}
                loading={withdrawMutation.isPending}
              >
                Retirar
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  stat: { alignItems: 'center' },
  withdrawButton: { marginBottom: 24 },
  sectionTitle: { marginBottom: 8, fontWeight: 'bold' },
  txCard: { marginBottom: 4 },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hint: { marginTop: 8, opacity: 0.6 },
});
