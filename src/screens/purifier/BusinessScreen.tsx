import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  TextInput,
  Dialog,
  Portal,
  SegmentedButtons,
  Chip,
  Divider,
  RadioButton,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { purifiersApi } from '../../api/purifiers.api';
import { businessApi } from '../../api/business.api';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';
import {
  useInventory,
  useCreateMovement,
  useStoreSales,
  useCreateStoreSale,
  useCashRegisters,
  useOpenCashRegister,
  useCloseCashRegister,
  useWaterTypes,
  useBottleSizes,
  useReports,
  useMyCoupons,
  useCreateCoupon,
  useDeleteCoupon,
} from '../../hooks/useBusiness';

type Section = 'purifiers' | 'inventory' | 'pos' | 'cash' | 'reports' | 'delivery' | 'promos';

export function BusinessScreen() {
  const theme = useTheme();
  const [section, setSection] = useState<Section>('purifiers');
  const [activePurifierId, setActivePurifierId] = useState<string | null>(null);

  const {
    data: myPurifiers,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['purifiers', 'mine'],
    queryFn: () => purifiersApi.getMine(),
  });

  const purifiers = myPurifiers?.data?.data || [];

  const handleSelectPurifier = (id: string) => {
    setActivePurifierId(id);
    if (section === 'purifiers') setSection('inventory');
  };

  const renderSection = () => {
    switch (section) {
      case 'purifiers':
        return <PurifiersSection purifiers={purifiers} onSelect={handleSelectPurifier} />;
      case 'inventory':
        return <InventorySection purifierId={activePurifierId} />;
      case 'pos':
        return <POSSection purifierId={activePurifierId} />;
      case 'cash':
        return <CashSection purifierId={activePurifierId} />;
      case 'reports':
        return <ReportsSection purifierId={activePurifierId} />;
      case 'delivery':
        return <DeliverySection purifierId={activePurifierId ?? undefined} />;
      case 'promos':
        return <PromosSection />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Negocio
        </Text>

        <SegmentedButtons
          value={section}
          onValueChange={(val) => setSection(val as Section)}
          buttons={[
            { value: 'purifiers', label: 'Tiendas' },
            { value: 'inventory', label: 'Inventario' },
            { value: 'pos', label: 'POS' },
            { value: 'cash', label: 'Caja' },
            { value: 'reports', label: 'Reportes' },
            { value: 'delivery', label: 'Repartidores' },
            { value: 'promos', label: 'Promos' },
          ]}
          style={styles.segment}
        />

        {isError && (
          <ErrorState
            fullScreen={false}
            onRetry={() => refetch()}
            retrying={isRefetching}
          />
        )}

        {renderSection()}
      </ScrollView>
    </SafeAreaView>
  );
}

