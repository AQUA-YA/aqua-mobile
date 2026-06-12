import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  ActivityIndicator,
  Button,
  TextInput,
  Dialog,
  Portal,
  Snackbar,
  List,
  SegmentedButtons,
  Switch,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useAdminWaterTypes,
  useCreateWaterType,
  useUpdateWaterType,
  useDeleteWaterType,
  useAdminBottleSizes,
  useCreateBottleSize,
  useUpdateBottleSize,
  useDeleteBottleSize,
} from '../../hooks/useAdmin';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';
import type { WaterType, BottleSize } from '../../types/models';

export function AdminCatalogsScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState('water');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'water', label: 'Tipos de agua' },
          { value: 'bottle', label: 'Tamaños' },
        ]}
        style={styles.tabs}
      />
      {tab === 'water' ? <WaterTypesPanel /> : <BottleSizesPanel />}
    </SafeAreaView>
  );
}

function WaterTypesPanel() {
  const { data, isLoading, isError, refetch, isRefetching } = useAdminWaterTypes();
  const createMutation = useCreateWaterType();
  const updateMutation = useUpdateWaterType();
  const deleteMutation = useDeleteWaterType();

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<WaterType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const items = data?.data?.data || [];

  const showMsg = (msg: string) => {
    setSnackbarMsg(msg);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsActive(true);
    setEditItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const handleOpenEdit = (item: WaterType) => {
    setName(item.name);
    setDescription(item.description || '');
    setIsActive(item.isActive);
    setEditItem(item);
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showMsg('El nombre es obligatorio');
      return;
    }
    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem._id,
          data: { name, description, isActive },
        });
        showMsg('Tipo de agua actualizado');
      } else {
        await createMutation.mutateAsync({ name, description, isActive });
        showMsg('Tipo de agua creado');
      }
      setShowCreate(false);
      resetForm();
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showMsg('Tipo de agua eliminado');
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  if (isError) {
    return <ErrorState fullScreen={false} onRetry={() => refetch()} retrying={isRefetching} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.panel}>
      <Button mode="contained" onPress={handleOpenCreate} style={styles.addBtn}>
        Agregar tipo de agua
      </Button>

      {items.map(item => (
        <List.Item
          key={item._id}
          title={item.name}
          description={`${item.description || ''}  •  ${item.isActive ? 'Activo' : 'Inactivo'}`}
          left={() => <List.Icon icon="water" />}
          right={() => (
            <View style={styles.rowActions}>
              <Button compact onPress={() => handleOpenEdit(item)}>Editar</Button>
              <Button compact textColor="#D32F2F" onPress={() => handleDelete(item._id)}>Eliminar</Button>
            </View>
          )}
        />
      ))}

      <Portal>
        <Dialog visible={showCreate} onDismiss={() => setShowCreate(false)}>
          <Dialog.Title>{editItem ? 'Editar tipo de agua' : 'Nuevo tipo de agua'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <TextInput label="Descripción" value={description} onChangeText={setDescription} mode="outlined" style={styles.input} />
            <View style={styles.switchRow}>
              <Text variant="bodyMedium">Activo</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreate(false)}>Cancelar</Button>
            <Button onPress={handleSave} loading={createMutation.isPending || updateMutation.isPending}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbarMsg} onDismiss={() => setSnackbarMsg('')} duration={3000}>
        {snackbarMsg}
      </Snackbar>
    </ScrollView>
  );
}

function BottleSizesPanel() {
  const { data, isLoading, isError, refetch, isRefetching } = useAdminBottleSizes();
  const createMutation = useCreateBottleSize();
  const updateMutation = useUpdateBottleSize();
  const deleteMutation = useDeleteBottleSize();

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<BottleSize | null>(null);
  const [liters, setLiters] = useState('');
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const items = data?.data?.data || [];

  const showMsg = (msg: string) => {
    setSnackbarMsg(msg);
  };

  const resetForm = () => {
    setLiters('');
    setName('');
    setIsActive(true);
    setEditItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const handleOpenEdit = (item: BottleSize) => {
    setLiters(String(item.liters));
    setName(item.name || '');
    setIsActive(item.isActive);
    setEditItem(item);
    setShowCreate(true);
  };

  const handleSave = async () => {
    const litersNum = parseFloat(liters);
    if (!litersNum || litersNum <= 0) {
      showMsg('Los litros deben ser un número positivo');
      return;
    }
    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem._id,
          data: { liters: litersNum, name, isActive },
        });
        showMsg('Tamaño actualizado');
      } else {
        await createMutation.mutateAsync({ liters: litersNum, name, isActive });
        showMsg('Tamaño creado');
      }
      setShowCreate(false);
      resetForm();
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showMsg('Tamaño eliminado');
    } catch (err) {
      showMsg(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  if (isError) {
    return <ErrorState fullScreen={false} onRetry={() => refetch()} retrying={isRefetching} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.panel}>
      <Button mode="contained" onPress={handleOpenCreate} style={styles.addBtn}>
        Agregar tamaño
      </Button>

      {items.map(item => (
        <List.Item
          key={item._id}
          title={item.name || `${item.liters}L`}
          description={`${item.liters} litros  •  ${item.isActive ? 'Activo' : 'Inactivo'}`}
          left={() => <List.Icon icon="bottle-soda" />}
          right={() => (
            <View style={styles.rowActions}>
              <Button compact onPress={() => handleOpenEdit(item)}>Editar</Button>
              <Button compact textColor="#D32F2F" onPress={() => handleDelete(item._id)}>Eliminar</Button>
            </View>
          )}
        />
      ))}

      <Portal>
        <Dialog visible={showCreate} onDismiss={() => setShowCreate(false)}>
          <Dialog.Title>{editItem ? 'Editar tamaño' : 'Nuevo tamaño'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Litros" value={liters} onChangeText={setLiters} keyboardType="numeric" mode="outlined" style={styles.input} />
            <TextInput label="Nombre (opcional)" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <View style={styles.switchRow}>
              <Text variant="bodyMedium">Activo</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreate(false)}>Cancelar</Button>
            <Button onPress={handleSave} loading={createMutation.isPending || updateMutation.isPending}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbarMsg} onDismiss={() => setSnackbarMsg('')} duration={3000}>
        {snackbarMsg}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center' },
  tabs: { margin: 16 },
  panel: { padding: 16, paddingBottom: 32 },
  addBtn: { marginBottom: 16 },
  input: { marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  rowActions: { flexDirection: 'row', alignItems: 'center' },
});
