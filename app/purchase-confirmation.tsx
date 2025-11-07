import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/src/components/ui/ThemedView';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { getTicketById } from '@/src/services/ticketService';
import { Ticket } from '@/src/types';

export default function PurchaseConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        if (params.ticketId && typeof params.ticketId === 'string') {
          const ticketData = await getTicketById(params.ticketId);
          if (ticketData) {
            setTicket(ticketData);
          }
        }
      } catch (error) {
        console.error('Error loading ticket:', error);
        Alert.alert('Error', 'No se pudo cargar el ticket');
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [params.ticketId]);

  const handleBackToMovies = () => {
    router.replace('/movies');
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </ThemedView>
    );
  }

  if (!ticket) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>No se encontró el ticket</ThemedText>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackToMovies}
        >
          <Text style={styles.backButtonText}>Volver a películas</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon} 
          onPress={handleBackToMovies}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Confirmación de Pago</ThemedText>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Cineplanet */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://logosenvector.com/logo/img/cineplanet-351.jpg' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Movie Title */}
        <ThemedText style={styles.movieTitle}>{ticket.movieTitle}</ThemedText>

        {/* Purchase Code */}
        <View style={styles.purchaseCodeBox}>
          <Text style={styles.purchaseLabel}>Compra No:</Text>
          <Text style={styles.purchaseCode}>{ticket.purchaseCode}</Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode
            value={ticket.qrData}
            size={220}
            backgroundColor="white"
            color="black"
          />
        </View>

        {/* Ticket Information */}
        <View style={styles.infoCard}>
          {/* User */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={24} color="#2563eb" />
            </View>
            <Text style={styles.infoValue}>{ticket.userName || 'Usuario'}</Text>
          </View>

          {/* Cinema */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location-outline" size={24} color="#2563eb" />
            </View>
            <Text style={styles.infoValue}>{ticket.cinema}</Text>
          </View>

          {/* Date */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={24} color="#2563eb" />
            </View>
            <Text style={styles.infoValue}>{ticket.purchaseDate}</Text>
          </View>

          {/* Time */}
          <View style={[styles.infoRow, styles.highlightRow]}>
            <View style={styles.infoIcon}>
              <Ionicons name="time-outline" size={24} color="white" />
            </View>
            <Text style={styles.highlightValue}>{ticket.purchaseTime}</Text>
          </View>

          {/* Sala */}
          <View style={[styles.infoRow, styles.highlightRow]}>
            <View style={styles.infoIcon}>
              <Ionicons name="film-outline" size={24} color="white" />
            </View>
            <Text style={styles.highlightValue}>{ticket.sala}</Text>
          </View>

          {/* Seats */}
          <View style={[styles.infoRow, styles.highlightRow, styles.lastRow]}>
            <View style={styles.infoIcon}>
              <Ionicons name="grid-outline" size={24} color="white" />
            </View>
            <Text style={styles.highlightValue}>{ticket.seats.join(', ')}</Text>
          </View>
        </View>

        {/* Warning Message */}
        <View style={styles.warningBox}>
          <Ionicons name="card-outline" size={20} color="#B91C1C" />
          <Text style={styles.warningText}>
            Muestra el código QR desde tu celular para canjear tus combos e 
            ingresar a la sala. No necesitas pasar por boletería ni imprimir 
            este documento.
          </Text>
        </View>

        {/* Visits and Points */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Visitas Acumuladas: {ticket.visits}</Text>
          <Text style={styles.statsText}>Puntos: {ticket.points.toFixed(2)}</Text>
        </View>

        {/* Tickets Section */}
        {ticket.tickets && ticket.tickets.length > 0 && (
          <View style={styles.purchaseSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="ticket-outline" size={20} color="#003DA5" />
              <Text style={styles.sectionTitle}>Entradas</Text>
            </View>
            {ticket.tickets.map((ticketItem, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemDescription}>
                  {ticketItem.type} {ticketItem.quantity > 1 && `(Expires ${ticket.purchaseDate})`}
                </Text>
                <Text style={styles.itemQuantity}>Cant. {ticketItem.quantity}</Text>
                <Text style={styles.itemPrice}>S/ {(ticketItem.price * ticketItem.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Sub Total :</Text>
              <Text style={styles.subtotalValue}>
                S/ {ticket.tickets.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Snacks Section */}
        {ticket.snacks && ticket.snacks.length > 0 && (
          <View style={styles.purchaseSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fast-food-outline" size={20} color="#003DA5" />
              <Text style={styles.sectionTitle}>Dulcería</Text>
            </View>
            {ticket.snacks.map((snack, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemDescription}>{snack.name}</Text>
                <Text style={styles.itemQuantity}>Cant. {snack.quantity}</Text>
                <Text style={styles.itemPrice}>S/ {(snack.price * snack.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Sub Total :</Text>
              <Text style={styles.subtotalValue}>
                S/ {ticket.snacks.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Total Cost */}
        <View style={styles.totalCostContainer}>
          <Text style={styles.totalCostLabel}>Costo Total :</Text>
          <Text style={styles.totalCostValue}>S/ {ticket.totalAmount.toFixed(2)}</Text>
        </View>

        {/* Conditions */}
        <View style={styles.conditionsContainer}>
          <Text style={styles.conditionsTitle}>Condiciones de compra</Text>
          <Text style={styles.conditionsText}>• Esta compra no permite cambio, anulación o devolución.</Text>
          <Text style={styles.conditionsText}>• No es necesario imprimir esta orden de compra, muéstralo desde tu dispositivo móvil.</Text>
          <Text style={styles.conditionsText}>• Respeta los protocolos de prevención covid-19 en nuestras instalaciones.</Text>
          <Text style={styles.conditionsText}>• Conoce nuestras <Text style={styles.linkText}>Reglas de convivencia</Text></Text>
          <Text style={styles.conditionsText}>• Para acceder a la boleta electrónica de tu compra, escribe al correo <Text style={styles.linkText}>experiencia@cineplanet.com.pe</Text></Text>
          <Text style={styles.conditionsText}>• Consulta nuestros <Text style={styles.linkText}>Términos y condiciones</Text></Text>
        </View>

        <Text style={styles.footerText}>Gracias por elegirnos ¡Disfruta tu película!</Text>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#1e40af',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 60,
  },
  movieTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
    color: '#003DA5',
  },
  purchaseCodeBox: {
    backgroundColor: '#003DA5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  purchaseLabel: {
    color: 'white',
    fontSize: 14,
    marginRight: 10,
  },
  purchaseCode: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#003DA5',
    borderStyle: 'dashed',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#003DA5',
    borderStyle: 'dashed',
  },
  highlightRow: {
    backgroundColor: '#1e40af',
    borderRadius: 0,
    paddingHorizontal: 0,
    marginTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#003DA5',
    borderStyle: 'dashed',
  },
  infoIcon: {
    width: 24,
    marginRight: 15,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  highlightValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    flex: 1,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  warningBox: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 12,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  purchaseSection: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#003DA5',
    borderStyle: 'dashed',
    padding: 15,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003DA5',
    marginLeft: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemDescription: {
    flex: 2,
    fontSize: 13,
    color: '#1a1a1a',
  },
  itemQuantity: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
    textAlign: 'right',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#003DA5',
    marginVertical: 10,
    borderStyle: 'dashed',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  subtotalValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  totalCostContainer: {
    backgroundColor: '#003DA5',
    borderRadius: 4,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalCostLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  totalCostValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  conditionsContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  conditionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  conditionsText: {
    fontSize: 12,
    color: '#1a1a1a',
    lineHeight: 18,
    marginBottom: 6,
  },
  linkText: {
    color: '#dc2626',
    textDecorationLine: 'underline',
  },
  footerText: {
    fontSize: 14,
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    fontWeight: '500',
  },
});