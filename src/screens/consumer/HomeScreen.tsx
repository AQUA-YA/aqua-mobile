import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  useTheme,
  ActivityIndicator,
  Avatar,
  Searchbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNearbyPurifiers,
  useWaterTypes,
  useBottleSizes,
} from '../../hooks/usePurifiers';
import { useMyOrders } from '../../hooks/useOrders';
import { useAuthStore } from '../../store/authStore';
import { ErrorState } from '../../components/ErrorState';
import type { Purifier } from '../../types/models';

export function ConsumerHomeScreen({ navigation }: any) {
  const theme = useTheme();
  const user = useAuthStore(s => s.user);
  const [search, setSearch] = useState('');
  const [selectedWaterType, setSelectedWaterType] = useState<
    string | undefined
  >();
  const [selectedBottleSize, setSelectedBottleSize] = useState<
    string | undefined
  >();
  const [refreshing, setRefreshing] = useState(false);

  const { data: waterTypes } = useWaterTypes();
  const { data: bottleSizes } = useBottleSizes();
  const {
    data: nearby,
    refetch: refetchNearby,
    isLoading,
    isError,
    isRefetching,
  } = useNearbyPurifiers({
    lat: 19.4326,
    lng: -99.1332,
    radiusKm: 10,
    waterTypeId: selectedWaterType,
    bottleSizeId: selectedBottleSize,
    search: search || undefined,
  });

  const { data: recentOrders } = useMyOrders();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchNearby();
    setRefreshing(false);
  };

  const profileIncomplete = !user?.firstName || !user?.lastName;

  const purifiers = nearby?.data?.data || [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={purifiers}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {profileIncomplete && (
              <Card style={styles.banner}>
                <Card.Content style={styles.bannerContent}>
                  <Text variant="bodyMedium">
                    Completa tu perfil para una mejor experiencia
                  </Text>
                  <Button
                    mode="text"
                    compact
                    onPress={() => navigation.navigate('Profile')}
                  >
                    Completar
                  </Button>
                </Card.Content>
              </Card>
            )}

            <Text variant="headlineSmall" style={styles.greeting}>
              ¡Hola{user?.firstName ? `, ${user.firstName}` : ''}!
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              ¿Qué agua necesitas hoy?
            </Text>

            <Searchbar
              placeholder="Buscar purificadora..."
              onChangeText={setSearch}
              value={search}
              style={styles.search}
            />

            {waterTypes?.data?.data?.data && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chips}
              >
                <Chip
                  selected={!selectedWaterType}
                  onPress={() => setSelectedWaterType(undefined)}
                  style={styles.chip}
                >
                  Todas
                </Chip>
                {waterTypes.data.data.data
                  .filter(wt => wt.isActive)
                  .map(wt => (
                    <Chip
                      key={wt._id}
                      selected={selectedWaterType === wt._id}
                      onPress={() => setSelectedWaterType(wt._id)}
                      style={styles.chip}
                    >
                      {wt.name}
                    </Chip>
                  ))}
              </ScrollView>
            )}

            {bottleSizes?.data?.data?.data && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chips}
              >
                <Chip
                  selected={!selectedBottleSize}
                  onPress={() => setSelectedBottleSize(undefined)}
                  style={styles.chip}
                >
                  Todos
                </Chip>
                {bottleSizes.data.data.data
                  .filter(bs => bs.isActive)
                  .map(bs => (
                    <Chip
                      key={bs._id}
                      selected={selectedBottleSize === bs._id}
                      onPress={() => setSelectedBottleSize(bs._id)}
                      style={styles.chip}
                    >
                      {bs.name || `${bs.liters}L`}
                    </Chip>
                  ))}
              </ScrollView>
            )}

            {isLoading && <ActivityIndicator style={styles.loading} />}

            {isError && (
              <ErrorState
                fullScreen={false}
                onRetry={() => refetchNearby()}
                retrying={isRefetching}
              />
            )}

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Purificadoras cercanas
            </Text>

            {!purifiers.length && !isLoading && !isError && (
              <Text style={styles.emptyText}>
                No hay purificadoras disponibles cerca
              </Text>
            )}
          </>
        }
        renderItem={({ item }: { item: Purifier }) => (
          <Card
            style={styles.purifierCard}
            onPress={() =>
              (navigation as any).navigate('PurifierDetail', {
                purifierId: item._id,
              })
            }
          >
            <Card.Content style={styles.purifierContent}>
              <View style={styles.purifierInfo}>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="bodySmall" style={styles.address}>
                  {item.address}
                </Text>
                {item.averageRating && (
                  <Text variant="bodySmall">
                    ★ {item.averageRating.toFixed(1)}
                  </Text>
                )}
                {(item as any).distance && (
                  <Text variant="bodySmall">
                    {(item as any).distance.toFixed(1)} km
                  </Text>
                )}
              </View>
              <Avatar.Icon size={48} icon="water" />
            </Card.Content>
          </Card>
        )}
        ListFooterComponent={
          <>
            {recentOrders && recentOrders.length > 0 && (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Pedidos recientes
                </Text>
                {recentOrders.slice(0, 5).map(order => (
                  <Card
                    key={order._id}
                    style={styles.orderCard}
                    onPress={() =>
                      (navigation as any).navigate('ActiveOrder', {
                        orderId: order._id,
                      })
                    }
                  >
                    <Card.Content>
                      <View style={styles.orderRow}>
                        <Text variant="bodyMedium">
                          {order.quantity} garrafón(es)
                        </Text>
                        <Text variant="bodyMedium">${order.total}</Text>
                      </View>
                      <Text variant="bodySmall">
                        Estado:{' '}
                        {order.status === 'pending'
                          ? 'Pendiente'
                          : order.status === 'accepted'
                          ? 'Aceptado'
                          : order.status === 'in_transit'
                          ? 'En reparto'
                          : order.status === 'delivered'
                          ? 'Entregado'
                          : order.status === 'cancelled'
                          ? 'Cancelado'
                          : order.status}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  greeting: { paddingHorizontal: 16, marginTop: 16 },
  subtitle: { paddingHorizontal: 16, marginBottom: 8, opacity: 0.7 },
  search: { margin: 16 },
  chips: { paddingLeft: 16, marginBottom: 8 },
  chip: { marginRight: 8 },
  loading: { margin: 16 },
  sectionTitle: { paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  emptyText: {
    paddingHorizontal: 16,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 24,
  },
  purifierCard: { marginHorizontal: 16, marginBottom: 8 },
  purifierContent: { flexDirection: 'row', alignItems: 'center' },
  purifierInfo: { flex: 1 },
  address: { opacity: 0.6, marginTop: 2 },
  orderCard: { marginHorizontal: 16, marginBottom: 8 },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  banner: { margin: 16, backgroundColor: '#E3F2FD' },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
