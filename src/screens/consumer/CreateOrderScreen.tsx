import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  useTheme,
  RadioButton,
  SegmentedButtons,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateOrder } from '../../hooks/useOrders';
import { useWaterTypes, useBottleSizes } from '../../hooks/usePurifiers';
import { useAddresses } from '../../hooks/useAddresses';
import { useSnackbarStore } from '../../components/GlobalSnackbar';
import { getErrorMessage } from '../../api/client';
import { useValidateCoupon } from '../../hooks/useBusiness';

const STEPS = ['Pedido', 'Dirección', 'Propina', 'Pago', 'Confirmar'];

export function CreateOrderScreen({ route, navigation }: any) {
  const theme = useTheme();
  const { purifierId, purifierName } = route.params || {};
  const [step, setStep] = useState(0);

  const [waterTypeId, setWaterTypeId] = useState('');
  const [bottleSizeId, setBottleSizeId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [mode, setMode] = useState<'open' | 'to_purifier'>(
    purifierId ? 'to_purifier' : 'open',
  );

  const [addressId, setAddressId] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');

  const [tip, setTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet'>('cash');
  const [requiresEmptyPickup, setRequiresEmptyPickup] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const createMutation = useCreateOrder();
  const validateCoupon = useValidateCoupon();
  const { data: waterTypesData } = useWaterTypes();
  const { data: bottleSizesData } = useBottleSizes();
  const { data: addressesData } = useAddresses();
  const showSnackbar = useSnackbarStore((s) => s.show);

  const waterTypes = waterTypesData?.data?.data?.data?.filter((wt) => wt.isActive) ?? [];
  const bottleSizes = bottleSizesData?.data?.data?.data?.filter((bs) => bs.isActive) ?? [];
  const addresses = addressesData?.data?.data ?? [];

  const subtotal =
    parseInt(quantity || '0', 10) * 50; // placeholder, real price from API
  const discount = couponDiscount;
  const total = Math.max(0, subtotal + (parseFloat(tip || '0') || 0) - discount);

  const handleNext = () => {
    if (step === 0) {
      if (!waterTypeId) {
        showSnackbar('Selecciona un tipo de agua', true);
        return;
      }
      if (!bottleSizeId) {
        showSnackbar('Selecciona un tamaño', true);
        return;
      }
      if (!quantity || parseInt(quantity, 10) < 1) {
        showSnackbar('Cantidad inválida', true);
        return;
      }
    }
    if (step === 1) {
      if (!addressId && !street.trim()) {
        showSnackbar('Selecciona o ingresa una dirección', true);
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        purifierId,
        subtotal,
        deliveryFee: 0,
      });
      setCouponDiscount(res.data.data.discount);
      showSnackbar(res.data.data.description || `Descuento: $${res.data.data.discount}`);
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  const handleConfirm = async () => {
    try {
      await createMutation.mutateAsync({
        mode,
        targetPurifierId: purifierId,
        waterTypeId,
        bottleSizeId,
        quantity: parseInt(quantity, 10),
        addressId: addressId || undefined,
        deliveryAddress: addressId
          ? undefined
          : { street: street.trim(), city: city.trim() || 'Ciudad' },
        tip: parseFloat(tip || '0') || undefined,
        paymentMethod,
        requiresEmptyPickup,
        couponCode: couponCode.trim() || undefined,
      });
      showSnackbar('Pedido creado exitosamente');
      navigation.goBack();
    } catch (err) {
      showSnackbar(getErrorMessage(err), true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleMedium" style={styles.stepIndicator}>
          Paso {step + 1} de {STEPS.length}: {STEPS[step]}
        </Text>

        {step === 0 && (
          <>
            <Text variant="titleLarge" style={styles.section}>
              ¿Qué necesitas?
            </Text>

            {purifierName && (
              <Text variant="bodyMedium" style={styles.purifierLabel}>
                Purificadora: {purifierName}
              </Text>
            )}

            <Text variant="bodyMedium" style={styles.label}>Tipo de agua</Text>
            {waterTypes.map((wt) => (
              <RadioButton.Item
                key={wt._id}
                label={wt.name}
                value={wt._id}
                status={waterTypeId === wt._id ? 'checked' : 'unchecked'}
                onPress={() => setWaterTypeId(wt._id)}
              />
            ))}

            <Text variant="bodyMedium" style={styles.label}>Tamaño</Text>
            {bottleSizes.map((bs) => (
              <RadioButton.Item
                key={bs._id}
                label={bs.name || `${bs.liters}L`}
                value={bs._id}
                status={bottleSizeId === bs._id ? 'checked' : 'unchecked'}
                onPress={() => setBottleSizeId(bs._id)}
              />
            ))}

            <TextInput
              label="Cantidad"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <SegmentedButtons
              value={mode}
              onValueChange={(val) =>
                setMode(val as 'open' | 'to_purifier')
              }
              buttons={[
                { value: 'open', label: 'Abierto' },
                {
                  value: 'to_purifier',
                  label: 'A purificadora',
                  disabled: !purifierId,
                },
              ]}
              style={styles.segment}
            />

            <View style={styles.switchRow}>
              <Text variant="bodyMedium">Recoger garrafón vacío</Text>
              <Button
                mode={requiresEmptyPickup ? 'contained' : 'outlined'}
                compact
                onPress={() => setRequiresEmptyPickup(!requiresEmptyPickup)}
              >
                {requiresEmptyPickup ? 'Sí' : 'No'}
              </Button>
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text variant="titleLarge" style={styles.section}>
              Dirección de entrega
            </Text>

            {addresses.map((addr) => (
              <RadioButton.Item
                key={addr._id}
                label={`${addr.alias}: ${addr.street}`}
                value={addr._id}
                status={addressId === addr._id ? 'checked' : 'unchecked'}
                onPress={() => setAddressId(addr._id)}
              />
            ))}

            <Text variant="bodySmall" style={styles.orText}>
              O ingresa una dirección nueva
            </Text>
            <TextInput
              label="Calle y número"
              value={street}
              onChangeText={setStreet}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Ciudad"
              value={city}
              onChangeText={setCity}
              mode="outlined"
              style={styles.input}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Text variant="titleLarge" style={styles.section}>
              Propina para el repartidor
            </Text>
            <Text variant="bodySmall" style={styles.hint}>
              Opcional — totalmente voluntaria
            </Text>
            <View style={styles.tipRow}>
              {[0, 5, 10, 20].map((amt) => (
                <Button
                  key={amt}
                  mode={parseInt(tip || '0', 10) === amt ? 'contained' : 'outlined'}
                  compact
                  onPress={() => setTip(amt.toString())}
                  style={styles.tipButton}
                >
                  {amt === 0 ? 'Sin' : `$${amt}`}
                </Button>
              ))}
            </View>
            <TextInput
              label="Propina personalizada"
              value={tip}
              onChangeText={setTip}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
          </>
        )}

        {step === 3 && (
          <>
            <Text variant="titleLarge" style={styles.section}>
              Método de pago
            </Text>
            <RadioButton.Item
              label="Efectivo contra entrega"
              value="cash"
              status={paymentMethod === 'cash' ? 'checked' : 'unchecked'}
              onPress={() => setPaymentMethod('cash')}
            />
            <RadioButton.Item
              label="Monedero digital"
              value="wallet"
              status={paymentMethod === 'wallet' ? 'checked' : 'unchecked'}
              onPress={() => setPaymentMethod('wallet')}
            />
            {paymentMethod === 'wallet' && (
              <HelperText type="info" visible>
                El monto total se bloqueará de tu monedero hasta que se entregue
                el pedido
              </HelperText>
            )}

            <Text variant="titleLarge" style={[styles.section, { marginTop: 24 }]}>
              Cupón de descuento
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                label="Código"
                value={couponCode}
                onChangeText={setCouponCode}
                mode="outlined"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                mode="contained"
                onPress={handleValidateCoupon}
                loading={validateCoupon.isPending}
                disabled={!couponCode.trim()}
              >
                Validar
              </Button>
            </View>
            {couponDiscount > 0 && (
              <HelperText type="info" visible>
                Descuento aplicado: ${couponDiscount.toFixed(2)}
              </HelperText>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <Text variant="titleLarge" style={styles.section}>
              Resumen del pedido
            </Text>
            <View style={styles.summaryRow}>
              <Text>Subtotal</Text>
              <Text>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Propina</Text>
              <Text>${(parseFloat(tip || '0') || 0).toFixed(2)}</Text>
            </View>
            {couponDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text>Descuento</Text>
                <Text>-${couponDiscount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text variant="titleMedium">Total</Text>
              <Text variant="titleMedium">${total.toFixed(2)}</Text>
            </View>
            <HelperText type="info" visible>
              Pago: {paymentMethod === 'cash' ? 'Efectivo' : 'Monedero'}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={createMutation.isPending}
              disabled={createMutation.isPending}
              style={styles.confirmButton}
            >
              Confirmar pedido
            </Button>
          </>
        )}

        <View style={styles.navButtons}>
          {step > 0 && step < 4 && (
            <Button
              mode="outlined"
              onPress={() => setStep((s) => s - 1)}
              style={styles.navButton}
            >
              Atrás
            </Button>
          )}
          {step < 4 && (
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.navButton}
            >
              Siguiente
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  stepIndicator: { marginBottom: 16, textAlign: 'center', opacity: 0.7 },
  section: { marginBottom: 16, fontWeight: 'bold' },
  purifierLabel: { marginBottom: 16, opacity: 0.7 },
  label: { marginTop: 8, marginBottom: 4, fontWeight: '500' },
  input: { marginBottom: 12 },
  segment: { marginVertical: 12 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  orText: { textAlign: 'center', marginVertical: 12, opacity: 0.5 },
  hint: { marginBottom: 12, opacity: 0.6 },
  tipRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  tipButton: { minWidth: 60 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalRow: { borderTopWidth: 1, borderTopColor: '#ccc', marginTop: 8, paddingTop: 12 },
  confirmButton: { marginTop: 24, paddingVertical: 6 },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  navButton: { flex: 1, marginHorizontal: 4 },
});
