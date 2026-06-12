import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Chip,
  Button,
  Dialog,
  Portal,
  TextInput,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKycVerifications, useReviewKyc } from '../../hooks/useAdmin';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';
import type { KycVerification } from '../../types/models';

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFA000',
  approved: '#388E3C',
  rejected: '#D32F2F',
};

export function AdminKycScreen() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<KycVerification | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useKycVerifications({ status: statusFilter || undefined, page, limit: 20 });
  const reviewMutation = useReviewKyc();

  const verifications = data?.data?.data || [];
  const meta = data?.data?.meta;

  const showMsg = (msg: string) => {
    setSnackbarMsg(msg);
  };

  const handleOpenReview = (v: KycVerification) => {
    setSelected(v);
    setReviewStatus('approved');
    setRejectionReason('');
    setShowReview(true);
  };

  const handleSubmitReview = async () => {
    if (!selected) return;
    try {
      await reviewMutation.mutateAsync({
        id: selected._id,
        data: { status: reviewStatus, rejectionReason: reviewStatus === 'rejected' ? rejectionReason : undefined },
      });
      setShowReview(false);
      showMsg(`KYC ${reviewStatus === 'approved' ? 'aprobado' : 'rechazado'}`);
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  if (isLoading && page === 1) {
    return (
      <SafeAreaView style={[styles.container]}>
        <ActivityIndicator style={styles.loading} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} retrying={isRefetching} />;
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.chipRow}>
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <Chip
            key={s}
            selected={statusFilter === s}
            onPress={() => { setStatusFilter(s); setPage(1); }}
            style={styles.chip}
          >
            {s === '' ? 'Todos' : s === 'pending' ? 'Pendientes' : s === 'approved' ? 'Aprobados' : 'Rechazados'}
          </Chip>
        ))}
      </View>

      <FlatList
        data={verifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="bodyMedium">ID: {item.userId.slice(-8)}</Text>
                <Chip
                  style={{ backgroundColor: STATUS_COLORS[item.status] + '22' }}
                  textStyle={{ color: STATUS_COLORS[item.status], fontSize: 12 }}
                >
                  {item.status === 'pending' ? 'Pendiente' : item.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                </Chip>
              </View>
              {item.rejectionReason && (
                <Text variant="bodySmall" style={styles.rejectionText}>
                  Motivo: {item.rejectionReason}
                </Text>
              )}
              {item.status === 'pending' && (
                <Button
                  mode="contained"
                  onPress={() => handleOpenReview(item)}
                  style={styles.reviewBtn}
                >
                  Revisar
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (meta && page < meta.totalPages) setPage(p => p + 1);
        }}
      />

      <Portal>
        <Dialog visible={showReview} onDismiss={() => setShowReview(false)}>
          <Dialog.Title>Revisar KYC</Dialog.Title>
          <Dialog.Content>
            <View style={styles.chipRow}>
              <Chip
                selected={reviewStatus === 'approved'}
                onPress={() => setReviewStatus('approved')}
              >
                Aprobar
              </Chip>
              <Chip
                selected={reviewStatus === 'rejected'}
                onPress={() => setReviewStatus('rejected')}
              >
                Rechazar
              </Chip>
            </View>
            {reviewStatus === 'rejected' && (
              <TextInput
                label="Motivo de rechazo"
                value={rejectionReason}
                onChangeText={setRejectionReason}
                mode="outlined"
                multiline
                style={styles.input}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowReview(false)}>Cancelar</Button>
            <Button
              onPress={handleSubmitReview}
              loading={reviewMutation.isPending}
            >
              Confirmar
            </Button>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rejectionText: { color: '#D32F2F', marginTop: 4 },
  reviewBtn: { marginTop: 8 },
  input: { marginTop: 12 },
});
