import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ThemedText } from './ui/ThemedText';
import { router } from 'expo-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/(auth)/login' 
}) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo as any);
    }
  }, [user, loading, redirectTo]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <ThemedText style={styles.loadingText}>Verificando autenticación...</ThemedText>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>Redirigiendo al login...</ThemedText>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});