function PurifiersSection({
  purifiers,
  onSelect,
}: {
  purifiers: any[];
  onSelect: (id: string) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const showSnackbar = useSnackbarStore((s) => s.show);

  const handleCreate = async () => {
    if (!name.trim() || !address.trim()) {
      showSnackbar('Nombre y dirección son obligatorios', true);
      return;
    }
    try {
      await purifiersApi.create({
        name: name.trim(),
        address: address.trim(),
        lat: 19.4326,
        lng: -99.1332,
        phone: phone.trim() || undefined,
      });
      setShowCreate(false);
      setName('');
      setAddress('');
      setPhone('');
      showSnackbar('Purificadora creada');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <>
      <Button
        mode="contained"
        onPress={() => setShowCreate(true)}
        style={styles.addButton}
      >
        Nueva purificadora
      </Button>

      {purifiers.length === 0 && (
        <Text variant="bodyMedium" style={styles.emptyText}>
          Aún no tienes purificadoras registradas
        </Text>
      )}

      {purifiers.map((p) => (
        <TouchableOpacity key={p._id} onPress={() => onSelect(p._id)}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.purifierRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium">{p.name}</Text>
                  <Text variant="bodySmall">{p.address}</Text>
                  {p.phone && <Text variant="bodySmall">Tel: {p.phone}</Text>}
                </View>
                <IconButton icon="chevron-right" />
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}

      <Portal>
        <Dialog visible={showCreate} onDismiss={() => setShowCreate(false)}>
          <Dialog.Title>Nueva purificadora</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nombre"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Dirección"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreate(false)}>Cancelar</Button>
            <Button onPress={handleCreate}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

function InventorySection({ purifierId }: { purifierId: string | null }) {
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { data: inventoryData, isLoading } = useInventory(purifierId ?? '');
  const { data: bottleSizesData } = useBottleSizes();
  const createMovement = useCreateMovement(purifierId ?? '');
  const [showMovement, setShowMovement] = useState(false);
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [movementBottleId, setMovementBottleId] = useState('');
  const [movementQty, setMovementQty] = useState('');
  const [movementSeals, setMovementSeals] = useState('');
  const [movementReason, setMovementReason] = useState('');

  const inventory = inventoryData?.data?.data || [];
  const bottleSizes = bottleSizesData?.data?.data?.data || [];

  const getBottleName = (id: string) => {
    const b = bottleSizes.find((bs) => bs._id === id);
    return b ? (b.name || `${b.liters}L`) : id;
  };

  const handleMovement = async () => {
    if (!movementBottleId || !movementQty || parseInt(movementQty, 10) <= 0) {
      showSnackbar('Selecciona un producto y cantidad válida', true);
      return;
    }
    try {
      await createMovement.mutateAsync({
        bottleSizeId: movementBottleId,
        type: movementType,
        quantity: parseInt(movementQty, 10),
        seals: movementSeals ? parseInt(movementSeals, 10) : undefined,
        reason: movementReason.trim() || movementType === 'in' ? 'Entrada manual' : 'Salida manual',
      });
      setShowMovement(false);
      setMovementBottleId('');
      setMovementQty('');
      setMovementSeals('');
      setMovementReason('');
      showSnackbar('Movimiento registrado');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  if (!purifierId) {
    return (
      <View style={styles.placeholderSection}>
        <Text variant="bodyMedium">Selecciona una purificadora primero</Text>
      </View>
    );
  }

  return (
    <>
      <Button
        mode="contained"
        onPress={() => setShowMovement(true)}
        style={styles.addButton}
      >
        Registrar movimiento
      </Button>

      {isLoading && <Text variant="bodyMedium">Cargando...</Text>}

      {inventory.length === 0 && !isLoading && (
        <Text variant="bodyMedium" style={styles.emptyText}>
          Sin inventario registrado. Agrega un movimiento para comenzar.
        </Text>
      )}

      {inventory.map((item, idx) => {
        const isLow = item.availableQuantity <= (item.lowStockThreshold || 5);
        return (
          <Card key={item.bottleSizeId || idx} style={styles.card}>
            <Card.Content>
              <View style={styles.inventoryRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium">{getBottleName(item.bottleSizeId)}</Text>
                  <View style={styles.stockRow}>
                    <Chip
                      icon="water"
                      compact
                      style={isLow ? styles.lowStock : undefined}
                    >
                      {item.availableQuantity} garrafones
                    </Chip>
                    <Chip icon="recycle" compact style={{ marginLeft: 8 }}>
                      {item.availableSeals} sellos
                    </Chip>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        );
      })}

      <Portal>
        <Dialog visible={showMovement} onDismiss={() => setShowMovement(false)}>
          <Dialog.Title>Registrar movimiento</Dialog.Title>
          <Dialog.Content>
            <SegmentedButtons
              value={movementType}
              onValueChange={(val) => setMovementType(val as 'in' | 'out' | 'adjustment')}
              buttons={[
                { value: 'in', label: 'Entrada' },
                { value: 'out', label: 'Salida' },
                { value: 'adjustment', label: 'Ajuste' },
              ]}
              style={{ marginBottom: 12 }}
            />
            {bottleSizes.map((bs) => (
              <RadioButton.Item
                key={bs._id}
                label={bs.name || `${bs.liters}L`}
                value={bs._id}
                status={movementBottleId === bs._id ? 'checked' : 'unchecked'}
                onPress={() => setMovementBottleId(bs._id)}
              />
            ))}
            <TextInput
              label="Cantidad"
              value={movementQty}
              onChangeText={setMovementQty}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Sellos (opcional)"
              value={movementSeals}
              onChangeText={setMovementSeals}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Motivo"
              value={movementReason}
              onChangeText={setMovementReason}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowMovement(false)}>Cancelar</Button>
            <Button onPress={handleMovement} loading={createMovement.isPending}>
              Registrar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

function POSSection({ purifierId }: { purifierId: string | null }) {
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { data: waterTypesData } = useWaterTypes();
  const { data: bottleSizesData } = useBottleSizes();
  const { data: salesData } = useStoreSales(purifierId ?? '');
  const createSale = useCreateStoreSale(purifierId ?? '');
  const [showSale, setShowSale] = useState(false);
  const [saleWaterId, setSaleWaterId] = useState('');
  const [saleBottleId, setSaleBottleId] = useState('');
  const [saleQty, setSaleQty] = useState('1');
  const [saleTotal, setSaleTotal] = useState('');
  const [salePayment, setSalePayment] = useState<'cash' | 'wallet' | 'transfer'>('cash');

  const waterTypes = waterTypesData?.data?.data?.data || [];
  const bottleSizes = bottleSizesData?.data?.data?.data || [];
  const sales = salesData?.data?.data?.data || [];

  const getWaterName = (id: string) => {
    const w = waterTypes.find((wt) => wt._id === id);
    return w ? w.name : id;
  };

  const getBottleName = (id: string) => {
    const b = bottleSizes.find((bs) => bs._id === id);
    return b ? (b.name || `${b.liters}L`) : id;
  };

  const handleSale = async () => {
    if (!saleWaterId || !saleBottleId || !saleTotal) {
      showSnackbar('Completa todos los campos', true);
      return;
    }
    try {
      await createSale.mutateAsync({
        waterTypeId: saleWaterId,
        bottleSizeId: saleBottleId,
        quantity: parseInt(saleQty, 10) || 1,
        total: parseFloat(saleTotal),
        paymentMethod: salePayment,
      });
      setShowSale(false);
      setSaleWaterId('');
      setSaleBottleId('');
      setSaleQty('1');
      setSaleTotal('');
      setSalePayment('cash');
      showSnackbar('Venta registrada');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  if (!purifierId) {
    return (
      <View style={styles.placeholderSection}>
        <Text variant="bodyMedium">Selecciona una purificadora primero</Text>
      </View>
    );
  }

  return (
    <>
      <Button
        mode="contained"
        onPress={() => setShowSale(true)}
        style={styles.addButton}
      >
        Nueva venta directa
      </Button>

      {sales.length === 0 && (
        <Text variant="bodyMedium" style={styles.emptyText}>
          Sin ventas registradas
        </Text>
      )}

      {sales.slice(0, 10).map((s) => (
        <Card key={s._id} style={styles.card}>
          <Card.Content>
            <View style={styles.saleRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">
                  {getWaterName(s.waterTypeId)} - {getBottleName(s.bottleSizeId)}
                </Text>
                <Text variant="bodySmall">
                  {s.quantity}x · ${s.total.toFixed(2)} ·{' '}
                  {s.paymentMethod === 'cash'
                    ? 'Efectivo'
                    : s.paymentMethod === 'wallet'
                      ? 'Monedero'
                      : 'Transferencia'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}

      <Portal>
        <Dialog visible={showSale} onDismiss={() => setShowSale(false)}>
          <Dialog.Title>Nueva venta directa</Dialog.Title>
          <Dialog.Content>
            <Text variant="labelLarge" style={{ marginBottom: 8 }}>
              Tipo de agua
            </Text>
            {waterTypes.map((wt) => (
              <RadioButton.Item
                key={wt._id}
                label={wt.name}
                value={wt._id}
                status={saleWaterId === wt._id ? 'checked' : 'unchecked'}
                onPress={() => setSaleWaterId(wt._id)}
              />
            ))}
            <Divider style={{ marginVertical: 8 }} />
            <Text variant="labelLarge" style={{ marginBottom: 8 }}>
              Presentación
            </Text>
            {bottleSizes.map((bs) => (
              <RadioButton.Item
                key={bs._id}
                label={bs.name || `${bs.liters}L`}
                value={bs._id}
                status={saleBottleId === bs._id ? 'checked' : 'unchecked'}
                onPress={() => setSaleBottleId(bs._id)}
              />
            ))}
            <Divider style={{ marginVertical: 8 }} />
            <TextInput
              label="Cantidad"
              value={saleQty}
              onChangeText={setSaleQty}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Total $"
              value={saleTotal}
              onChangeText={setSaleTotal}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
            />
            <SegmentedButtons
              value={salePayment}
              onValueChange={(val) => setSalePayment(val as 'cash' | 'wallet' | 'transfer')}
              buttons={[
                { value: 'cash', label: 'Efectivo' },
                { value: 'wallet', label: 'Monedero' },
                { value: 'transfer', label: 'Transferencia' },
              ]}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSale(false)}>Cancelar</Button>
            <Button onPress={handleSale} loading={createSale.isPending}>
              Vender
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

function CashSection({ purifierId }: { purifierId: string | null }) {
  const showSnackbar = useSnackbarStore((s) => s.show);
  const queryClient = useQueryClient();
  const { data: registersData, isLoading } = useCashRegisters(purifierId ?? '');
  const openRegister = useOpenCashRegister(purifierId ?? '');
  const closeRegister = useCloseCashRegister(purifierId ?? '');
  const [showOpen, setShowOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [showEntry, setShowEntry] = useState(false);
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');
  const [entryConcept, setEntryConcept] = useState('');
  const [entryAmount, setEntryAmount] = useState('');

  const registers = registersData?.data?.data?.data || [];
  const openReg = registers.find((r) => !r.isClosed);
  const closedRegs = registers.filter((r) => r.isClosed);

  const handleOpen = async () => {
    if (!openingBalance) {
      showSnackbar('Ingresa el saldo inicial', true);
      return;
    }
    try {
      await openRegister.mutateAsync({
        openingBalance: parseFloat(openingBalance),
      });
      setShowOpen(false);
      setOpeningBalance('');
      showSnackbar('Caja abierta');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  const handleClose = async () => {
    if (!openReg) return;
    try {
      await closeRegister.mutateAsync(openReg._id);
      showSnackbar('Caja cerrada');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  const handleAddEntry = async () => {
    if (!entryConcept.trim() || !entryAmount) {
      showSnackbar('Completa todos los campos', true);
      return;
    }
    try {
      await businessApi.addCashEntry(purifierId!, openReg!._id, {
        type: entryType,
        concept: entryConcept.trim(),
        amount: parseFloat(entryAmount),
      });
      setShowEntry(false);
      setEntryConcept('');
      setEntryAmount('');
      queryClient.invalidateQueries({
        queryKey: ['purifiers', purifierId, 'cash-registers'],
      });
      showSnackbar('Movimiento registrado');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  if (!purifierId) {
    return (
      <View style={styles.placeholderSection}>
        <Text variant="bodyMedium">Selecciona una purificadora primero</Text>
      </View>
    );
  }

  if (isLoading) {
    return <Text variant="bodyMedium">Cargando...</Text>;
  }

  return (
    <>
      {openReg ? (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">Caja abierta</Text>
              <Text variant="bodyLarge" style={{ fontWeight: 'bold', marginVertical: 8 }}>
                ${(openReg.closingBalance ?? openReg.openingBalance).toFixed(2)}
              </Text>
              <Text variant="bodySmall">
                Apertura: ${openReg.openingBalance.toFixed(2)} ·{' '}
                {new Date(openReg.createdAt).toLocaleDateString()}
              </Text>
              <View style={styles.cashActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowEntry(true)}
                  style={{ marginRight: 8 }}
                >
                  Agregar movimiento
                </Button>
                <Button mode="contained" onPress={handleClose} loading={closeRegister.isPending}>
                  Cerrar caja
                </Button>
              </View>
            </Card.Content>
          </Card>

          {closedRegs.length > 0 && (
            <>
              <Text variant="titleSmall" style={{ marginTop: 16, marginBottom: 8 }}>
                Cierres anteriores
              </Text>
              {closedRegs.slice(0, 5).map((r) => (
                <Card key={r._id} style={styles.card}>
                  <Card.Content>
                    <Text variant="bodyMedium">
                      {new Date(r.createdAt).toLocaleDateString()} · ${r.openingBalance.toFixed(2)}{' '}
                      → ${(r.closingBalance ?? 0).toFixed(2)}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}
        </>
      ) : (
        <>
          <Text variant="bodyMedium" style={styles.emptyText}>
            No hay caja abierta
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowOpen(true)}
            style={styles.addButton}
          >
            Abrir caja
          </Button>

          {closedRegs.length > 0 && (
            <>
              <Text variant="titleSmall" style={{ marginTop: 16, marginBottom: 8 }}>
                Cierres anteriores
              </Text>
              {closedRegs.slice(0, 5).map((r) => (
                <Card key={r._id} style={styles.card}>
                  <Card.Content>
                    <Text variant="bodyMedium">
                      {new Date(r.createdAt).toLocaleDateString()} · ${r.openingBalance.toFixed(2)}{' '}
                      → ${(r.closingBalance ?? 0).toFixed(2)}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}
        </>
      )}

      <Portal>
        <Dialog visible={showOpen} onDismiss={() => setShowOpen(false)}>
          <Dialog.Title>Abrir caja</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Saldo inicial $"
              value={openingBalance}
              onChangeText={setOpeningBalance}
              keyboardType="decimal-pad"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowOpen(false)}>Cancelar</Button>
            <Button onPress={handleOpen} loading={openRegister.isPending}>
              Abrir
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showEntry} onDismiss={() => setShowEntry(false)}>
          <Dialog.Title>Movimiento de caja</Dialog.Title>
          <Dialog.Content>
            <SegmentedButtons
              value={entryType}
              onValueChange={(val) => setEntryType(val as 'income' | 'expense')}
              buttons={[
                { value: 'income', label: 'Ingreso' },
                { value: 'expense', label: 'Gasto' },
              ]}
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Concepto"
              value={entryConcept}
              onChangeText={setEntryConcept}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Monto $"
              value={entryAmount}
              onChangeText={setEntryAmount}
              keyboardType="decimal-pad"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEntry(false)}>Cancelar</Button>
            <Button onPress={handleAddEntry}>Agregar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

function ReportsSection({ purifierId }: { purifierId: string | null }) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { data: reportsData, isLoading } = useReports(purifierId ?? '', { period });

  const handleShare = () => {
    showSnackbar('Compartir reporte (próximamente)');
  };

  if (!purifierId) {
    return (
      <View style={styles.placeholderSection}>
        <Text variant="bodyMedium">Selecciona una purificadora primero</Text>
      </View>
    );
  }

  const rows = reportsData?.data?.data || [];

  const totals = Array.isArray(rows)
    ? rows.reduce(
        (acc: { totalSales: number; totalOrders: number }, r: any) => ({
          totalSales: acc.totalSales + (r.total || 0),
          totalOrders: acc.totalOrders + (r.count || r.orders || 0),
        }),
        { totalSales: 0, totalOrders: 0 },
      )
    : { totalSales: 0, totalOrders: 0 };

  return (
    <>
      <SegmentedButtons
        value={period}
        onValueChange={(val) => setPeriod(val as 'daily' | 'weekly' | 'monthly')}
        buttons={[
          { value: 'daily', label: 'Diario' },
          { value: 'weekly', label: 'Semanal' },
          { value: 'monthly', label: 'Mensual' },
        ]}
        style={styles.periodSelector}
      />

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Resumen</Text>
          <View style={styles.reportSummary}>
            <View style={styles.reportStat}>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
                ${totals.totalSales.toFixed(2)}
              </Text>
              <Text variant="bodySmall">Ventas totales</Text>
            </View>
            <View style={styles.reportStat}>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
                {totals.totalOrders}
              </Text>
              <Text variant="bodySmall">Pedidos</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleShare}
        style={styles.addButton}
        icon="share-variant"
      >
        Compartir reporte
      </Button>

      <Text variant="titleSmall" style={{ marginTop: 16, marginBottom: 8 }}>
        Detalle
      </Text>

      {isLoading && <Text variant="bodyMedium">Cargando...</Text>}

      {Array.isArray(rows) && rows.length === 0 && !isLoading && (
        <Text variant="bodyMedium" style={styles.emptyText}>
          Sin datos para este período
        </Text>
      )}

      {Array.isArray(rows) &&
        rows.slice(0, 20).map((r: any, idx: number) => (
          <Card key={r.date || r._id || idx} style={styles.card}>
            <Card.Content>
              <View style={styles.reportRow}>
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  {r.date || r.period || `Período ${idx + 1}`}
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginHorizontal: 16 }}>
                  ${(r.total || 0).toFixed(2)}
                </Text>
                <Text variant="bodySmall">{r.count || r.orders || 0} pedidos</Text>
              </View>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: `${Math.min((r.total || 0) / (totals.totalSales || 1) * 100, 100)}%` },
                  ]}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
    </>
  );
}

function DeliverySection({ purifierId: _purifierId }: { purifierId?: string }) {
  const showSnackbar = useSnackbarStore((s) => s.show);
  return (
    <View style={styles.placeholderSection}>
      <Text variant="bodyMedium">Repartidores vinculados</Text>
      <Button
        mode="contained"
        onPress={() => showSnackbar('Gestión de repartidores')}
        style={styles.placeholderButton}
      >
        Vincular repartidor
      </Button>
    </View>
  );
}

function PromosSection() {
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { data: couponsData, isLoading } = useMyCoupons();
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'amount' | 'percentage' | 'two_for_one' | 'free_delivery'>('amount');
  const [value, setValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const coupons = couponsData?.data?.data || [];

  const typeLabel: Record<string, string> = {
    amount: 'Monto fijo',
    percentage: 'Porcentaje',
    two_for_one: '2x1',
    free_delivery: 'Envío gratis',
  };

  const handleCreate = async () => {
    if (!value || !startsAt || !endsAt) {
      showSnackbar('Valor, inicio y fin son obligatorios', true);
      return;
    }
    try {
      await createCoupon.mutateAsync({
        code: code.trim() || undefined,
        type,
        value: parseFloat(value),
        maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
        startsAt,
        endsAt,
      });
      setShowCreate(false);
      setCode('');
      setValue('');
      setMaxUses('');
      setStartsAt('');
      setEndsAt('');
      showSnackbar('Cupón creado');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon.mutateAsync(id);
      showSnackbar('Cupón eliminado');
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <>
      <Button
        mode="contained"
        onPress={() => setShowCreate(true)}
        style={styles.addButton}
      >
        Nuevo cupón
      </Button>

      {isLoading && <Text variant="bodyMedium">Cargando...</Text>}

      {coupons.length === 0 && !isLoading && (
        <Text variant="bodyMedium" style={styles.emptyText}>
          Sin cupones registrados
        </Text>
      )}

      {coupons.map((c) => (
        <Card key={c._id} style={styles.card}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium">{c.code || 'Sin código'}</Text>
                <Text variant="bodySmall">
                  {typeLabel[c.type] || c.type}
                  {c.type === 'amount'
                    ? ` - $${c.value}`
                    : c.type === 'percentage'
                      ? ` - ${c.value}%`
                      : ''}
                </Text>
                <Text variant="bodySmall">
                  {c.isActive ? 'Activo' : 'Inactivo'} ·{' '}
                  {new Date(c.startsAt).toLocaleDateString()} →{' '}
                  {new Date(c.endsAt).toLocaleDateString()}
                </Text>
              </View>
              <IconButton
                icon="delete"
                onPress={() => handleDelete(c._id)}
              />
            </View>
          </Card.Content>
        </Card>
      ))}

      <Portal>
        <Dialog visible={showCreate} onDismiss={() => setShowCreate(false)}>
          <Dialog.Title>Nuevo cupón</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Código (opcional)"
              value={code}
              onChangeText={setCode}
              mode="outlined"
              style={styles.dialogInput}
            />
            <SegmentedButtons
              value={type}
              onValueChange={(val) => setType(val as 'amount' | 'percentage' | 'two_for_one' | 'free_delivery')}
              buttons={[
                { value: 'amount', label: 'Monto' },
                { value: 'percentage', label: '%' },
                { value: 'two_for_one', label: '2x1' },
                { value: 'free_delivery', label: 'Envío' },
              ]}
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label={type === 'percentage' ? 'Valor %' : type === 'amount' ? 'Valor $' : 'Valor'}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Usos máximos (opcional)"
              value={maxUses}
              onChangeText={setMaxUses}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Inicio (YYYY-MM-DD)"
              value={startsAt}
              onChangeText={setStartsAt}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Fin (YYYY-MM-DD)"
              value={endsAt}
              onChangeText={setEndsAt}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreate(false)}>Cancelar</Button>
            <Button onPress={handleCreate} loading={createCoupon.isPending}>
              Crear
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  segment: { marginBottom: 16 },
  addButton: { marginBottom: 16 },
  card: { marginBottom: 8 },
  dialogInput: { marginBottom: 12 },
  placeholderSection: { alignItems: 'center', padding: 32, marginTop: 24 },
  placeholderButton: { marginTop: 16 },
  emptyText: { textAlign: 'center', marginVertical: 24 },
  purifierRow: { flexDirection: 'row', alignItems: 'center' },
  inventoryRow: { flexDirection: 'row', alignItems: 'center' },
  stockRow: { flexDirection: 'row', marginTop: 8 },
  lowStock: { backgroundColor: '#FFCDD2' },
  saleRow: { flexDirection: 'row', alignItems: 'center' },
  cashActions: { flexDirection: 'row', marginTop: 16 },
  periodSelector: { marginBottom: 16 },
  reportSummary: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  reportStat: { alignItems: 'center' },
  reportRow: { flexDirection: 'row', alignItems: 'center' },
  barContainer: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, marginTop: 8 },
  bar: { height: 6, backgroundColor: '#2196F3', borderRadius: 3 },
});
