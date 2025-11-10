import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../src/components/ui/ThemedText';
import { ThemedView } from '../src/components/ui/ThemedView';
import { IconSymbol } from '../src/components/ui/IconSymbol';
import { useAuth } from '../src/contexts/AuthContext';
import { getUserTickets } from '../src/services/ticketService';
import { Ticket } from '../src/types';

export default function MyPurchasesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserTickets = useCallback(async () => {
    if (!userProfile?.uid) return;

    try {
      setLoading(true);
      const userTickets = await getUserTickets(userProfile.uid);
      setTickets(userTickets);
      console.log(`✅ Cargados ${userTickets.length} tickets`);
    } catch (error) {
      console.error('❌ Error cargando tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserTickets();
    setRefreshing(false);
  }, [loadUserTickets]);

  useEffect(() => {
    loadUserTickets();
  }, [loadUserTickets]);

  const handleTicketPress = (ticket: Ticket) => {
    router.push({
      pathname: '/purchase-confirmation' as any,
      params: {
        ticketId: ticket.id,
        userName: userProfile?.email || 'Usuario'
      }
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style="light" />
        <View style={[styles.statusBar, { paddingTop: insets.top }]} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Mis Compras</ThemedText>
          <View style={styles.backButton} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <ThemedText style={styles.loadingText}>Cargando tickets...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.statusBar, { paddingTop: insets.top }]} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Mis Compras</ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1E40AF"
          />
        }
      >
        {tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="ticket" size={64} color="#9CA3AF" />
            <ThemedText style={styles.emptyTitle}>
              No tienes compras realizadas
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Tus tickets aparecerán aquí después de realizar una compra
            </ThemedText>
          </View>
        ) : (
          <>
            <ThemedText style={styles.sectionTitle}>
              {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
            </ThemedText>
            
            {tickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketCard}
                onPress={() => handleTicketPress(ticket)}
                activeOpacity={0.7}
              >
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketIconContainer}>
                    <IconSymbol name="ticket" size={24} color="#1E40AF" />
                  </View>
                  <View style={styles.ticketInfo}>
                    <ThemedText style={styles.ticketMovieTitle}>
                      {ticket.movieTitle}
                    </ThemedText>
                    <ThemedText style={styles.ticketDateTime}>
                      {ticket.purchaseDate} | {ticket.purchaseTime}
                    </ThemedText>
                    <ThemedText style={styles.ticketCinema}>
                      {ticket.cinema.toUpperCase()}
                    </ThemedText>
                    <View style={styles.ticketStatsRow}>
                      <View style={styles.ticketStat}>
                        <ThemedText style={styles.ticketStatLabel}>Puntos:</ThemedText>
                        <ThemedText style={styles.ticketStatValue}>
                          {ticket.seats.length}
                        </ThemedText>
                      </View>
                      <View style={styles.ticketStat}>
                        <ThemedText style={styles.ticketStatLabel}>Visitas Acumuladas:</ThemedText>
                        <ThemedText style={styles.ticketStatValue}>1</ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statusBar: {
    backgroundColor: '#1E40AF',
  },
  header: {
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#1E40AF',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ticketIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketMovieTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  ticketDateTime: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 3,
  },
  ticketCinema: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  ticketStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  ticketStat: {
    flex: 1,
  },
  ticketStatLabel: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 1,
  },
  ticketStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
  },
});
