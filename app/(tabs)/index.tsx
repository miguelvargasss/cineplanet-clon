import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function TabIndex() {
  useEffect(() => {
    // Asegurar que la navegación se ejecute después del primer render
    const navigationTimer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 100);

    return () => clearTimeout(navigationTimer);
  }, []);

  // Mostrar un indicador de carga mientras se redirige
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
