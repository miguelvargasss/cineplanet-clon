import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/src/contexts/AuthContext';
import { Movie, getMovieById } from '@/src/services/moviesServiceAdapter';
import { getSeatsByCinemaAndShowtimeUseCase } from '@/src/config/dependencies';

const { width } = Dimensions.get('window');

interface Seat {
  id: string;
  row: string;
  number: number;
  isOccupied: boolean;
  isWheelchair: boolean;
  isSelected: boolean;
}

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  isDiscounted?: boolean;
  originalPrice?: number;
}

const ticketTypes: TicketType[] = [
  {
    id: 'amex_promo',
    name: '50% Promo Amex 2025',
    description: 'Exclusivo con tu tarjeta American Express',
    price: 8.25,
    isDiscounted: true,
    originalPrice: 16.50
  },
  {
    id: 'general_2d',
    name: 'General 2D OL',
    description: 'Incluye servicio online',
    price: 16.50
  },
  {
    id: 'conadis_2d',
    name: 'Boleto Conadis 2D OL',
    description: 'Descuento solo para personas con discapacidad. Presenta tu DNI y Carnet Conadis en la taquilla antes de ingresar a sala',
    price: 10.50
  }
];

export default function SeatSelectionScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useAuth();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [purchasedSeats, setPurchasedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'seats' | 'tickets' | 'snacks' | 'payment'>('seats');
  
  // Estados para la sección de entradas
  const [currentSection, setCurrentSection] = useState<'seats' | 'tickets'>('seats');
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Estados del cronómetro
  const [timeLeft, setTimeLeft] = useState(210); // 3:30 minutos = 210 segundos
  const [showTimeoutAlert, setShowTimeoutAlert] = useState(false);

  // Datos del showtime seleccionado
  const movieId = params.movieId as string;
  const showtimeId = params.showtimeId as string;
  const cinemaId = params.cinemaId as string;
  const time = params.time as string;
  const price = parseFloat(params.price as string);
  const date = params.date as string;

  // Colores del header - SIN fondo azul
  const statusBarColor = '#051135ff';
  const headerColor = '#FFFFFF'; // Cambiado a blanco

  useEffect(() => {
    loadMovieAndSeats();
    loadPurchasedSeats();
  }, []);

  // Cronómetro - cuenta regresiva
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setShowTimeoutAlert(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatear tiempo mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Manejar expiración del tiempo
  const handleTimeExpired = () => {
    setShowTimeoutAlert(false);
    router.back(); // Regresar a la pantalla anterior (detalles de película)
  };

  // Cargar asientos comprados desde localStorage
  const loadPurchasedSeats = () => {
    try {
      const storageKey = `purchased_seats_${movieId}_${showtimeId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setPurchasedSeats(JSON.parse(stored));
      }
    } catch (error) {
      console.log('No localStorage available (React Native)');
    }
  };

  // Guardar asientos comprados en localStorage
  const savePurchasedSeats = (seats: string[]) => {
    try {
      const storageKey = `purchased_seats_${movieId}_${showtimeId}`;
      localStorage.setItem(storageKey, JSON.stringify(seats));
      setPurchasedSeats(seats);
    } catch (error) {
      console.log('No localStorage available (React Native)');
    }
  };

  const loadMovieAndSeats = async () => {
    try {
      setLoading(true);
      
      // Cargar información de la película usando el adaptador
      if (movieId) {
        const movieData = await getMovieById(movieId);
        setMovie(movieData);
      }

      // Cargar asientos usando el nuevo caso de uso
      if (cinemaId && showtimeId) {
        const seatsData = await getSeatsByCinemaAndShowtimeUseCase.execute(cinemaId, showtimeId);
        // Convertir los asientos del dominio al formato local
        const localSeats = seatsData.map(seat => ({
          id: seat.id,
          row: seat.row,
          number: seat.number,
          isOccupied: false, // Forzar todos como disponibles para demostración
          isWheelchair: seat.isWheelchair,
          isSelected: false
        }));
        setSeats(localSeats);
      } else {
        // Fallback: generar asientos si no tenemos datos
        generateSeats();
      }
    } catch (error) {
      console.error('Error loading movie and seats:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la sala');
      // Fallback: generar asientos
      generateSeats();
    } finally {
      setLoading(false);
    }
  };

  const generateSeats = () => {
    const newSeats: Seat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    
    rows.forEach(row => {
      for (let i = 1; i <= 12; i++) { // Reducir a 12 asientos por fila
        const seatId = `${row}${i}`;
        newSeats.push({
          id: seatId,
          row,
          number: i,
          isOccupied: false, // Ningún asiento ocupado por defecto
          isWheelchair: row === 'A' && (i === 1 || i === 2),
          isSelected: false
        });
      }
    });
    
    setSeats(newSeats);
  };

  const handleTabPress = (tab: 'seats' | 'tickets' | 'snacks' | 'payment') => {
    if (tab === 'seats') {
      // Regresar a la sección de asientos
      setCurrentSection('seats');
      setCurrentTab('seats');
      return;
    }
    
    if (tab === 'tickets') {
      // Ir a la sección de entradas (solo si hay asientos seleccionados)
      if (selectedSeats.length === 0) {
        Alert.alert('Selecciona asientos', 'Debes seleccionar al menos un asiento para continuar');
        return;
      }
      setCurrentSection('tickets');
      setCurrentTab('tickets');
      return;
    }
    
    // Para snacks y payment, verificar que se hayan completado los pasos anteriores
    if (selectedSeats.length === 0) {
      Alert.alert('Selecciona asientos', 'Debes seleccionar al menos un asiento para continuar');
      return;
    }
    
    if (tab === 'snacks' || tab === 'payment') {
      // Verificar que se hayan seleccionado las entradas necesarias
      if (currentSection === 'tickets' && !canContinueFromTickets()) {
        Alert.alert('Completa la selección', 'Debes seleccionar el mismo número de entradas que asientos');
        return;
      }
    }
    
    // Simular navegación para otras secciones
    Alert.alert('Navegación', `Navegando a: ${tab}`);
    setCurrentTab(tab);
  };

  const handleTicketSelection = (ticketId: string, change: number) => {
    setSelectedTickets(prev => {
      const currentCount = prev[ticketId] || 0;
      let newCount = Math.max(0, currentCount + change);
      
      // Calcular el total actual de entradas (sin incluir este cambio)
      const currentTotal = Object.entries(prev).reduce((sum, [id, count]) => {
        return id === ticketId ? sum : sum + count;
      }, 0);
      
      // Verificar que no se exceda el límite de asientos seleccionados
      if (currentTotal + newCount > selectedSeats.length) {
        // Si se intenta agregar más entradas de las permitidas, ajustar al máximo permitido
        newCount = Math.max(0, selectedSeats.length - currentTotal);
      }
      
      const updated = { ...prev, [ticketId]: newCount };
      
      // Eliminar entradas con count 0 para limpiar el objeto
      if (newCount === 0) {
        delete updated[ticketId];
      }
      
      // Calcular precio total
      const newTotalPrice = Object.entries(updated).reduce((total, [id, count]) => {
        const ticket = ticketTypes.find(t => t.id === id);
        return total + (ticket ? ticket.price * count : 0);
      }, 0);
      
      setTotalPrice(newTotalPrice);
      
      return updated;
    });
  };

  const getTotalTicketsSelected = () => {
    return Object.values(selectedTickets).reduce((sum, count) => sum + count, 0);
  };

  const canContinueFromTickets = () => {
    return getTotalTicketsSelected() === selectedSeats.length;
  };

  const renderTicketRow = (ticket: TicketType) => {
    const count = selectedTickets[ticket.id] || 0;
    
    return (
      <View key={ticket.id} style={styles.ticketRow}>
        <View style={styles.ticketInfo}>
          <ThemedText style={styles.ticketName}>{ticket.name}</ThemedText>
          <ThemedText style={styles.ticketDescription}>{ticket.description}</ThemedText>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.ticketPrice}>S/ {ticket.price.toFixed(2)}</ThemedText>
            {ticket.isDiscounted && ticket.originalPrice && (
              <ThemedText style={styles.originalPrice}>Precio más Bajo</ThemedText>
            )}
          </View>
        </View>
        
        <View style={styles.ticketControls}>
          <TouchableOpacity 
            style={[styles.controlButton, count === 0 && styles.controlButtonDisabled]}
            onPress={() => handleTicketSelection(ticket.id, -1)}
            disabled={count === 0}
          >
            <ThemedText style={[styles.controlButtonText, count === 0 && styles.controlButtonTextDisabled]}>
              −
            </ThemedText>
          </TouchableOpacity>
          
          <ThemedText style={styles.ticketCount}>{count}</ThemedText>
          
          <TouchableOpacity 
            style={[styles.controlButton, getTotalTicketsSelected() >= selectedSeats.length && styles.controlButtonDisabled]}
            onPress={() => handleTicketSelection(ticket.id, 1)}
            disabled={getTotalTicketsSelected() >= selectedSeats.length}
          >
            <ThemedText style={[styles.controlButtonText, getTotalTicketsSelected() >= selectedSeats.length && styles.controlButtonTextDisabled]}>
              +
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const toggleSeatSelection = (seatId: string) => {
    setSeats(prevSeats => {
      return prevSeats.map(seat => {
        if (seat.id === seatId && !seat.isOccupied && !purchasedSeats.includes(seatId)) {
          const newIsSelected = !seat.isSelected;
          
          // Actualizar lista de asientos seleccionados
          if (newIsSelected) {
            setSelectedSeats(prev => [...prev, seatId]);
          } else {
            setSelectedSeats(prev => {
              const updated = prev.filter(id => id !== seatId);
              
              // Si no hay asientos seleccionados, regresar a la sección de asientos
              if (updated.length === 0) {
                setCurrentSection('seats');
                setCurrentTab('seats');
                // Limpiar selección de tickets
                setSelectedTickets({});
                setTotalPrice(0);
              } else {
                // Si hay menos asientos que entradas seleccionadas, ajustar entradas
                const totalTickets = Object.values(selectedTickets).reduce((sum, count) => sum + count, 0);
                if (totalTickets > updated.length) {
                  // Reducir proporcionalmente las entradas seleccionadas
                  const newTickets = { ...selectedTickets };
                  let excessTickets = totalTickets - updated.length;
                  
                  // Reducir tickets empezando por los que tienen más cantidad
                  const sortedTickets = Object.entries(newTickets)
                    .filter(([_, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a);
                  
                  for (const [ticketId, count] of sortedTickets) {
                    if (excessTickets <= 0) break;
                    const reduceBy = Math.min(count, excessTickets);
                    newTickets[ticketId] = count - reduceBy;
                    if (newTickets[ticketId] === 0) {
                      delete newTickets[ticketId];
                    }
                    excessTickets -= reduceBy;
                  }
                  
                  setSelectedTickets(newTickets);
                  
                  // Recalcular precio
                  const newTotalPrice = Object.entries(newTickets).reduce((total, [id, count]) => {
                    const ticket = ticketTypes.find(t => t.id === id);
                    return total + (ticket ? ticket.price * count : 0);
                  }, 0);
                  setTotalPrice(newTotalPrice);
                }
              }
              
              return updated;
            });
          }
          
          return { ...seat, isSelected: newIsSelected };
        }
        return seat;
      });
    });
  };

  const getSeatColor = (seat: Seat) => {
    if (purchasedSeats.includes(seat.id)) {
      return '#DC2626'; // Rojo para asientos comprados
    }
    if (seat.isSelected) {
      return '#3B82F6'; // Azul para asientos seleccionados
    }
    if (seat.isOccupied) {
      return '#9CA3AF'; // Gris para asientos ocupados
    }
    return '#FFFFFF'; // Blanco para asientos disponibles
  };

  const renderSeatRow = (rowLetter: string) => {
    const rowSeats = seats.filter(seat => seat.row === rowLetter);
    
    return (
      <View key={rowLetter} style={styles.seatRow}>
        <ThemedText style={styles.rowLabel}>{rowLetter}</ThemedText>
        <View style={styles.seatsContainer}>
          {rowSeats.map((seat, index) => (
            <TouchableOpacity
              key={seat.id}
              style={[
                styles.seat,
                { backgroundColor: getSeatColor(seat) },
                seat.isWheelchair && styles.wheelchairSeat,
                index === 2 && styles.seatGapAfter, // Gap después del asiento 3
                index === 8 && styles.seatGapAfter, // Gap después del asiento 9
              ]}
              onPress={() => toggleSeatSelection(seat.id)}
              disabled={seat.isOccupied || purchasedSeats.includes(seat.id)}
            >
              {seat.isWheelchair ? (
                <IconSymbol name="wheelchair" size={12} color="#FFFFFF" />
              ) : seat.isSelected ? (
                <ThemedText style={styles.seatNumber}>
                  {seat.row}{seat.number}
                </ThemedText>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle="light-content" backgroundColor={statusBarColor} />
        <View style={[styles.statusBar, { backgroundColor: statusBarColor }]} />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Cargando asientos...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={statusBarColor} />
      <View style={[styles.statusBar, { backgroundColor: statusBarColor }]} />
      
      {/* Header mejorado con detalles de película */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <View style={styles.headerContent}>
          {/* Lado izquierdo - Detalles de película */}
          <View style={styles.movieInfoSection}>
            <ThemedText style={styles.movieTitleHeader}>
              {movie?.title?.toUpperCase() || 'AVATAR: EL CAMINO DEL AGUA [2022]'}
            </ThemedText>
            
            <ThemedText style={styles.movieDetails}>
              {userProfile?.cinemaId || 'Cp Santa Clara Qhatu'} Plaza, Sala {params.salaId || '2'} | {params.format || '3D'}, {params.quality || 'REGULAR'}, {params.language || 'DOBLADA'}
            </ThemedText>
            
            <ThemedText style={styles.movieDateTime}>
              {time || '21:00'} | {date ? new Date(date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }).replace(/^\w/, c => c.toUpperCase()) : 'Hoy, Lunes 6 de Octubre de 2025'}
            </ThemedText>
          </View>

          {/* Lado derecho - Cronómetro y carrito apilados */}
          <View style={styles.rightSection}>
            <View style={styles.timerContent}>
              <IconSymbol name="clock" size={16} color="#2563EB" />
              <ThemedText style={styles.timerText}>{formatTime(timeLeft)}</ThemedText>
            </View>
            
            <View style={[
              styles.cartInfo,
              { backgroundColor: currentSection === 'tickets' && totalPrice > 0 ? '#1E40AF' : '#E5E7EB' }
            ]}>
              <IconSymbol 
                name="cart" 
                size={16} 
                color={currentSection === 'tickets' && totalPrice > 0 ? "#FFFFFF" : "#666666"} 
              />
              <ThemedText style={[
                styles.cartAmount,
                { color: currentSection === 'tickets' && totalPrice > 0 ? "#FFFFFF" : "#666666" }
              ]}>
                S/ {currentSection === 'tickets' ? totalPrice.toFixed(2) : '0.00'}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Iconos de navegación debajo del header */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleTabPress('seats')}
        >
          <IconSymbol 
            name="chair" 
            size={24} 
            color={currentSection === 'seats' ? "#2563EB" : "#CCCCCC"} 
          />
          <ThemedText style={[
            styles.navNumber,
            { color: currentSection === 'seats' ? "#2563EB" : "#CCCCCC" }
          ]}>
            {selectedSeats.length.toString().padStart(2, '0')}
          </ThemedText>
        </TouchableOpacity>
        
        <View style={styles.navSeparator} />
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleTabPress('tickets')}
        >
          <IconSymbol 
            name="ticket" 
            size={24} 
            color={currentSection === 'tickets' ? "#2563EB" : "#CCCCCC"} 
          />
        </TouchableOpacity>
        
        <View style={styles.navSeparator} />
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleTabPress('snacks')}
        >
          <IconSymbol 
            name="bag" 
            size={24} 
            color={currentTab === 'snacks' ? "#2563EB" : "#CCCCCC"} 
          />
        </TouchableOpacity>
        
        <View style={styles.navSeparator} />
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleTabPress('payment')}
        >
          <IconSymbol 
            name="creditcard" 
            size={24} 
            color={currentTab === 'payment' ? "#2563EB" : "#CCCCCC"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 0 }}>
        {currentSection === 'seats' ? (
          <>
            {/* Pantalla */}
            <View style={styles.screenContainer}>
              <View style={styles.screen}>
                <ThemedText style={styles.screenText}>PANTALLA</ThemedText>
              </View>
            </View>

            {/* Asientos */}
            <View style={styles.seatingArea}>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(row => 
                renderSeatRow(row)
              )}
            </View>

            {/* Leyenda horizontal ordenada */}
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendSeat, { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E5E7EB' }]} />
                  <ThemedText style={styles.legendText}>Disponible</ThemedText>
                </View>
                
                <View style={styles.legendItem}>
                  <View style={[styles.legendSeat, { backgroundColor: '#DC2626' }]} />
                  <ThemedText style={styles.legendText}>Ocupada</ThemedText>
                </View>
                
                <View style={styles.legendItem}>
                  <View style={[styles.legendSeat, { backgroundColor: '#3B82F6' }]} />
                  <ThemedText style={styles.legendText}>Seleccionada</ThemedText>
                </View>
                
                <View style={styles.legendItem}>
                  <IconSymbol name="wheelchair" size={16} color="#9CA3AF" />
                  <ThemedText style={styles.legendText}>Silla de ruedas</ThemedText>
                </View>
              </View>
              
              {/* Descripción de sillas de ruedas */}
              <View style={styles.wheelchairDescription}>
                <IconSymbol name="wheelchair" size={14} color="#9CA3AF" />
                <ThemedText style={styles.wheelchairText}>
                  Todas nuestras salas cuentan con espacios señalizados para sillas de ruedas. Consulta en Boletería la ubicación de las mismas.
                </ThemedText>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Sección de Entradas */}
            <View style={styles.ticketsSection}>
              {/* Tabs de navegación de entradas */}
              <View style={styles.ticketTabs}>
                <TouchableOpacity style={[styles.ticketTab, styles.activeTicketTab]}>
                  <ThemedText style={[styles.ticketTabText, styles.activeTicketTabText]}>
                    Entradas
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ticketTab}>
                  <ThemedText style={styles.ticketTabText}>
                    Canjea tus códigos
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Información de beneficios */}
              <View style={styles.benefitsSection}>
                <ThemedText style={styles.benefitsTitle}>Tus Beneficios</ThemedText>
                <ThemedText style={styles.benefitsSubtitle}>
                  Boletos Exclusivos para ti. No los dejes vencer!
                </ThemedText>
              </View>

              {/* Lista de tipos de entradas */}
              <View style={styles.ticketsList}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>Entradas Generales</ThemedText>
                  <View style={styles.selectionCounter}>
                    <ThemedText style={styles.counterText}>
                      {getTotalTicketsSelected()} de {selectedSeats.length} entradas
                    </ThemedText>
                    <View style={[
                      styles.counterIndicator,
                      { backgroundColor: canContinueFromTickets() ? '#10B981' : '#F59E0B' }
                    ]} />
                  </View>
                </View>
                {ticketTypes.map(ticket => renderTicketRow(ticket))}
              </View>

              {/* Mensaje de espacio en desarrollo para códigos */}
              <View style={styles.developmentSection}>
                <ThemedText style={styles.developmentText}>
                  Espacio en Desarrollo
                </ThemedText>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Botón continuar - rectangular perfecto sin bordes */}
      <View style={[
        styles.continueContainer,
        { 
          backgroundColor: (currentSection === 'seats' && selectedSeats.length > 0) || 
                          (currentSection === 'tickets' && canContinueFromTickets()) 
                          ? '#1E40AF' : '#9CA3AF',
          paddingBottom: Math.max(insets.bottom, 16) // Usar safe area bottom o mínimo 16px
        }
      ]}>
        <TouchableOpacity 
          style={styles.continueButton}
          disabled={currentSection === 'seats' ? selectedSeats.length === 0 : !canContinueFromTickets()}
          onPress={() => {
            if (currentSection === 'seats') {
              // Ir a la sección de entradas
              setCurrentSection('tickets');
              setCurrentTab('tickets'); // Actualizar el tab activo
            } else {
              // Continuar al siguiente paso
              console.log('Continuar al siguiente paso');
            }
          }}
        >
          <ThemedText style={styles.continueButtonText}>
            Continuar
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      {/* Alerta de tiempo expirado */}
      {showTimeoutAlert && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <ThemedText style={styles.alertTitle}>Tiempo de espera expirado</ThemedText>
            <ThemedText style={styles.alertMessage}>Vuelva a ingresar</ThemedText>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={handleTimeExpired}
            >
              <ThemedText style={styles.alertButtonText}>Aceptar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: 35,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Cambiar para permitir alineación vertical
    paddingHorizontal: 16,
    paddingVertical: 16, // Más padding vertical
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },
  movieInfoSection: {
    flex: 1,
    alignItems: 'flex-start', // Alinear a la izquierda
  },
  rightSection: {
    alignItems: 'center', // Más centrado
    justifyContent: 'center',
    paddingLeft: 12, // Menos padding para más centrado
  },
  movieTitleHeader: {
    fontSize: 22, // Ligeramente más grande
    fontWeight: 'bold',
    color: '#1E40AF', // Azul oscuro
    textAlign: 'left',
    marginBottom: 2, // Menos espacio entre título y detalles
  },
  movieDetails: {
    fontSize: 13, // Ligeramente más grande
    color: '#1E3A8A', // Azul más oscuro
    textAlign: 'left',
    marginBottom: 1, // Menos espacio
    lineHeight: 16, // Texto más junto
  },
  movieDateTime: {
    fontSize: 13, // Ligeramente más grande
    color: '#1E3A8A', // Azul más oscuro
    textAlign: 'left',
    lineHeight: 16, // Texto más junto
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  movieSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Ligeramente menos gap
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 14, // Ligeramente más grande
    paddingVertical: 8, // Ligeramente más grande
    borderRadius: 18,
  },
  cartAmount: {
    fontSize: 15, // Ligeramente más grande
    fontWeight: 'bold',
    color: '#666666',
  },
  navigationContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1, // Para distribuir equitativamente
  },
  navSeparator: {
    width: 1,
    height: 40, // Altura de la línea separadora
    backgroundColor: '#9CA3AF', // Gris oscuro
  },
  activeNavItem: {
    backgroundColor: 'transparent', // Sin fondo activo
  },
  navNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  timerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Ligeramente menos gap
    backgroundColor: '#FFFFFF', // Fondo blanco
    paddingHorizontal: 14, // Ligeramente más grande
    paddingVertical: 8, // Ligeramente más grande
    borderRadius: 18,
    marginBottom: 8,
    // Quitar el borde gris - solo fondo blanco
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB', // Azul en lugar de rojo
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  screenContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  screen: {
    width: width * 0.8,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 8, // Esquinas ligeramente redondeadas
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB', // Borde gris claro
  },
  screenText: {
    fontSize: 14, // Aumentar tamaño de fuente
    color: '#6B7280', // Color más visible
    fontWeight: '600', // Hacer más bold
    letterSpacing: 1, // Espaciado entre letras
  },
  seatingArea: {
    marginVertical: 20,
    paddingHorizontal: 20, // Aumentar padding para mejor centrado
    alignItems: 'center', // Centrar toda el área de asientos
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Reducir espacio entre filas
    justifyContent: 'center', // Centrar cada fila
    width: '100%',
  },
  rowLabel: {
    width: 20, // Reducir ancho
    textAlign: 'center',
    fontSize: 14, // Reducir tamaño
    fontWeight: '600',
    color: '#374151',
    marginRight: 8, // Reducir margen
  },
  seatsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Centrar los asientos
    alignItems: 'center',
    flex: 1,
  },
  seat: {
    width: 24, // Reducir tamaño para que sean más compactos
    height: 24,
    borderRadius: 12, // Mantener círculos perfectos
    marginHorizontal: 1.5, // Reducir espacio entre asientos
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5, // Reducir grosor del borde
    borderColor: '#E5E7EB', // Borde gris claro para asientos disponibles
  },
  seatGapAfter: {
    marginRight: 8, // Reducir espacio en los gaps
  },
  seatNumberContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent', // Quitar el fondo blanco
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatNumber: {
    fontSize: 8, // Reducir tamaño de fuente para asientos más pequeños
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF', // Siempre blanco para contraste con azul
  },
  wheelchairSeat: {
    borderRadius: 12,
  },
  legendContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  legendItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  legendSeat: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  wheelchairDescription: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  wheelchairText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    flex: 1,
  },
  continueContainer: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 12, // Reducir de 18 a 12 para hacer más delgado
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    // Quitar textTransform: 'uppercase' para usar capitalización normal
  },
  // Estilos para la sección de tickets
  ticketsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  ticketTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  ticketTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTicketTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  ticketTabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activeTicketTabText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  benefitsSection: {
    padding: 16,
    alignItems: 'center',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  benefitsSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  ticketsList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  counterIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ticketRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    padding: 16,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 16,
  },
  ticketName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  originalPrice: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  ticketControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  controlButtonTextDisabled: {
    color: '#9CA3AF',
  },
  ticketCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 20,
    textAlign: 'center',
  },
  developmentSection: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  developmentText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  // Estilos para la alerta de tiempo expirado
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    marginHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});