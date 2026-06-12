import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Captura cualquier error de render en el árbol de componentes para que la app
// no se cierre sola. Muestra un mensaje y permite reintentar.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // En producción aquí se enviaría a un servicio de reportes (Sentry, etc.).
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text variant="headlineSmall" style={styles.title}>
              Algo salió mal
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              Ocurrió un error inesperado en esta pantalla. Puedes reintentar.
            </Text>
            <Button mode="contained" onPress={this.handleReset} style={styles.button}>
              Reintentar
            </Button>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { padding: 24, alignItems: 'center' },
  title: { fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  message: { textAlign: 'center', opacity: 0.7, marginBottom: 24 },
  button: { minWidth: 160 },
});
