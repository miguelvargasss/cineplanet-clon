import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  Image,
  TextInput,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useAuth } from '@/src/contexts/AuthContext';
import { Movie, getMovieById } from '@/src/services/moviesService';
import { getSeatsByCinemaAndShowtime } from '@/src/services/seatsService';
import { 
  SnackCategory, 
  SnackCombo, 
  getSnackCategories, 
  getSnackCombosByCategory 
} from '@/src/services/snacksService';
import {
  PaymentCard,
  PaymentMethod,
  PAYMENT_METHODS,
  getUserPaymentCards,
  addPaymentCard,
  deletePaymentCard,
  setDefaultCard,
  validateCardNumber,
  validateCVV,
  validateExpiry,
  detectCardType,
  CreditCardData,
  AppAgoraData,
  YapeData
} from '@/src/services/paymentService';

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
  category: 'benefits' | 'general';
  isDiscounted?: boolean;
  originalPrice?: number;
}

const ticketTypes: TicketType[] = [
  // Tus Beneficios
  {
    id: 'socio_clasico',
    name: 'Entrada Socio Clásico OL',
    description: '5 Puntos (Puntos disponibles: 0.00)',
    price: 15.50,
    category: 'benefits'
  },
  {
    id: 'amex_promo',
    name: '50% Promo Amex 2025',
    description: 'Exclusivo con tu tarjeta American Express',
    price: 12.00,
    category: 'benefits'
  },
  // Entradas Generales
  {
    id: 'general_2d',
    name: 'General 2D OL',
    description: 'Incluye servicio online',
    price: 24.00,
    category: 'general'
  },
  {
    id: 'mayores_60',
    name: 'Mayores 60 años 2D OL',
    description: 'Incluye servicio online',
    price: 20.00,
    category: 'general'
  },
  {
    id: 'conadis_2d',
    name: 'Boleto Conadis 2D OL',
    description: 'Descuento solo para personas con discapacidad. Presenta tu DNI y Carnet Conadis en la taquilla antes de ingresar a sala',
    price: 16.50,
    category: 'general'
  },
  {
    id: 'general_3d',
    name: 'Entrada General 3D OL',
    description: 'Incluye servicio online',
    price: 35.00,
    category: 'general'
  }
];

