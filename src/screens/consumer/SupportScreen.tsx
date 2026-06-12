import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  TextInput,
  Dialog,
  Portal,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';
import { useMyTickets, useCreateTicket } from '../../hooks/useSupport';

export function SupportScreen() {
  const theme = useTheme();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const { data: ticketsData, isLoading, isError, refetch, isRefetching } =
    useMyTickets(statusFilter);
  const createTicket = useCreateTicket();

  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const tickets = ticketsData?.data?.data?.data || [];

  const statusLabel: Record<string, string> = {
    open: 'Abiertos',
    in_progress: 'En proceso',
    closed: 'Cerrados',
  };

  const handleCreate = async () => {
    if (!subject.trim() || !description.trim()) {
      showSnackbar('Asunto y descripción son obligatorios', true);
      return;
    }
    try {
      await createTicket.mutateAsync({
        subject: subject.trim(),
        description: description.trim(),
      });
      setShowCreate(false);
      setSubject('');
      setDescription('');
      showSnackbar('Ticket creado');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Soporte
        </Text>

        <Button
          mode="contained"
          onPress={() => setShowCreate(true)}
          style={{ marginBottom: 16 }}
        >
          Nuevo ticket
        </Button>

        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: 'open', label: 'Abiertos' },
            { value: 'in_progress', label: 'En proceso' },
            { value: 'closed', label: 'Cerrados' },
          ]}
          style={{ marginBottom: 16 }}
        />

        {isLoading && <Text variant="bodyMedium">Cargando...</Text>}

        {isError && (
          <ErrorState
            fullScreen={false}
            onRetry={() => refetch()}
            retrying={isRefetching}
          />
        )}

        {!isLoading && !isError && tickets.length === 0 && (
          <Text variant="bodyMedium" style={{ textAlign: 'center', marginVertical: 24 }}>
            Sin tickets {statusLabel[statusFilter]?.toLowerCase()}
          </Text>
        )}

        {tickets.map((t) => (
          <Card key={t._id} style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{t.subject}</Text>
              <Text variant="bodySmall" style={{ marginTop: 4 }}>{t.description}</Text>
              {t.adminResponse && (
                <View style={styles.responseBox}>
                  <Text variant="bodySmall" style={{ fontStyle: 'italic' }}>
                    Respuesta: {t.adminResponse}
                  </Text>
                </View>
              )}
              <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.5 }}>
                {new Date(t.createdAt).toLocaleString()} ·{' '}
                {statusLabel[t.status] || t.status}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={showCreate} onDismiss={() => setShowCreate(false)}>
          <Dialog.Title>Nuevo ticket</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Asunto"
              value={subject}
              onChangeText={setSubject}
              mode="outlined"
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={{ marginBottom: 12 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreate(false)}>Cancelar</Button>
            <Button onPress={handleCreate} loading={createTicket.isPending}>
              Enviar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 8 },
  responseBox: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
});
