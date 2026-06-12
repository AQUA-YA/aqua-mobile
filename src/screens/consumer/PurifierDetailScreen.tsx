import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
  Avatar,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePurifier, usePurifierPrices } from '../../hooks/usePurifiers';
import { ErrorState } from '../../components/ErrorState';

export function PurifierDetailScreen({ route, navigation }: any) {
  const theme = useTheme();
  const { purifierId } = route.params;
  const { data: purifier, isLoading, isError, refetch, isRefetching } =
    usePurifier(purifierId);
  const { data: prices } = usePurifierPrices(purifierId);

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

  const p = purifier?.data?.data;
  if (!p) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar.Icon size={80} icon="water" />
          <Text variant="headlineSmall" style={styles.name}>
            {p.name}
          </Text>
          {p.averageRating && (
            <Text variant="bodyLarge">★ {p.averageRating.toFixed(1)}</Text>
          )}
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <List.Item
              title="Dirección"
              description={p.address}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
            />
            <List.Item
              title="Teléfono"
              description={p.phone || 'No disponible'}
              left={(props) => <List.Icon {...props} icon="phone" />}
            />
            <List.Item
              title="Horario"
              description={p.schedule || 'No especificado'}
              left={(props) => <List.Icon {...props} icon="clock" />}
            />
            {p.deliveryFee !== undefined && (
                <List.Item
                  title="Costo de envío"
                  description={
                    p.deliveryFee === 0
                      ? 'Gratis'
                      : `$${p.deliveryFee}`
                  }
                  left={(props) => <List.Icon {...props} icon="truck" />}
                />
            )}
          </Card.Content>
        </Card>

        {p.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {p.description}
          </Text>
        )}

        {prices?.data?.data && prices.data.data.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Precios
            </Text>
            {prices.data.data.map((price, idx) => (
              <Card key={idx} style={styles.priceCard}>
                <Card.Content style={styles.priceRow}>
                  <Text variant="bodyMedium">Tipo: {price.waterTypeId}</Text>
                  <Text variant="bodyMedium">
                    Tamaño: {price.bottleSizeId}
                  </Text>
                  <Text variant="bodyLarge" style={styles.price}>
                    ${price.price}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        <Button
          mode="contained"
          style={styles.orderButton}
          onPress={() =>
            navigation.navigate('CreateOrder', {
              purifierId: p._id,
              purifierName: p.name,
            })
          }
        >
          Pedir aquí
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center' },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  name: { marginTop: 12, fontWeight: 'bold' },
  infoCard: { marginBottom: 16 },
  description: { marginBottom: 16, opacity: 0.7 },
  sectionTitle: { marginBottom: 8, marginTop: 8 },
  priceCard: { marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontWeight: 'bold', color: '#0077B6' },
  orderButton: { marginTop: 24, paddingVertical: 6 },
});