export default function SeatSelectionScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [purchasedSeats, setPurchasedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'seats' | 'tickets' | 'snacks' | 'payment'>('seats');
  
  // Estados para la sección de entradas
  const [currentSection, setCurrentSection] = useState<'seats' | 'tickets' | 'snacks' | 'payment'>('seats');
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Estados del cronómetro
  const [timeLeft, setTimeLeft] = useState(210); // 3:30 minutos = 210 segundos
  const [showTimeoutAlert, setShowTimeoutAlert] = useState(false);

  // Estado para pantalla de confirmación de pago
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Estado para modal de eliminación de tarjeta
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // Estados para términos y condiciones
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptTreatment, setAcceptTreatment] = useState(false);
  const [acceptOptionalTreatment, setAcceptOptionalTreatment] = useState(false);

  // Estado para tarjeta seleccionada
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Estados para la sección de snacks
  const [snackCategories, setSnackCategories] = useState<SnackCategory[]>([]);
  const [snackCombos, setSnackCombos] = useState<{[categoryId: string]: SnackCombo[]}>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedSnacks, setSelectedSnacks] = useState<{[comboId: string]: number}>({});
  const [loadingSnacks, setLoadingSnacks] = useState(false);

  // Estados para la sección de pagos
  const [paymentTab, setPaymentTab] = useState<'cards' | 'other'>('other'); // Comienza en 'other'
  const [savedCards, setSavedCards] = useState<PaymentCard[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'credit-card' | 'app-agora' | 'yape' | null>(null);
  const [loadingCards, setLoadingCards] = useState(false);
  
  // Datos de formularios de pago
  const [creditCardData, setCreditCardData] = useState<CreditCardData>({
    cardNumber: '',
    cardholderName: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    documentType: 'DNI',
    documentNumber: userProfile?.documentNumber || '',
    saveForFuture: false
  });
  
  const [appAgoraData, setAppAgoraData] = useState<AppAgoraData>({
    phoneNumber: '',
    documentType: 'DNI',
    documentNumber: userProfile?.documentNumber || ''
  });
  
  const [yapeData, setYapeData] = useState<YapeData>({
    phoneNumber: '',
    documentType: 'DNI',
    documentNumber: userProfile?.documentNumber || '',
    approvalCode: ''
  });

  // Estados para modales de selección
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDocumentTypePicker, setShowDocumentTypePicker] = useState(false);
  const [tempMonth, setTempMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [tempYear, setTempYear] = useState(String(new Date().getFullYear()));
  const [activeDocumentField, setActiveDocumentField] = useState<'credit-card' | 'app-agora' | 'yape' | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);
  const [cvvFocused, setCvvFocused] = useState(false);

  // Datos del showtime seleccionado
  const movieId = params.movieId as string;
  const showtimeId = params.showtimeId as string;
  const cinemaId = params.cinemaId as string;
  const time = params.time as string;
  const date = params.date as string;

  // Colores del header - SIN fondo azul
  const statusBarColor = '#051135ff';
  const headerColor = '#FFFFFF'; // Cambiado a blanco

  useEffect(() => {
    loadMovieAndSeats();
    loadPurchasedSeats();
    // Cargar categorías de snacks al inicio
    loadSnackCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch {
      // No localStorage available (React Native)
    }
  };

  // Guardar asientos comprados en localStorage
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const savePurchasedSeats = (seats: string[]) => {
    try {
      const storageKey = `purchased_seats_${movieId}_${showtimeId}`;
      localStorage.setItem(storageKey, JSON.stringify(seats));
      setPurchasedSeats(seats);
    } catch {
      // No localStorage available (React Native)
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

      // Cargar asientos usando el servicio de asientos
      if (cinemaId && showtimeId) {
        const seatsData = await getSeatsByCinemaAndShowtime(cinemaId, showtimeId);
        setSeats(seatsData);
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
    
    if (tab === 'snacks') {
      // Verificar que se hayan seleccionado las entradas necesarias
      if (!canContinueFromTickets()) {
        Alert.alert('Completa la selección', 'Debes seleccionar el mismo número de entradas que asientos');
        return;
      }
      setCurrentSection('snacks');
      setCurrentTab('snacks');
      
      // Cargar categorías de snacks si no están cargadas
      if (snackCategories.length === 0) {
        loadSnackCategories();
      }
      
      return;
    }
    
    if (tab === 'payment') {
      // Verificar que se hayan completado todos los pasos anteriores
      if (!canContinueFromTickets()) {
        Alert.alert('Completa la selección', 'Debes completar los pasos anteriores');
        return;
      }
      // Ir directamente a la sección de pago
      setCurrentSection('payment');
      setCurrentTab('payment');
      // Cargar tarjetas guardadas del usuario
      loadSavedCards();
    }
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

  // Función para obtener tickets disponibles según el formato de la película
  const getAvailableTickets = () => {
    const format = params.format || '2D';
    return ticketTypes.filter(ticket => {
      if (format.includes('3D')) {
        return true; // Mostrar todos los tickets para 3D
      } else {
        return ticket.id !== 'general_3d'; // Excluir ticket 3D para películas 2D
      }
    });
  };

  const getTotalTicketsSelected = () => {
    return Object.values(selectedTickets).reduce((sum, count) => sum + count, 0);
  };

  const canContinueFromTickets = () => {
    return getTotalTicketsSelected() === selectedSeats.length;
  };

  // 🍿 FUNCIONES PARA MANEJAR SNACKS
  const loadSnackCategories = async () => {
    try {
      setLoadingSnacks(true);
      
      const categories = await getSnackCategories();
      
      setSnackCategories(categories);
    } catch (error) {
      console.error('❌ [DEBUG] Error cargando categorías:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías de dulcería. Por favor, intenta de nuevo.');
    } finally {
      setLoadingSnacks(false);
    }
  };

  const toggleSnackCategory = async (categoryId: string) => {
    const isExpanded = expandedCategories.includes(categoryId);
    
    if (isExpanded) {
      // Contraer categoría
      setExpandedCategories(prev => prev.filter(id => id !== categoryId));
    } else {
      // Expandir categoría y cargar combos si no están cargados
      setExpandedCategories(prev => [...prev, categoryId]);
      
      if (!snackCombos[categoryId]) {
        try {
          const combos = await getSnackCombosByCategory(categoryId);
          setSnackCombos(prev => ({
            ...prev,
            [categoryId]: combos
          }));
        } catch (error) {
          console.error(`❌ Error cargando combos para ${categoryId}:`, error);
        }
      }
    }
  };

  const handleSnackSelection = (comboId: string, change: number) => {
    setSelectedSnacks(prev => {
      const currentCount = prev[comboId] || 0;
      const newCount = Math.max(0, currentCount + change);
      
      const updated = { ...prev };
      if (newCount === 0) {
        delete updated[comboId];
      } else {
        updated[comboId] = newCount;
      }
      
      return updated;
    });
  };

  const getTotalSnacksSelected = () => {
    return Object.values(selectedSnacks).reduce((sum, count) => sum + count, 0);
  };

  // Función para calcular el precio total incluyendo tickets y snacks
  const getTotalCartPrice = () => {
    // Precio de los tickets
    const ticketsPrice = Object.entries(selectedTickets).reduce((total, [id, count]) => {
      const ticket = ticketTypes.find(t => t.id === id);
      return total + (ticket ? ticket.price * count : 0);
    }, 0);

    // Precio de los snacks
    const snacksPrice = Object.entries(selectedSnacks).reduce((total, [comboId, count]) => {
      // Buscar el combo en todas las categorías
      for (const categoryId in snackCombos) {
        const combo = snackCombos[categoryId].find(c => c.id === comboId);
        if (combo) {
          return total + (combo.price * count);
        }
      }
      return total;
    }, 0);

    return ticketsPrice + snacksPrice;
  };

  const renderSnackCombo = (combo: SnackCombo, index: number) => {
    const count = selectedSnacks[combo.id] || 0;
    
    return (
      <View 
        key={combo.id} 
        style={styles.comboCard}
      >
        {/* Imagen del combo */}
        <View style={styles.comboImageContainer}>
          {combo.imageUrl ? (
            <Image 
              source={{ uri: combo.imageUrl }} 
              style={styles.comboImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.comboImagePlaceholder}>
              <ThemedText style={styles.comboImageText}>🍿</ThemedText>
            </View>
          )}
        </View>
        
        {/* Información del combo */}
        <View style={styles.comboCardContent}>
          <ThemedText style={styles.comboCardName} numberOfLines={2}>
            {combo.name}
          </ThemedText>
          <ThemedText style={styles.comboCardDescription} numberOfLines={1}>
            {combo.description}
          </ThemedText>
          
          {/* Controles de cantidad */}
          <View style={styles.comboCardControls}>
            <TouchableOpacity 
              style={[styles.comboCardButton, count === 0 && styles.comboCardButtonDisabled]}
              onPress={() => handleSnackSelection(combo.id, -1)}
              disabled={count === 0}
            >
              <ThemedText style={[
                styles.comboCardButtonText,
                count === 0 && styles.comboCardButtonTextDisabled
              ]}>−</ThemedText>
            </TouchableOpacity>
            
            <ThemedText style={styles.comboCardCount}>{count}</ThemedText>
            
            <TouchableOpacity 
              style={styles.comboCardButton}
              onPress={() => handleSnackSelection(combo.id, 1)}
            >
              <ThemedText style={styles.comboCardButtonText}>+</ThemedText>
            </TouchableOpacity>
          </View>
          
          {/* Precio */}
          <ThemedText style={styles.comboCardPrice}>
            S/ {combo.price.toFixed(2)}
          </ThemedText>
        </View>
      </View>
    );
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

  // 💳 FUNCIONES PARA MANEJAR PAGOS
  const loadSavedCards = async () => {
    if (!userProfile?.uid) return;
    
    try {
      setLoadingCards(true);
      const cards = await getUserPaymentCards(userProfile.uid);
      setSavedCards(cards);
    } catch (error) {
      console.error('Error loading saved cards:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setCardToDelete(cardId);
    setShowDeleteCardModal(true);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;

    const success = await deletePaymentCard(cardToDelete);
    if (success) {
      Alert.alert('Éxito', 'Tarjeta eliminada correctamente');
      loadSavedCards(); // Recargar lista
    } else {
      Alert.alert('Error', 'No se pudo eliminar la tarjeta');
    }
    
    setShowDeleteCardModal(false);
    setCardToDelete(null);
  };

  const getCardLogo = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return require('../img/visa.png');
      case 'mastercard':
        return require('../img/mastercard.png');
      case 'amex':
      case 'american express':
        return require('../img/amex.png');
      case 'diners':
      case 'diners club':
        return require('../img/diners.png');
      default:
        return null;
    }
  };

  const getCardDisplayNumber = (cardType: string, lastFour: string) => {
    // Generar primeros 6 dígitos basados en el tipo de tarjeta y últimos 4
    const cardPrefixes: { [key: string]: string } = {
      'visa': '454775',
      'mastercard': '543211',
      'amex': '371449',
      'diners': '302233'
    };
    
    const prefix = cardPrefixes[cardType.toLowerCase()] || '454775';
    return `${prefix}******${lastFour}`;
  };

  const handleSetDefaultCard = async (cardId: string) => {
    if (!userProfile?.uid) return;
    
    const success = await setDefaultCard(userProfile.uid, cardId);
    if (success) {
      loadSavedCards(); // Recargar lista para ver los cambios
    }
  };

  // Funciones para limpiar otros formularios
  const clearOtherPaymentMethods = (activeMethod: 'credit-card' | 'app-agora' | 'yape') => {
    if (activeMethod !== 'credit-card') {
      setCreditCardData({
        cardNumber: '',
        cardholderName: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        documentType: 'DNI',
        documentNumber: userProfile?.documentNumber || '',
        saveForFuture: false
      });
    }
    if (activeMethod !== 'app-agora') {
      setAppAgoraData({
        phoneNumber: '',
        documentType: 'DNI',
        documentNumber: userProfile?.documentNumber || ''
      });
    }
    if (activeMethod !== 'yape') {
      setYapeData({
        phoneNumber: '',
        documentType: 'DNI',
        documentNumber: userProfile?.documentNumber || '',
        approvalCode: ''
      });
    }
  };

  // Función para validar que solo un método de pago esté completo
  const validateSinglePaymentMethod = () => {
    let completedMethods = 0;
    let activeMethod = null;

    // Verificar tarjeta de crédito
    if (selectedPaymentMethod === 'credit-card' && 
        creditCardData.cardNumber && 
        creditCardData.expiryMonth && 
        creditCardData.expiryYear && 
        creditCardData.cvv && 
        creditCardData.cardholderName && 
        creditCardData.documentNumber) {
      completedMethods++;
      activeMethod = 'credit-card';
    }

    // Verificar App Agora
    if (selectedPaymentMethod === 'app-agora' && 
        appAgoraData.phoneNumber.length === 9 && 
        appAgoraData.documentNumber) {
      completedMethods++;
      activeMethod = 'app-agora';
    }

    // Verificar Yape
    if (selectedPaymentMethod === 'yape' && 
        yapeData.phoneNumber.length === 9 && 
        yapeData.documentNumber && 
        yapeData.approvalCode.length === 6) {
      completedMethods++;
      activeMethod = 'yape';
    }

    return { completedMethods, activeMethod };
  };

  // Función para validar y procesar el pago
  const handlePayment = async () => {
    if (isProcessingPayment) return;

    // Validar términos y condiciones para tarjetas guardadas
    if (paymentTab === 'cards') {
      if (!acceptTerms || !acceptTreatment) {
        Alert.alert('Error', 'Debes aceptar los términos y condiciones obligatorios para continuar');
        return;
      }
      if (!selectedCardId) {
        Alert.alert('Error', 'Por favor selecciona una tarjeta para continuar');
        return;
      }

      // Procesar pago con tarjeta guardada
      setIsProcessingPayment(true);

      try {
        // Simular procesamiento de pago
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Guardar asientos comprados
        const newPurchasedSeats = [...purchasedSeats, ...selectedSeats];
        savePurchasedSeats(newPurchasedSeats);

        // Mostrar pantalla de confirmación
        setShowPaymentSuccess(true);
        
        // Redirigir a películas después de 5 segundos
        setTimeout(() => {
          setShowPaymentSuccess(false);
          router.push('/movies'); // Redirigir a la pantalla de películas
        }, 5000);
      } catch (error) {
        console.error('Error processing payment:', error);
        Alert.alert('Error', 'No se pudo procesar el pago. Por favor intenta nuevamente.');
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    if (paymentTab === 'other') {
      const { completedMethods, activeMethod } = validateSinglePaymentMethod();

      // Verificar que solo un método esté completo
      if (completedMethods === 0) {
        Alert.alert('Error', 'Por favor completa uno de los métodos de pago disponibles');
        return;
      }

      if (completedMethods > 1) {
        Alert.alert('Error', 'Solo puedes usar un método de pago a la vez. Por favor completa únicamente uno de los formularios');
        return;
      }

      // Procesar según el método activo
      if (activeMethod === 'credit-card') {
        // Validar tarjeta de crédito
        const cardValidation = validateCardNumber(creditCardData.cardNumber);
        if (!cardValidation.valid) {
          Alert.alert('Error', cardValidation.error || 'Número de tarjeta inválido');
          return;
        }

        const expiryValidation = validateExpiry(creditCardData.expiryMonth, creditCardData.expiryYear);
        if (!expiryValidation.valid) {
          Alert.alert('Error', expiryValidation.error || 'Fecha de vencimiento inválida');
          return;
        }

        const cardType = detectCardType(creditCardData.cardNumber);
        if (!cardType) {
          Alert.alert('Error', 'Tipo de tarjeta no reconocido');
          return;
        }
        
        const cvvValid = validateCVV(creditCardData.cvv, cardType);
        if (!cvvValid) {
          Alert.alert('Error', 'CVV inválido');
          return;
        }
      } else if (activeMethod === 'app-agora') {
        // Validar App Agora
        if (appAgoraData.phoneNumber.length !== 9) {
          Alert.alert('Error', 'El número de teléfono debe tener exactamente 9 dígitos');
          return;
        }
      } else if (activeMethod === 'yape') {
        // Validar Yape
        if (yapeData.phoneNumber.length !== 9) {
          Alert.alert('Error', 'El número de teléfono debe tener exactamente 9 dígitos');
          return;
        }
        if (yapeData.approvalCode.length !== 6) {
          Alert.alert('Error', 'El código de aprobación debe tener exactamente 6 dígitos');
          return;
        }
      }

      // Procesar pago
      setIsProcessingPayment(true);

      try {
        // Simular procesamiento de pago
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Guardar tarjeta si se marcó la opción (solo para tarjeta de crédito)
        if (activeMethod === 'credit-card' && creditCardData.saveForFuture && userProfile?.uid) {
          const lastFourDigits = creditCardData.cardNumber.slice(-4);
          const now = new Date();
          const cardType = detectCardType(creditCardData.cardNumber);
          
          if (cardType) {
            await addPaymentCard({
              userId: userProfile.uid,
              cardType,
              cardNumber: lastFourDigits,
              cardHolder: creditCardData.cardholderName,
              expiryDate: `${creditCardData.expiryMonth}/${creditCardData.expiryYear}`,
              isDefault: savedCards.length === 0,
              createdAt: now,
              updatedAt: now
            });
          }
        }

        // Mostrar pantalla de confirmación
        setShowPaymentSuccess(true);
        
        // Redirigir a películas después de 5 segundos
        setTimeout(() => {
          setShowPaymentSuccess(false);
          router.push('/movies'); // Redirigir a la pantalla de películas
        }, 5000);
      } catch (error) {
        console.error('Error processing payment:', error);
        Alert.alert('Error', 'No se pudo procesar el pago. Por favor intenta nuevamente.');
      } finally {
        setIsProcessingPayment(false);
      }
    }
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

  // Pantalla de confirmación de pago exitoso
  if (showPaymentSuccess) {
    return (
      <View style={styles.paymentSuccessContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.paymentSuccessContent}>
          <View style={styles.checkIconContainer}>
            <View style={styles.checkIcon}>
              <ThemedText style={styles.checkMark}>✓</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.paymentSuccessTitle}>¡Gracias por tu compra!</ThemedText>
          <ThemedText style={styles.paymentSuccessSubtitle}>
            Te enviaremos la confirmación {'\n'}a tu correo electrónico
          </ThemedText>
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
              { backgroundColor: getTotalCartPrice() > 0 ? '#1E40AF' : '#E5E7EB' }
            ]}>
              <IconSymbol 
                name="cart" 
                size={16} 
                color={getTotalCartPrice() > 0 ? "#FFFFFF" : "#666666"} 
              />
              <ThemedText style={[
                styles.cartAmount,
                { color: getTotalCartPrice() > 0 ? "#FFFFFF" : "#666666" }
              ]}>
                S/ {getTotalCartPrice().toFixed(2)}
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
          <ThemedText style={[
            styles.navNumber,
            { color: currentSection === 'tickets' ? "#2563EB" : "#CCCCCC" }
          ]}>
            {getTotalTicketsSelected().toString().padStart(2, '0')}
          </ThemedText>
        </TouchableOpacity>
        
        <View style={styles.navSeparator} />
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleTabPress('snacks')}
        >
          <IconSymbol 
            name="bag" 
            size={24} 
            color={currentSection === 'snacks' ? "#2563EB" : "#CCCCCC"} 
          />
          <ThemedText style={[
            styles.navNumber,
            { color: currentSection === 'snacks' ? "#2563EB" : "#CCCCCC" }
          ]}>
            {getTotalSnacksSelected().toString().padStart(2, '0')}
          </ThemedText>
        </TouchableOpacity>
        
        <View style={styles.navSeparator} />
        
        <TouchableOpacity 
          style={[styles.navItem, styles.paymentNavItem]} 
          onPress={() => handleTabPress('payment')}
        >
          <IconSymbol 
            name="creditcard" 
            size={24} 
            color={currentSection === 'payment' ? "#2563EB" : "#CCCCCC"} 
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
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(row => 
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
        ) : currentSection === 'tickets' ? (
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

              {/* Lista de tickets de beneficios */}
              <View style={styles.ticketsList}>
                {getAvailableTickets()
                  .filter(ticket => ticket.category === 'benefits')
                  .map(ticket => renderTicketRow(ticket))}
              </View>

              {/* Sección Entradas Generales */}
              <View style={styles.generalTicketsSection}>
                <ThemedText style={styles.generalSectionTitle}>Entradas Generales</ThemedText>
                {getAvailableTickets()
                  .filter(ticket => ticket.category === 'general')
                  .map(ticket => renderTicketRow(ticket))}
              </View>
            </View>
          </>
        ) : currentSection === 'snacks' ? (
          <>
            {/* Sección de Snacks/Dulcería */}
            <View style={styles.snacksSection}>
              {loadingSnacks ? (
                <View style={styles.loadingContainer}>
                  <ThemedText style={styles.loadingText}>Cargando dulcería...</ThemedText>
                </View>
              ) : (
                <>
                  {/* Categorías de snacks desde Firebase */}
                  <View style={styles.snackCategories}>
                    {snackCategories.map((category) => (
                      <View key={category.id}>
                        <TouchableOpacity 
                          style={styles.snackCategory}
                          onPress={() => toggleSnackCategory(category.id)}
                        >
                          <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
                          <IconSymbol 
                            name={expandedCategories.includes(category.id) ? "chevron.up" : "chevron.down"} 
                            size={16} 
                            color="#2563EB" 
                          />
                        </TouchableOpacity>
                        
                        {/* Mostrar combos cuando la categoría está expandida */}
                        {expandedCategories.includes(category.id) && (
                          <View style={styles.combosGrid}>
                            {snackCombos[category.id] ? (
                              snackCombos[category.id].length > 0 ? (
                                snackCombos[category.id].map((combo, index) => renderSnackCombo(combo, index))
                              ) : (
                                <View style={styles.developmentSection}>
                                  <ThemedText style={styles.developmentText}>
                                    No hay combos disponibles en esta categoría
                                  </ThemedText>
                                </View>
                              )
                            ) : (
                              <View style={styles.developmentSection}>
                                <ThemedText style={styles.developmentText}>
                                  Cargando combos...
                                </ThemedText>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </>
        ) : currentSection === 'payment' ? (
          <>
            {/* 💳 TABS DE MÉTODOS DE PAGO - Debajo de navegación */}
            <View style={styles.paymentTabsContainer}>
              <TouchableOpacity
                style={[
                  styles.paymentTabButton,
                  paymentTab === 'cards' && styles.paymentTabButtonActive
                ]}
                onPress={() => setPaymentTab('cards')}
              >
                <ThemedText style={[
                  styles.paymentTabButtonText,
                  paymentTab === 'cards' && styles.paymentTabButtonTextActive
                ]}>
                  Tarjetas
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentTabButton,
                  paymentTab === 'other' && styles.paymentTabButtonActive
                ]}
                onPress={() => setPaymentTab('other')}
              >
                <ThemedText style={[
                  styles.paymentTabButtonText,
                  paymentTab === 'other' && styles.paymentTabButtonTextActive
                ]}>
                  Otras Formas de Pago
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* 💳 SECCIÓN DE PAGOS */}
            <View style={styles.paymentSection}>
              {/* Información del usuario - SOLO en "Otras Formas de Pago" */}
              {paymentTab === 'other' && (
                <View style={styles.userInfoSection}>
                  <View style={styles.userInfoItem}>
                    <ThemedText style={styles.userInfoLabel}>Nombre Completo</ThemedText>
                    <ThemedText style={styles.userInfoText}>
                      {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Cargando...'}
                    </ThemedText>
                  </View>
                  <View style={styles.userInfoItem}>
                    <ThemedText style={styles.userInfoLabel}>Correo Electrónico</ThemedText>
                    <ThemedText style={styles.userInfoText}>
                      {userProfile?.email || 'Cargando...'}
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* Contenido según el tab seleccionado */}
              {paymentTab === 'cards' ? (
                // TAB DE TARJETAS GUARDADAS
                <View style={styles.savedCardsSection}>
                  <ThemedText style={styles.sectionSubtitle}>Mis Tarjetas</ThemedText>
                  
                  {loadingCards ? (
                    <View style={styles.loadingContainer}>
                      <ThemedText style={styles.loadingText}>Cargando tarjetas...</ThemedText>
                    </View>
                  ) : savedCards.length > 0 ? (
                    <View style={styles.cardsList}>
                      {savedCards.map((card, index) => (
                        <View key={card.id}>
                          <TouchableOpacity 
                            style={styles.cardRowFlat}
                            onPress={() => setSelectedCardId(card.id)}
                          >
                            <View style={styles.cardSelection}>
                              <View style={[
                                styles.radioButton, 
                                selectedCardId === card.id && styles.radioButtonSelected
                              ]}>
                                {selectedCardId === card.id && (
                                  <View style={styles.radioButtonInner} />
                                )}
                              </View>
                            </View>
                            <View style={styles.cardLogoSection}>
                              {getCardLogo(card.cardType) ? (
                                <Image 
                                  source={getCardLogo(card.cardType)!}
                                  style={styles.cardLogoSmall}
                                  resizeMode="contain"
                                />
                              ) : (
                                <View style={styles.fallbackCardIconSmall}>
                                  <ThemedText style={styles.fallbackCardTextSmall}>💳</ThemedText>
                                </View>
                              )}
                            </View>
                            <View style={styles.cardInfoFlat}>
                              <ThemedText style={styles.flatCardNumber}>
                                {getCardDisplayNumber(card.cardType, card.cardNumber)}
                              </ThemedText>
                            </View>
                            <TouchableOpacity
                              style={styles.deleteButtonFlat}
                              onPress={() => handleDeleteCard(card.id)}
                            >
                              <ThemedText style={styles.deleteXFlat}>×</ThemedText>
                            </TouchableOpacity>
                          </TouchableOpacity>
                          {index < savedCards.length - 1 && <View style={styles.cardSeparator} />}
                        </View>
                      ))}
                      
                      {/* Sección de términos y condiciones */}
                      <View style={styles.termsSection}>
                        <TouchableOpacity 
                          style={styles.checkboxRow}
                          onPress={() => setAcceptTerms(!acceptTerms)}
                        >
                          <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                            {acceptTerms && <ThemedText style={styles.checkboxCheck}>✓</ThemedText>}
                          </View>
                          <ThemedText style={styles.termsText}>
                            Acepto los <ThemedText style={styles.linkText}>Términos y Condiciones</ThemedText> y la{' '}
                            <ThemedText style={styles.linkText}>Política de Privacidad</ThemedText>
                          </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.checkboxRow}
                          onPress={() => setAcceptTreatment(!acceptTreatment)}
                        >
                          <View style={[styles.checkbox, acceptTreatment && styles.checkboxChecked]}>
                            {acceptTreatment && <ThemedText style={styles.checkboxCheck}>✓</ThemedText>}
                          </View>
                          <ThemedText style={styles.termsText}>
                            He leído y acepto las finalidades{' '}
                            <ThemedText style={styles.linkText}>Tratamiento necesario</ThemedText>
                          </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.checkboxRow}
                          onPress={() => setAcceptOptionalTreatment(!acceptOptionalTreatment)}
                        >
                          <View style={[styles.checkbox, acceptOptionalTreatment && styles.checkboxChecked]}>
                            {acceptOptionalTreatment && <ThemedText style={styles.checkboxCheck}>✓</ThemedText>}
                          </View>
                          <ThemedText style={styles.termsText}>
                            Acepto el tratamiento opcional de datos.
                          </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.addCardButtonNew}
                          onPress={() => {
                            // Cambiar a "Otras Formas de Pago" para agregar nueva tarjeta
                            setPaymentTab('other');
                            setSelectedPaymentMethod('credit-card');
                          }}
                        >
                          <ThemedText style={styles.addCardButtonTextNew}>Agregar nueva tarjeta</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.emptyState}>
                      <ThemedText style={styles.emptyStateIcon}>💳</ThemedText>
                      <ThemedText style={styles.emptyStateText}>
                        Todavía no tienes agregada una tarjeta a la lista. Para ingresar una nueva, selecciona la opción "Agregar Tarjeta". Completa los datos y presiona "Aceptar".
                      </ThemedText>
                      <ThemedText style={styles.emptyStateNote}>
                        * No se hacen cambios ni devoluciones
                      </ThemedText>
                      <ThemedText style={styles.emptyStateNote}>
                        * Toda la información de pago es segura
                      </ThemedText>
                      <TouchableOpacity
                        style={styles.addCardButton}
                        onPress={() => {
                          // Cambiar a "Otras Formas de Pago" para agregar nueva tarjeta
                          setPaymentTab('other');
                          setSelectedPaymentMethod('credit-card');
                        }}
                      >
                        <ThemedText style={styles.addCardButtonText}>Agregar Tarjeta</ThemedText>
                      </TouchableOpacity>

                      <View style={styles.termsSection}>
                        <TouchableOpacity style={styles.checkboxRow}>
                          <View style={styles.checkbox} />
                          <ThemedText style={styles.termsText}>
                            Acepto los <ThemedText style={styles.linkText}>Términos y Condiciones</ThemedText> y{' '}
                            <ThemedText style={styles.linkText}>Política de Privacidad</ThemedText>.
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxRow}>
                          <View style={styles.checkbox} />
                          <ThemedText style={styles.termsText}>
                            He leído y acepto las finalidades de{' '}
                            <ThemedText style={styles.linkText}>Tratamiento Opcional de Datos</ThemedText>.
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                // TAB DE OTRAS FORMAS DE PAGO
                <View style={styles.otherPaymentsSection}>
                  <ThemedText style={styles.paymentFormTitle}>Elige una forma de pago</ThemedText>
                  
                  {/* Método 1: TARJETA DE CRÉDITO/DÉBITO */}
                  <View style={styles.paymentMethodContainer}>
                    <TouchableOpacity
                      style={styles.paymentMethodHeader}
                      onPress={() => setSelectedPaymentMethod(
                        selectedPaymentMethod === 'credit-card' ? null : 'credit-card'
                      )}
                    >
                      <View style={styles.paymentMethodInfo}>
                        <ThemedText style={styles.paymentMethodTitle}>
                          Tarjeta de Crédito o Débito
                        </ThemedText>
                      </View>
                      <IconSymbol 
                        name={selectedPaymentMethod === 'credit-card' ? 'chevron.down' : 'chevron.right'}
                        size={16} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                    
                    {selectedPaymentMethod === 'credit-card' && (
                      <View style={styles.paymentMethodContent}>
                        {/* Número de Tarjeta */}
                        <View style={styles.floatingInputGroup}>
                          <ThemedText style={styles.floatingLabel}>Número de tarjeta</ThemedText>
                          <TextInput
                            style={styles.modernInput}
                            placeholder="Ingresa número de tarjeta"
                            placeholderTextColor="#9CA3AF"
                            value={creditCardData.cardNumber}
                            onChangeText={(text) => {
                              const cleaned = text.replace(/\D/g, '').slice(0, 16);
                              if (cleaned.length > 0) {
                                clearOtherPaymentMethods('credit-card');
                              }
                              setCreditCardData({...creditCardData, cardNumber: cleaned});
                            }}
                            keyboardType="number-pad"
                            maxLength={16}
                          />
                          {creditCardData.cardNumber.length > 0 && validateCardNumber(creditCardData.cardNumber).error && (
                            <ThemedText style={styles.validationError}>
                              {validateCardNumber(creditCardData.cardNumber).error}
                            </ThemedText>
                          )}
                        </View>

                        {/* Fecha y CVV en la misma fila con íconos y floating labels */}
                        <View style={styles.rowInputsEqual}>
                          <View style={styles.halfInputEqual}>
                            <View style={styles.floatingInputWrapper}>
                              <View style={styles.floatingLabelWithIcon}>
                                <IconSymbol name="calendar" size={16} color="#6B7280" />
                                <ThemedText style={[
                                  styles.floatingLabelInside, 
                                  (dateFocused || creditCardData.expiryMonth) && styles.floatingLabelActive,
                                  { marginLeft: 4 }
                                ]}>
                                  Fecha
                                </ThemedText>
                              </View>
                              <TouchableOpacity
                                style={styles.modernInputWithIcon}
                                onPress={() => {
                                  setTempMonth(creditCardData.expiryMonth || String(new Date().getMonth() + 1).padStart(2, '0'));
                                  setTempYear(creditCardData.expiryYear || String(new Date().getFullYear()));
                                  setShowDatePicker(true);
                                  setDateFocused(true);
                                }}
                              >
                                <ThemedText style={[
                                  styles.modernInputText, 
                                  !creditCardData.expiryMonth && styles.placeholderText,
                                  (dateFocused || creditCardData.expiryMonth) && {paddingTop: 12}
                                ]}>
                                  {creditCardData.expiryMonth && creditCardData.expiryYear 
                                    ? `${creditCardData.expiryMonth}/${creditCardData.expiryYear}`
                                    : ''
                                  }
                                </ThemedText>
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          <View style={styles.halfInputEqual}>
                            <View style={styles.floatingInputWrapper}>
                              <View style={styles.floatingLabelWithIcon}>
                                <IconSymbol name="lock.shield" size={16} color="#6B7280" />
                                <ThemedText style={[
                                  styles.floatingLabelInside, 
                                  (cvvFocused || creditCardData.cvv) && styles.floatingLabelActive,
                                  { marginLeft: 4 }
                                ]}>
                                  CVV
                                </ThemedText>
                              </View>
                              <TextInput
                                style={[
                                  styles.modernInputWithIcon,
                                  (cvvFocused || creditCardData.cvv) && {paddingTop: 12}
                                ]}
                                placeholder=""
                                placeholderTextColor="#9CA3AF"
                                value={creditCardData.cvv}
                                onChangeText={(text) => {
                                  const cleaned = text.replace(/\D/g, '').slice(0, 4);
                                  setCreditCardData({...creditCardData, cvv: cleaned});
                                }}
                                onFocus={() => setCvvFocused(true)}
                                onBlur={() => setCvvFocused(false)}
                                keyboardType="number-pad"
                                maxLength={4}
                                secureTextEntry
                              />
                            </View>
                          </View>
                        </View>

                        {/* Nombre del Titular */}
                        <View style={styles.floatingInputGroup}>
                          <ThemedText style={styles.floatingLabel}>Nombre titular de la tarjeta</ThemedText>
                          <TextInput
                            style={styles.modernInput}
                            placeholder="miguel vargas"
                            placeholderTextColor="#9CA3AF"
                            value={creditCardData.cardholderName}
                            onChangeText={(text) => {
                              const cleaned = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                              setCreditCardData({...creditCardData, cardholderName: cleaned});
                            }}
                          />
                        </View>

                        {/* Tipo de Documento y Número en la misma fila */}
                        <View style={styles.rowInputsEqual}>
                          <View style={[styles.halfInputEqual, {flex: 0.4}]}>
                            <ThemedText style={styles.floatingLabel}>N° de DNI</ThemedText>
                            <TouchableOpacity
                              style={styles.modernInput}
                              onPress={() => {
                                setActiveDocumentField('credit-card');
                                setShowDocumentTypePicker(true);
                              }}
                            >
                              <ThemedText style={styles.modernInputText}>
                                {creditCardData.documentType}
                              </ThemedText>
                            </TouchableOpacity>
                          </View>
                          
                          <View style={[styles.halfInputEqual, {flex: 0.6}]}>
                            <ThemedText style={styles.floatingLabel}> </ThemedText>
                            <TextInput
                              style={styles.modernInput}
                              placeholder=""
                              placeholderTextColor="#9CA3AF"
                              value={creditCardData.documentNumber}
                              onChangeText={(text) => {
                                const cleaned = text.replace(/\s/g, '').slice(0, 12);
                                setCreditCardData({...creditCardData, documentNumber: cleaned});
                              }}
                              keyboardType="default"
                            />
                          </View>
                        </View>

                        {/* Mensaje informativo */}
                        <ThemedText style={styles.infoMessage}>
                          El cobro de la transacción se realizará en Nuevos Soles. Si la cuenta asociada a tu tarjeta es en Dólares, el tipo de cambio de tu banco.
                        </ThemedText>

                        {/* Checkbox */}
                        <TouchableOpacity 
                          style={styles.checkboxRow}
                          onPress={() => setCreditCardData({
                            ...creditCardData, 
                            saveForFuture: !creditCardData.saveForFuture
                          })}
                        >
                          <View style={[
                            styles.checkbox,
                            creditCardData.saveForFuture && styles.checkboxChecked
                          ]}>
                            {creditCardData.saveForFuture && (
                              <ThemedText style={styles.checkboxCheck}>✓</ThemedText>
                            )}
                          </View>
                          <ThemedText style={styles.checkboxLabel}>
                            Guardar tarjeta para compras futuras.
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Método 2: APP AGORA */}
                  <View style={styles.paymentMethodContainer}>
                    <TouchableOpacity
                      style={styles.paymentMethodHeader}
                      onPress={() => setSelectedPaymentMethod(
                        selectedPaymentMethod === 'app-agora' ? null : 'app-agora'
                      )}
                    >
                      <View style={styles.paymentMethodInfo}>
                        <ThemedText style={styles.paymentMethodTitle}>App Agora</ThemedText>
                      </View>
                      <View style={styles.paymentLogosContainer}>
                        <Image 
                          source={require('../img/AgoraLogo.png')}
                          style={styles.paymentLogo}
                          resizeMode="contain"
                        />
                        <Image 
                          source={require('../img/ohpayLogo.png')}
                          style={styles.paymentLogo}
                          resizeMode="contain"
                        />
                      </View>
                      <IconSymbol 
                        name={selectedPaymentMethod === 'app-agora' ? 'chevron.down' : 'chevron.right'}
                        size={16} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                    
                    {selectedPaymentMethod === 'app-agora' && (
                      <View style={styles.paymentMethodContent}>
                        {/* Número de Celular */}
                        <View style={styles.floatingInputGroup}>
                          <ThemedText style={styles.floatingLabel}>Número de Celular</ThemedText>
                          <TextInput
                            style={styles.modernInput}
                            placeholder="Ej: 987654321"
                            placeholderTextColor="#9CA3AF"
                            value={appAgoraData.phoneNumber}
                            onChangeText={(text) => {
                              const cleaned = text.replace(/\D/g, '').slice(0, 9);
                              if (cleaned.length > 0) {
                                clearOtherPaymentMethods('app-agora');
                              }
                              setAppAgoraData({...appAgoraData, phoneNumber: cleaned});
                            }}
                            keyboardType="phone-pad"
                            maxLength={9}
                          />
                        </View>

                        {/* Tipo de Documento y Número en la misma fila */}
                        <View style={styles.rowInputsEqual}>
                          <View style={[styles.halfInputEqual, {flex: 0.4}]}>
                            <ThemedText style={styles.floatingLabel}>N° de DNI</ThemedText>
                            <TouchableOpacity
                              style={styles.modernInput}
                              onPress={() => {
                                setActiveDocumentField('app-agora');
                                setShowDocumentTypePicker(true);
                              }}
                            >
                              <ThemedText style={styles.modernInputText}>
                                {appAgoraData.documentType}
                              </ThemedText>
                            </TouchableOpacity>
                          </View>
                          
                          <View style={[styles.halfInputEqual, {flex: 0.6}]}>
                            <ThemedText style={styles.floatingLabel}> </ThemedText>
                            <TextInput
                              style={styles.modernInput}
                              placeholder=""
                              placeholderTextColor="#9CA3AF"
                              value={appAgoraData.documentNumber}
                              onChangeText={(text) => {
                                const cleaned = text.replace(/\s/g, '').slice(0, 12);
                                setAppAgoraData({...appAgoraData, documentNumber: cleaned});
                              }}
                              keyboardType="default"
                            />
                          </View>
                        </View>

                        <ThemedText style={styles.instructionsText}>
                          💡 Recibirás una notificación en tu App Agora para aprobar el pago
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  {/* Método 3: YAPE */}
                  <View style={styles.paymentMethodContainer}>
                    <TouchableOpacity
                      style={styles.paymentMethodHeader}
                      onPress={() => setSelectedPaymentMethod(
                        selectedPaymentMethod === 'yape' ? null : 'yape'
                      )}
                    >
                      <View style={styles.paymentMethodInfo}>
                        <ThemedText style={styles.paymentMethodTitle}>Yape</ThemedText>
                      </View>
                      <View style={styles.paymentLogosContainer}>
                        <Image 
                          source={require('../img/yapeLogo.png')}
                          style={styles.paymentLogo}
                          resizeMode="contain"
                        />
                      </View>
                      <IconSymbol 
                        name={selectedPaymentMethod === 'yape' ? 'chevron.down' : 'chevron.right'}
                        size={16} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                    
                    {selectedPaymentMethod === 'yape' && (
                      <View style={styles.paymentMethodContent}>
                        {/* Número de Celular */}
                        <View style={styles.floatingInputGroup}>
                          <ThemedText style={styles.floatingLabel}>Número de Celular</ThemedText>
                          <TextInput
                            style={styles.modernInput}
                            placeholder="Ej: 987654321"
                            placeholderTextColor="#9CA3AF"
                            value={yapeData.phoneNumber}
                            onChangeText={(text) => {
                              const cleaned = text.replace(/\D/g, '').slice(0, 9);
                              if (cleaned.length > 0) {
                                clearOtherPaymentMethods('yape');
                              }
                              setYapeData({...yapeData, phoneNumber: cleaned});
                            }}
                            keyboardType="phone-pad"
                            maxLength={9}
                          />
                        </View>

                        {/* Tipo de Documento y Número en la misma fila */}
                        <View style={styles.rowInputsEqual}>
                          <View style={[styles.halfInputEqual, {flex: 0.4}]}>
                            <ThemedText style={styles.floatingLabel}>N° de DNI</ThemedText>
                            <TouchableOpacity
                              style={styles.modernInput}
                              onPress={() => {
                                setActiveDocumentField('yape');
                                setShowDocumentTypePicker(true);
                              }}
                            >
                              <ThemedText style={styles.modernInputText}>
                                {yapeData.documentType}
                              </ThemedText>
                            </TouchableOpacity>
                          </View>
                          
                          <View style={[styles.halfInputEqual, {flex: 0.6}]}>
                            <ThemedText style={styles.floatingLabel}> </ThemedText>
                            <TextInput
                              style={styles.modernInput}
                              placeholder=""
                              placeholderTextColor="#9CA3AF"
                              value={yapeData.documentNumber}
                              onChangeText={(text) => {
                                const cleaned = text.replace(/\s/g, '').slice(0, 12);
                                setYapeData({...yapeData, documentNumber: cleaned});
                              }}
                              keyboardType="default"
                            />
                          </View>
                        </View>

                        {/* Código de Aprobación */}
                        <View style={styles.floatingInputGroup}>
                          <ThemedText style={styles.floatingLabel}>Código de Aprobación</ThemedText>
                          <TextInput
                            style={styles.modernInput}
                            placeholder="Ingresa el código de 6 dígitos"
                            placeholderTextColor="#9CA3AF"
                            value={yapeData.approvalCode}
                            onChangeText={(text) => {
                              const cleaned = text.replace(/\D/g, '').slice(0, 6);
                              setYapeData({...yapeData, approvalCode: cleaned});
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                          />
                        </View>

                        <ThemedText style={styles.instructionsText}>
                          💡 Realiza el yapeo y luego ingresa el código de aprobación
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Botón continuar - rectangular perfecto sin bordes */}
      <View style={[
        styles.continueContainer,
        { 
          backgroundColor: (currentSection === 'seats' && selectedSeats.length > 0) || 
                          (currentSection === 'tickets' && canContinueFromTickets()) ||
                          (currentSection === 'snacks') ||
                          (currentSection === 'payment' && (
                            paymentTab === 'other' || 
                            (paymentTab === 'cards' && acceptTerms && acceptTreatment && selectedCardId)
                          ))
                          ? '#1E40AF' : '#9CA3AF',
          paddingBottom: Math.max(insets.bottom, 16) // Usar safe area bottom o mínimo 16px
        }
      ]}>
        <TouchableOpacity 
          style={styles.continueButton}
          disabled={
            currentSection === 'seats' ? selectedSeats.length === 0 : 
            currentSection === 'tickets' ? !canContinueFromTickets() : 
            currentSection === 'payment' ? (
              isProcessingPayment || 
              (paymentTab === 'cards' && (!acceptTerms || !acceptTreatment || !selectedCardId))
            ) :
            false // En snacks siempre se puede continuar
          }
          onPress={() => {
            if (currentSection === 'payment') {
              // Procesar pago
              handlePayment();
            } else if (currentSection === 'seats') {
              // Ir a la sección de entradas
              setCurrentSection('tickets');
              setCurrentTab('tickets'); // Actualizar el tab activo
            } else if (currentSection === 'tickets') {
              // Ir a la sección de snacks
              setCurrentSection('snacks');
              setCurrentTab('snacks'); // Actualizar el tab activo
            } else {
              // Desde snacks, ir a payment
              setCurrentSection('payment' as any);
              setCurrentTab('payment');
              // Cargar tarjetas guardadas del usuario
              loadSavedCards();
            }
          }}
        >
          <ThemedText style={styles.continueButtonText}>
            {currentSection === 'payment' ? (isProcessingPayment ? 'Procesando...' : 'Pagar') : 'Continuar'}
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

      {/* Modal de Selección de Fecha - Full Screen */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <LinearGradient
          colors={["#0B3B83", "#2D7BE0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.fullScreenModalOverlay}
        >
          <View style={[styles.fullScreenDatePicker, { paddingTop: insets.top + 10 }]}>
            {/* Barra de selección superior (solo visual) */}
            <View pointerEvents="none" style={[styles.selectionBar, { top: insets.top + 60 }]} />

            <View style={[styles.pickerRow, { marginTop: 20 }]}>
              <View style={styles.pickerColumn}>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {getAvailableMonths(parseInt(tempYear)).map((month) => (
                    <TouchableOpacity
                      key={month}
                      style={styles.pickerOption}
                      onPress={() => setTempMonth(month.toString().padStart(2, '0'))}
                    >
                      <ThemedText
                        style={[
                          styles.fullScreenPickerText,
                          tempMonth === month.toString().padStart(2, '0') &&
                            styles.fullScreenPickerTextSelected,
                        ]}
                      >
                        {month.toString().padStart(2, '0')}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={styles.pickerOption}
                      onPress={() => {
                        setTempYear(year.toString());
                        const availableMonths = getAvailableMonths(year);
                        if (!availableMonths.includes(parseInt(tempMonth))) {
                          setTempMonth(availableMonths[0].toString().padStart(2, '0'));
                        }
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.fullScreenPickerText,
                          tempYear === year.toString() && styles.fullScreenPickerTextSelected,
                        ]}
                      >
                        {year}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.fullScreenAcceptButton,
                { paddingBottom: Math.max(insets.bottom, 8) }
              ]}
              onPress={() => {
                setCreditCardData({
                  ...creditCardData,
                  expiryMonth: tempMonth,
                  expiryYear: tempYear,
                });
                setShowDatePicker(false);
              }}
            >
              <ThemedText style={styles.acceptButtonText}>Aceptar</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Modal>

      {/* Modal de Selección de Tipo de Documento */}
      <Modal
        visible={showDocumentTypePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDocumentTypePicker(false)}
      >
        <TouchableOpacity 
          style={styles.selectorModalOverlay}
          activeOpacity={1}
          onPress={() => setShowDocumentTypePicker(false)}
        >
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              style={styles.selectorOption}
              onPress={() => {
                if (activeDocumentField === 'credit-card') {
                  setCreditCardData({...creditCardData, documentType: 'DNI'});
                } else if (activeDocumentField === 'app-agora') {
                  setAppAgoraData({...appAgoraData, documentType: 'DNI'});
                } else if (activeDocumentField === 'yape') {
                  setYapeData({...yapeData, documentType: 'DNI'});
                }
                setShowDocumentTypePicker(false);
              }}
            >
              <ThemedText style={styles.selectorOptionText}>DNI</ThemedText>
            </TouchableOpacity>
            
            <View style={styles.selectorSeparator} />
            
            <TouchableOpacity
              style={styles.selectorOption}
              onPress={() => {
                if (activeDocumentField === 'credit-card') {
                  setCreditCardData({...creditCardData, documentType: 'CE'});
                } else if (activeDocumentField === 'app-agora') {
                  setAppAgoraData({...appAgoraData, documentType: 'CE'});
                } else if (activeDocumentField === 'yape') {
                  setYapeData({...yapeData, documentType: 'CE'});
                }
                setShowDocumentTypePicker(false);
              }}
            >
              <ThemedText style={styles.selectorOptionText}>Carnet de Extranjería</ThemedText>
            </TouchableOpacity>
            
            <View style={styles.selectorSeparator} />
            
            <TouchableOpacity
              style={styles.selectorOption}
              onPress={() => {
                if (activeDocumentField === 'credit-card') {
                  setCreditCardData({...creditCardData, documentType: 'Pasaporte'});
                } else if (activeDocumentField === 'app-agora') {
                  setAppAgoraData({...appAgoraData, documentType: 'Pasaporte'});
                } else if (activeDocumentField === 'yape') {
                  setYapeData({...yapeData, documentType: 'Pasaporte'});
                }
                setShowDocumentTypePicker(false);
              }}
            >
              <ThemedText style={styles.selectorOptionText}>Pasaporte</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Éxito de Pago */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.push('/movies');
        }}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContainer}>
            <View style={styles.successCheckCircle}>
              <ThemedText style={styles.successCheckMark}>✓</ThemedText>
            </View>
            <ThemedText style={styles.successTitle}>¡Pago Exitoso!</ThemedText>
            <ThemedText style={styles.successMessage}>
              Tu compra se realizó correctamente
            </ThemedText>
            {creditCardData.saveForFuture && (
              <ThemedText style={styles.successCardSaved}>
                💳 Tarjeta guardada para futuras compras
              </ThemedText>
            )}
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/movies');
              }}
            >
              <ThemedText style={styles.successButtonText}>Continuar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación de tarjeta */}
      <Modal
        visible={showDeleteCardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteCardModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <ThemedText style={styles.deleteModalTitle}>
              La tarjeta se eliminará de forma permanente
            </ThemedText>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteCardModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDeleteCard}
              >
                <ThemedText style={styles.confirmDeleteButtonText}>Aceptar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Función helper para obtener meses disponibles según el año
function getAvailableMonths(year: number): number[] {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  if (year === currentYear) {
    // Solo meses desde el actual hasta diciembre
    return Array.from({length: 12 - currentMonth + 1}, (_, i) => currentMonth + i);
  } else {
    // Todos los meses
    return Array.from({length: 12}, (_, i) => i + 1);
  }
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
  paymentNavItem: {
    paddingTop: 4, // Subir el ícono de payment para alinearlo con los otros que tienen contadores
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
    paddingHorizontal: 16,
    width: '100%',
    position: 'relative',
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 8,
    width: '100%',
  },
  rowLabel: {
    width: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
    minWidth: 20,
    position: 'absolute',
    left: -4,
  },
  seatsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginLeft: 32,
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
  generalTicketsSection: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  generalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1846a9e8',
    textAlign: 'center',
    marginBottom: 8,
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
    backgroundColor: 'transparent',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10327ae9',
    marginBottom: 2,
  },
  ticketDescription: {
    fontSize: 11,
    color: '#1141a7ff',
    lineHeight: 14,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#072c7ce7',
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
  // Estilos para la sección de snacks
  snacksSection: {
    padding: 20,
  },
  snacksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  snackCategories: {
    marginBottom: 20,
  },
  snackCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  // Estilos para los combos
  // Estilos para combos en formato de cards (grid de 2 columnas)
  // Estilos para combos en formato de cards (grid de 2 columnas)
  combosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  comboCard: {
    width: '47%', // Cada card ocupa el 47% (47% + 47% + 6% gap = 100%)
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 12,
    marginLeft: '1.5%',
    marginRight: '1.5%',
  },
  comboImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  comboImage: {
    width: '100%',
    height: '100%',
  },
  comboImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comboImageText: {
    fontSize: 40,
  },
  comboCardContent: {
    padding: 12,
  },
  comboCardName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#003D82',
    marginBottom: 4,
    minHeight: 32,
    lineHeight: 16,
  },
  comboCardDescription: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
    minHeight: 12,
  },
  comboCardControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 12,
  },
  comboCardButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#003D82',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comboCardButtonDisabled: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
  },
  comboCardButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003D82',
  },
  comboCardButtonTextDisabled: {
    color: '#9CA3AF',
  },
  comboCardCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 24,
    textAlign: 'center',
  },
  comboCardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  // Estilos antiguos de combos (deprecados pero mantenidos por compatibilidad)
  comboItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    padding: 16,
  },
  comboInfo: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 16,
  },
  comboDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  comboName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  comboDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 4,
  },
  comboPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  comboControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  comboCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 20,
    textAlign: 'center',
  },
  combosContainer: {
    marginLeft: 16,
    paddingVertical: 8,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // 💳 ESTILOS PARA SECCIÓN DE PAGOS
  paymentTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  paymentTabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  paymentTabButtonActive: {
    borderBottomColor: '#DC2626', // Rojo para tab activo
  },
  paymentTabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003D82', // Azul para texto
  },
  paymentTabButtonTextActive: {
    color: '#DC2626', // Rojo para texto activo
  },
  paymentSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userInfoSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  userInfoItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userInfoLabel: {
    fontSize: 12,
    color: '#9CA3AF', // Gris claro para las etiquetas
    marginBottom: 4,
  },
  userInfoText: {
    fontSize: 15,
    color: '#6B7280', // Gris para el texto del usuario
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003D82', // Azul para labels
    marginBottom: 8,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  disabledInputText: {
    fontSize: 15,
    color: '#003D82', // Azul para texto
  },
  savedCardsSection: {
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003D82', // Azul para subtítulos
    marginBottom: 16,
  },
  paymentFormTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003D82', // Azul para título
    marginBottom: 20,
    textAlign: 'center', // Centrado
  },
  cardsList: {
    gap: 12,
  },
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    fontSize: 24,
  },
  cardDetails: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#003D82', // Azul para número de tarjeta
    marginBottom: 4,
  },
  cardHolder: {
    fontSize: 13,
    color: '#003D82', // Azul para nombre del titular
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#003D82', // Azul para fecha de expiración
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteCardButton: {
    padding: 8,
  },
  deleteCardText: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#003D82', // Azul para texto de estado vacío
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyStateNote: {
    fontSize: 12,
    color: '#003D82', // Azul para notas
    textAlign: 'center',
    marginBottom: 4,
  },
  addCardButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 24,
    marginBottom: 24,
  },
  addCardButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Nuevo estilo para botón más circular y centrado
  addCardButtonNew: {
    backgroundColor: '#1E40AF',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
    alignSelf: 'center',
    minWidth: 200,
    alignItems: 'center',
  },
  addCardButtonTextNew: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  termsSection: {
    width: '100%',
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#003D82', // Azul para checkbox
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#003D82',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#003D82', // Azul para texto de términos
    lineHeight: 18,
  },
  linkText: {
    color: '#003D82', // Azul para links
    textDecorationLine: 'underline',
  },
  otherPaymentsSection: {
    flex: 1,
    paddingBottom: 24,
  },
  // Estilos para métodos de pago colapsables
  paymentMethodContainer: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentMethodIcon: {
    fontSize: 24,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003D82', // Azul para títulos de métodos de pago
  },
  paymentLogosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 16,
  },
  paymentLogo: {
    width: 32,
    height: 20,
  },
  expandIcon: {
    fontSize: 16,
    color: '#003D82', // Azul para iconos
  },
  paymentMethodContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003D82', // Azul para labels de formularios
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 14,
  },
  textInput: {
    fontSize: 15,
    color: '#1F2937', // Color oscuro para el texto ingresado
  },
  input: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  validationText: {
    fontSize: 12,
    color: '#DC2626', // Rojo para errores
    marginTop: 4,
    marginBottom: 8,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#003D82', // Azul para label del checkbox
  },
  securityNote: {
    fontSize: 12,
    color: '#10B981',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  instructionsText: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    lineHeight: 18,
  },
  
  // 🎨 NUEVOS ESTILOS MODERNOS PARA INPUTS
  modernInput: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 15,
    color: '#1F2937',
  },
  modernInputText: {
    fontSize: 15,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  inputLabelBlue: {
    fontSize: 12,
    color: '#003D82',
    marginBottom: 6,
    marginTop: 16,
  },
  validationError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    marginBottom: 8,
  },
  rowInputsEqual: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  halfInputEqual: {
    flex: 1,
  },
  infoMessage: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  
  // 🎨 ESTILOS PARA MODALES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#5B9FD8',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingVertical: 20,
    width: width * 0.9,
  },
  pickerContent: {
    paddingHorizontal: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
    width: '100%',
  },
  pickerColumn: {
    alignItems: 'center',
    paddingHorizontal: 0,
    flex: 1,
  },
  pickerScroll: {
    maxHeight: 600,
  },
  pickerOption: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 28,
  },
  acceptButton: {
    backgroundColor: '#E85D75',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Selector de Tipo de Documento (Pequeño)
  selectorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 40,
    paddingVertical: 8,
    minWidth: 250,
  },
  selectorOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  selectorOptionText: {
    fontSize: 15,
    color: '#1F2937',
  },
  selectorSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },

  // 🎨 ESTILOS PARA FLOATING LABELS
  floatingInputGroup: {
    marginBottom: 8,
  },
  floatingLabel: {
    fontSize: 12,
    color: '#003D82',
    marginBottom: 4,
    marginTop: 12,
  },
  floatingInputWrapper: {
    position: 'relative',
  },
  floatingLabelInside: {
    position: 'absolute',
    left: 0,
    top: 12,
    fontSize: 15,
    color: '#9CA3AF',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  floatingLabelWithIcon: {
    position: 'absolute',
    left: 0,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  floatingLabelActive: {
    top: 0,
    fontSize: 11,
    color: '#003D82',
  },
  modernInputWithIcon: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 45,
    justifyContent: 'flex-end',
  },

  // 🎨 ESTILOS PARA MODAL DE FECHA FULL SCREEN
  fullScreenModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenDatePicker: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  selectionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fullScreenPickerText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '600',
  },
  fullScreenPickerTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 22,
  },
  fullScreenAcceptButton: {
    backgroundColor: '#E11D48',
    marginHorizontal: 0,
    marginBottom: 0,
    paddingVertical: 8,
    borderRadius: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  // 🎨 ESTILOS PARA MODAL DE ÉXITO
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 40,
    alignItems: 'center',
    minWidth: 280,
  },
  successCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successCheckMark: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  successCardSaved: {
    fontSize: 14,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  successButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    minWidth: 200,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Estilos para pantalla de confirmación de pago
  paymentSuccessContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentSuccessContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  checkIconContainer: {
    marginBottom: 32,
  },
  checkIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  paymentSuccessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentSuccessSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Estilos para nuevas tarjetas guardadas (sin fondo)
  cardRowFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  cardSelection: {
    marginRight: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#2563EB',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  cardLogoSmall: {
    width: 40,
    height: 25,
  },
  fallbackCardIconSmall: {
    width: 40,
    height: 25,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackCardTextSmall: {
    fontSize: 16,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 0,
  },
  cardInfoFlat: {
    flex: 1,
    marginLeft: 16,
  },
  flatCardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  flatCardExpiry: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteButtonFlat: {
    paddingLeft: 16,
  },
  deleteXFlat: {
    fontSize: 24,
    color: '#2563EB',
    fontWeight: 'bold',
  },

  // Estilos anteriores mantenidos
  newSavedCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLogoSection: {
    marginRight: 16,
  },
  cardLogo: {
    width: 50,
    height: 32,
  },
  fallbackCardIcon: {
    width: 50,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackCardText: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
  },
  newCardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  newCardExpiry: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteX: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: 'bold',
  },

  // Estilos para modal de eliminación
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
  },
  deleteModalTitle: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  confirmDeleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#1E40AF',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});