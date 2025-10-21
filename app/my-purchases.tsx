import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../src/components/ui/ThemedText';
import { ThemedView } from '../src/components/ui/ThemedView';
import { IconSymbol } from '../src/components/ui/IconSymbol';
import { useAuth } from '../src/contexts/AuthContext';
import { getUserTicketPurchases } from '../src/services/ticketService';
import { getMovieById } from '../src/services/moviesService';
import { getCinemaById } from '../src/data/cinemas';
import { TicketPurchase } from '../src/types';

interface PurchaseWithDetails extends TicketPurchase {
  movieTitle: string;
  cinemaName: string;
  showtimeDate: string;
  showtimeTime: string;
  points: number;
  accumulatedVisits: number;
}

export default function MyPurchasesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserPurchases = useCallback(async () => {
    if (!userProfile?.uid) return;

    try {
      setLoading(true);
      
      const userPurchases = await getUserTicketPurchases(userProfile.uid);
      
      // Contar vistas acumuladas por película
      // IMPORTANTE: 1 compra = 1 vista (sin importar cuántos asientos)
      const movieVisitCounts: { [movieId: string]: number } = {};
      userPurchases.forEach(purchase => {
        if (purchase.status === 'confirmed') {
          // Cada compra confirmada = 1 vista adicional para esa película
          movieVisitCounts[purchase.movieId] = (movieVisitCounts[purchase.movieId] || 0) + 1;
        }
      });
      
      // Mapear las compras con información adicional
      const purchasesWithDetails: PurchaseWithDetails[] = await Promise.all(
        userPurchases.map(async (purchase, index) => {
          // Obtener información de la película
          let movieTitle = 'Película';
          try {
            const movie = await getMovieById(purchase.movieId);
            movieTitle = movie?.title || 'Película Desconocida';
          } catch (error) {
            console.log('❌ [PURCHASES] Error obteniendo película:', error);
          }

          // Obtener información del cine
          let cinemaName = 'CINEPLANET';
          try {
            const cinema = getCinemaById(purchase.cinemaId);
            cinemaName = cinema?.name || purchase.cinemaId.toUpperCase();
          } catch (error) {
            console.log('❌ [PURCHASES] Error obteniendo cine:', error);
          }

          // Calcular puntos basado en el tipo de entrada
          const points = calculatePurchasePoints(purchase);
          
          // Obtener vistas acumuladas para esta película
          const accumulatedVisits = movieVisitCounts[purchase.movieId] || 0;
          
          return {
            ...purchase,
            movieTitle,
            cinemaName,
            showtimeDate: formatPurchaseDate(purchase.purchaseDate),
            showtimeTime: formatPurchaseTime(purchase.purchaseDate),
            points,
            accumulatedVisits,
          };
        })
      );

      // Ordenar por fecha de compra (más recientes primero)
      purchasesWithDetails.sort((a, b) => 
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      );

      setPurchases(purchasesWithDetails);
    } catch (error) {
      console.error('❌ [PURCHASES] Error cargando compras del usuario:', error);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    loadUserPurchases();
  }, [loadUserPurchases]);

  const calculatePurchasePoints = (purchase: TicketPurchase): number => {
    // ✨ SISTEMA DE PUNTOS CINEPLANET:
    // 
    // EJEMPLO DE TU CASO:
    // - 4 butacas compradas:
    //   * 2 "Entrada Socio Clásico OL" (15.50 cada una) = 2 × 5 puntos = 10 puntos
    //   * 2 "50% Promo Amex 2025" (12.00 cada una) = 2 × 0 puntos = 0 puntos
    //   * TOTAL: 10 puntos
    //   * VISITAS: 1 (porque es una sola compra)
    //
    // REGLAS:
    // - Solo "Entrada Socio Clásico OL" otorga puntos (5 puntos por entrada)
    // - Cualquier otra entrada NO otorga puntos
    // - 1 compra = 1 vista (sin importar cuántos asientos)
    
    const seatsCount = purchase.seats.length;
    const pricePerSeat = purchase.totalPrice / seatsCount;
    
    // Si el precio por asiento coincide con "Entrada Socio Clásico OL" (15.50 soles)
    // O está en el rango de entradas de beneficio (14-17 soles para tolerancia)
    if (pricePerSeat >= 14 && pricePerSeat <= 17) {
      // Asumimos que todas las entradas en este rango de precio son "Entrada Socio Clásico OL"
      return seatsCount * 5; // 5 puntos por entrada
    }
    
    // Para cualquier otro tipo de entrada (50% Promo Amex, General, etc.)
    return 0; // No dan puntos
  };

  const formatPurchaseDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPurchaseTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPurchaseItem = (purchase: PurchaseWithDetails) => {
    return (
      <View style={styles.purchaseItem}>
        {/* Contenido principal */}
        <View style={styles.purchaseContent}>
          {/* Icono de película */}
          <View style={styles.movieIconContainer}>
            <IconSymbol name="film" size={24} color="#1E40AF" />
          </View>

          {/* Información de la compra */}
          <View style={styles.purchaseInfo}>
            {/* Título de la película */}
            <ThemedText style={styles.movieTitle}>
              {purchase.movieTitle.toUpperCase()}
            </ThemedText>

            {/* Fecha y hora */}
            <ThemedText style={styles.purchaseDateTime}>
              {purchase.showtimeDate} | {purchase.showtimeTime}
            </ThemedText>

            {/* Cinema */}
            <ThemedText style={styles.cinemaName}>
              {purchase.cinemaName.toUpperCase()}
            </ThemedText>

            {/* Puntos y Visitas en la misma línea */}
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsText}>
                Puntos: <ThemedText style={[
                  styles.statsValue,
                  { color: purchase.points > 0 ? '#1E40AF' : '#6B7280' }
                ]}>
                  {purchase.points > 0 ? purchase.points.toFixed(2) : '0.00'}
                </ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.statsText}>
                Visitas Acumuladas: <ThemedText style={styles.statsValue}>
                  {purchase.accumulatedVisits}
                </ThemedText>
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" backgroundColor="#1E40AF" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Mis Compras</ThemedText>
        
        {/* Placeholder para balancear el header */}
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Contenido */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E40AF" />
            <ThemedText style={styles.loadingText}>
              Cargando tus compras...
            </ThemedText>
          </View>
        ) : purchases.length > 0 ? (
          <>
            {purchases.map((purchase, index) => (
              <View key={purchase.id}>
                {renderPurchaseItem(purchase)}
                {index < purchases.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <IconSymbol name="film" size={64} color="#9CA3AF" />
            <ThemedText style={styles.emptyTitle}>
              No tienes compras aún
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Cuando realices tu primera compra de entradas, aparecerá aquí.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  purchaseItem: {
    backgroundColor: '#FFFFFF',
  },
  purchaseContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  movieIconContainer: {
    marginRight: 16,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  purchaseInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
    lineHeight: 20,
  },
  purchaseDateTime: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  cinemaName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsText: {
    fontSize: 14,
    color: '#374151',
  },
  statsValue: {
    fontWeight: '600',
  },
});