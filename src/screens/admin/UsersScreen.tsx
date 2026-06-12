import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  Searchbar,
  List,
  Chip,
  Button,
  Dialog,
  Portal,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminUsers, useUpdateUser, useDeleteUser } from '../../hooks/useAdmin';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';
import type { User } from '../../types/models';

export function AdminUsersScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useAdminUsers({ search, role: roleFilter || undefined, page, limit: 20 });
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const users = data?.data?.data || [];
  const meta = data?.data?.meta;

  const showMsg = (msg: string) => {
    setSnackbarMsg(msg);
  };

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setIsSuspended(false);
    setShowDetail(true);
  };

  const handleOpenEdit = () => {
    if (!selectedUser) return;
    setShowDetail(false);
    setIsSuspended(!!selectedUser.isSuspended);
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      await updateUser.mutateAsync({
        id: selectedUser._id,
        data: { isSuspended },
      });
      setShowEdit(false);
      showMsg('Usuario actualizado');
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser.mutateAsync(selectedUser._id);
      setShowDetail(false);
      showMsg('Usuario eliminado');
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
      <Searchbar
        placeholder="Buscar usuarios..."
        value={search}
        onChangeText={(t) => { setSearch(t); setPage(1); }}
        style={styles.searchbar}
      />

      <View style={styles.chipRow}>
        {['', 'consumer', 'purifier', 'delivery', 'admin'].map(r => (
          <Chip
            key={r}
            selected={roleFilter === r}
            onPress={() => { setRoleFilter(r); setPage(1); }}
            style={styles.chip}
          >
            {r || 'Todos'}
          </Chip>
        ))}
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.firstName || ''} ${item.lastName || ''}`}
            description={`${item.email}  •  ${item.roles.join(', ')}${item.isSuspended ? '  •  SUSPENDIDO' : ''}`}
            left={() => <List.Icon icon="account" />}
            onPress={() => handleOpenDetail(item)}
          />
        )}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (meta && page < meta.totalPages) setPage(p => p + 1);
        }}
      />

      <Portal>
        <Dialog visible={showDetail} onDismiss={() => setShowDetail(false)}>
          <Dialog.Title>Detalle de usuario</Dialog.Title>
          <Dialog.Content>
            {selectedUser && (
              <>
                <Text variant="bodyMedium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </Text>
                <Text variant="bodySmall">{selectedUser.email}</Text>
                <Text variant="bodySmall">Roles: {selectedUser.roles.join(', ')}</Text>
                {selectedUser.isSuspended && (
                  <Text variant="bodySmall" style={{ color: '#D32F2F' }}>Cuenta suspendida</Text>
                )}
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleOpenEdit}>Editar</Button>
            <Button onPress={handleDelete} textColor="#D32F2F">Eliminar</Button>
            <Button onPress={() => setShowDetail(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showEdit} onDismiss={() => setShowEdit(false)}>
          <Dialog.Title>Editar usuario</Dialog.Title>
          <Dialog.Content>
            <View style={styles.switchRow}>
              <Text variant="bodyMedium">Suspendido</Text>
              <Button
                mode={isSuspended ? 'contained' : 'outlined'}
                onPress={() => setIsSuspended(!isSuspended)}
                compact
              >
                {isSuspended ? 'Sí' : 'No'}
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEdit(false)}>Cancelar</Button>
            <Button onPress={handleSaveEdit} loading={updateUser.isPending}>Guardar</Button>
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
  searchbar: { margin: 16, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8, flexWrap: 'wrap' },
  chip: { marginBottom: 4 },
  list: { paddingBottom: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
