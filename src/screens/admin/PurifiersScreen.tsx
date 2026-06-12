import React, { useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Button,
  Dialog,
  Portal,
  Snackbar,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purifiersApi } from '../../api/purifiers.api';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';
import type { Purifier } from '../../types/models';

export function AdminPurifiersScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Purifier | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['admin', 'purifiers'],
    queryFn: () => purifiersApi.getMine(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => purifiersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purifiers'] });
    },
  });

  const purifiers = data?.data?.data || [];

  const showMsg = (msg: string) => {
    setSnackbarMsg(msg);
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected._id);
      setShowDetail(false);
      showMsg('Purificadora eliminada');
    } catch (err) {
      showMsg(getErrorMessage(err));
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={purifiers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <List.Item
                title={item.name}
                description={`${item.address}  •  ${item.deliveryFee ? `Envío: $${item.deliveryFee}` : 'Sin envío'}`}
                left={() => <List.Icon icon="store" />}
                onPress={() => {
                  setSelected(item);
                  setShowDetail(true);
                }}
              />
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay purificadoras registradas</Text>
        }
        contentContainerStyle={styles.list}
      />

      <Portal>
        <Dialog visible={showDetail} onDismiss={() => setShowDetail(false)}>
          <Dialog.Title>Purificadora</Dialog.Title>
          <Dialog.Content>
            {selected && (
              <>
                <Text variant="titleMedium">{selected.name}</Text>
                <Text variant="bodyMedium">{selected.address}</Text>
                {selected.phone && <Text variant="bodySmall">Tel: {selected.phone}</Text>}
                {selected.schedule && <Text variant="bodySmall">Horario: {selected.schedule}</Text>}
                {selected.averageRating && (
                  <Text variant="bodySmall">★ {selected.averageRating.toFixed(1)}</Text>
                )}
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={handleDelete}
              textColor="#D32F2F"
              loading={deleteMutation.isPending}
            >
              Eliminar
            </Button>
            <Button onPress={() => setShowDetail(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  loading: { flex: 1, justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 48, opacity: 0.5 },
});
