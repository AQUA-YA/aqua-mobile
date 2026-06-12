import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Chip,
  Button,
  Dialog,
  Portal,
  TextInput,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminSupportTickets, useUpdateSupportTicket } from '../../hooks/useAdmin';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';
import type { SupportTicket } from '../../types/models';

const STATUS_COLORS: Record<string, string> = {
  open: '#FFA000',
  in_progress: '#1976D2',
  closed: '#388E3C',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En progreso',
  closed: 'Cerrado',
};

export function AdminSupportScreen() {
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showRespond, setShowRespond] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [ticketStatus, setTicketStatus] = useState<'open' | 'in_progress' | 'closed'>('open');
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useAdminSupportTickets({ status: statusFilter || undefined, page, limit: 20 });
  const updateMutation = useUpdateSupportTicket();

  const tickets = data?.data?.data || [];
  const meta = data?.data?.meta;

  const showMsg = (msg: string) => {
    setSnackbarMsg(msg);
  };

  const handleOpenDetail = (t: SupportTicket) => {
    setSelected(t);
    setShowDetail(true);
  };

  const handleOpenRespond = () => {
    if (!selected) return;
    setAdminResponse('');
    setTicketStatus(selected.status);
    setShowDetail(false);
    setShowRespond(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      await updateMutation.mutateAsync({
        id: selected._id,
        data: {
          status: ticketStatus,
          adminResponse: adminResponse || undefined,
        },
      });
      setShowRespond(false);
      showMsg('Ticket actualizado');
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  const handleCloseTicket = async () => {
    if (!selected) return;
    try {
      await updateMutation.mutateAsync({
        id: selected._id,
        data: { status: 'closed' },
      });
      setShowDetail(false);
      showMsg('Ticket cerrado');
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  if (isLoading && page === 1) {
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
      <View style={styles.chipRow}>
        {['', 'open', 'in_progress', 'closed'].map(s => (
          <Chip
            key={s}
            selected={statusFilter === s}
            onPress={() => { setStatusFilter(s); setPage(1); }}
            style={styles.chip}
          >
            {s === '' ? 'Todos' : STATUS_LABELS[s] || s}
          </Chip>
        ))}
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold', flex: 1 }} numberOfLines={1}>
                  {item.subject}
                </Text>
                <Chip
                  style={{ backgroundColor: STATUS_COLORS[item.status] + '22' }}
                  textStyle={{ color: STATUS_COLORS[item.status], fontSize: 11 }}
                >
                  {STATUS_LABELS[item.status]}
                </Chip>
              </View>
              <Text variant="bodySmall" numberOfLines={2} style={styles.descText}>
                {item.description}
              </Text>
              <Text variant="bodySmall" style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString('es-MX')}
              </Text>
              <Button compact onPress={() => handleOpenDetail(item)}>Ver detalle</Button>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (meta && page < meta.totalPages) setPage(p => p + 1);
        }}
      />

      <Portal>
        <Dialog visible={showDetail} onDismiss={() => setShowDetail(false)}>
          <Dialog.Title>Ticket de soporte</Dialog.Title>
          <Dialog.Content>
            {selected && (
              <>
                <Text variant="titleMedium">{selected.subject}</Text>
                <Text variant="bodyMedium" style={{ marginTop: 8 }}>{selected.description}</Text>
                {selected.adminResponse && (
                  <Card style={styles.responseCard}>
                    <Card.Content>
                      <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>Respuesta:</Text>
                      <Text variant="bodySmall">{selected.adminResponse}</Text>
                    </Card.Content>
                  </Card>
                )}
                <Text variant="bodySmall" style={styles.dateText}>
                  {new Date(selected.createdAt).toLocaleDateString('es-MX')}
                </Text>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            {selected?.status !== 'closed' && (
              <>
                <Button onPress={handleOpenRespond}>Responder</Button>
                <Button onPress={handleCloseTicket} textColor="#388E3C">Cerrar</Button>
              </>
            )}
            <Button onPress={() => setShowDetail(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showRespond} onDismiss={() => setShowRespond(false)}>
          <Dialog.Title>Responder ticket</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Respuesta"
              value={adminResponse}
              onChangeText={setAdminResponse}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <View style={styles.statusRow}>
              {(['open', 'in_progress', 'closed'] as const).map(s => (
                <Chip
                  key={s}
                  selected={ticketStatus === s}
                  onPress={() => setTicketStatus(s)}
                  style={styles.statusChip}
                >
                  {STATUS_LABELS[s]}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRespond(false)}>Cancelar</Button>
            <Button onPress={handleSave} loading={updateMutation.isPending}>Guardar</Button>
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
  chipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8, flexWrap: 'wrap' },
  chip: { marginBottom: 4 },
  list: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  descText: { opacity: 0.7, marginVertical: 4 },
  dateText: { opacity: 0.5, fontSize: 11 },
  responseCard: { marginTop: 8, backgroundColor: '#E8F5E9' },
  input: { marginBottom: 12 },
  statusRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statusChip: { marginBottom: 4 },
});
