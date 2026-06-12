import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogout } from '../../hooks/useAuth';
import { useMyLoyalty } from '../../hooks/useBusiness';

export function ConsumerProfileScreen({ navigation }: any) {
  const theme = useTheme();
  const { logout } = useLogout();
  const { data: loyaltyData } = useMyLoyalty();

  const totalPoints = loyaltyData?.data?.data?.totalPoints ?? 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Perfil
        </Text>

        <Card style={styles.card} onPress={() => navigation.navigate('Loyalty')}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">Puntos de lealtad</Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {totalPoints} pts
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Subscriptions')}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">Suscripciones</Text>
            <Text variant="bodySmall">Pedidos recurrentes</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Referrals')}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">Referidos</Text>
            <Text variant="bodySmall">Invita y gana</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Support')}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">Soporte</Text>
            <Text variant="bodySmall">Tickets de ayuda</Text>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={logout} style={styles.logout}>
          Cerrar sesión
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24 },
  title: { marginBottom: 24, textAlign: 'center' },
  card: { marginBottom: 12 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logout: { marginTop: 'auto' },
});
