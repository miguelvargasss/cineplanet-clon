// SERVICIO PARA HORARIOS Y COMPRA DE ENTRADAS
// 
// - Lee horarios reales desde Firebase Firestore
// - Convierte estructura simple de BD a estructura compleja de UI
// - Fallback a horarios hardcodeados si no hay datos en Firebase
// - NUEVO: Integración completa con sistema de reservas de asientos
//
// FLUJO:
// 1. Buscar película en Firebase por ID
// 2. Extraer schedules de la película
// 3. Convertir { cinemaId, showtimes[] } a { cinemaId, cinemaName, Showtime[] }
// 4. Si no hay datos, usar horarios por defecto
// 5. Integrar disponibilidad real de asientos desde reservas

import { 
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MovieSchedule, Showtime, TicketPurchase, Ticket, TicketItem, SnackItem } from '../types';
import { getCinemaById } from '../data/cinemas';
import { getShowtimeOccupancyStats } from './reservationService';
import { getMovieById } from './moviesService';
import { generatePurchaseCode, generateRandomSala, getCurrentPeruDateTime } from '../utils/purchaseUtils';

// 🔄 MAPEO DE IDS: Firebase -> Aplicación
const mapCinemaIdFromFirebase = (firebaseId: string): string => {
  const idMapping: { [key: string]: string } = {
    'cineplanet-alcazar': 'cp-alcazar',
    'cineplanet-centro-civico': 'cp-centro-civico',
    'cineplanet-san-miguel': 'cp-san-miguel',
    'cineplanet-brasil': 'cp-brasil',
    'cineplanet-primavera': 'cp-primavera'
  };
  
  return idMapping[firebaseId] || firebaseId;
};

// 🔄 MAPEO DE IDS: Aplicación -> Firebase  


// 🔄 FUNCIÓN PARA CONVERTIR HORARIOS DESDE FIREBASE CON DISPONIBILIDAD REAL
const convertFirebaseSchedulesToUI = async (
  movieId: string,
  firebaseSchedules: { cinemaId: string; showtimes: string[] }[]
): Promise<MovieSchedule[]> => {
  const today = new Date();
  
  const schedules = await Promise.all(firebaseSchedules.map(async (schedule) => {
    // 🎯 MAPEAR ID DE FIREBASE A ID DE APLICACIÓN
    const appCinemaId = mapCinemaIdFromFirebase(schedule.cinemaId);
    const cinema = getCinemaById(appCinemaId);
    const cinemaName = cinema ? cinema.name : appCinemaId;
    
    const showtimes: Showtime[] = await Promise.all(
      schedule.showtimes.map(async (time, index) => {
        const showtimeId = `${movieId}-${appCinemaId}-${index}`;
        
        // ✨ OBTENER DISPONIBILIDAD REAL DE ASIENTOS
        let availableSeats = 120;
        try {
          const occupancyStats = await getShowtimeOccupancyStats(showtimeId);
          availableSeats = occupancyStats.availableSeats;
        } catch {
          console.warn(`No se pudo obtener ocupación para función ${showtimeId}, usando valor por defecto (${availableSeats} asientos disponibles)`);
          // No relanzar el error, simplemente usar el valor por defecto
        }
        
        return {
          id: showtimeId,
          movieId,
          cinemaId: appCinemaId, // Usar ID mapeado
          date: today.toISOString().split('T')[0],
          time: time,
          format: '2D', // Por defecto 2D, se puede mejorar después
          language: 'SUB', // Por defecto subtitulada
          availableSeats,
          totalSeats: 120,
          price: 12.00 // Precio base
        };
      })
    );
    
    return {
      cinemaId: appCinemaId, // Usar ID mapeado
      cinemaName: cinemaName,
      showtimes: showtimes
    };
  }));
  
  return schedules;
};

// FUNCIÓN PARA LEER HORARIOS REALES DESDE FIREBASE
const getSchedulesFromFirebase = async (movieId: string): Promise<MovieSchedule[]> => {
  try {
    // Obtener la película desde Firebase
    const movie = await getMovieById(movieId);
    
    if (!movie) {
      return [];
    }
    
    // Verificar si tiene schedules
    if (!movie.schedules || movie.schedules.length === 0) {
      return generateSampleSchedules(movieId); // Fallback a horarios por defecto
    }
    
    // Verificar si los schedules tienen la estructura correcta
    // En Firebase se guardan como { cinemaId: string; showtimes: string[] }
    const validSchedules = movie.schedules.filter(schedule => 
      schedule && 
      typeof schedule === 'object' && 
      'cinemaId' in schedule && 
      'showtimes' in schedule &&
      Array.isArray(schedule.showtimes)
    );
    
    if (validSchedules.length === 0) {
      return generateSampleSchedules(movieId);
    }
    
    // Convertir estructura simple de Firebase a estructura compleja de UI
    const firebaseSchedules = validSchedules.map(schedule => ({
      cinemaId: schedule.cinemaId,
      showtimes: Array.isArray(schedule.showtimes) 
        ? (schedule.showtimes as any[]).map(st => typeof st === 'string' ? st : st.time || '12:00')
        : ['12:00'] // Fallback
    }));
    
    const convertedSchedules = await convertFirebaseSchedulesToUI(movieId, firebaseSchedules);
    
    return convertedSchedules;
    
  } catch (error) {
    console.error('❌ Error leyendo horarios desde Firebase:', error);
    return generateSampleSchedules(movieId);
  }
};

// Generar horarios específicos para Avatar: El Camino del Agua
export const generateAvatarSchedules = (movieId: string): MovieSchedule[] => {
  const today = new Date();
  
  // Horarios específicos solicitados: 19:30, 21:45, 22:10
  const times = ['19:30', '21:45', '22:10'];
  const formats = ['3D', '3D', '2D'] as const;
  const languages = ['SUB', 'DOB', 'SUB'] as const;

  const schedules: MovieSchedule[] = [
    {
      cinemaId: 'cp-alcazar',
      cinemaName: 'CP Alcazar',
      showtimes: times.map((time, index) => ({
        id: `${movieId}-alcazar-${index}`,
        movieId,
        cinemaId: 'cp-alcazar',
        date: today.toISOString().split('T')[0],
        time,
        format: formats[index],
        language: languages[index],
        availableSeats: 150 - Math.floor(Math.random() * 30),
        totalSeats: 150,
        price: 18.00 // Precio premium para 3D
      }))
    },
    {
      cinemaId: 'cp-brasil',
      cinemaName: 'CP Brasil',
      showtimes: times.map((time, index) => ({
        id: `${movieId}-brasil-${index}`,
        movieId,
        cinemaId: 'cp-brasil',
        date: today.toISOString().split('T')[0],
        time,
        format: formats[index],
        language: languages[index],
        availableSeats: 120 - Math.floor(Math.random() * 25),
        totalSeats: 120,
        price: 15.00
      }))
    },
    {
      cinemaId: 'cp-centro-civico',
      cinemaName: 'CP Centro Civico',
      showtimes: times.map((time, index) => ({
        id: `${movieId}-civico-${index}`,
        movieId,
        cinemaId: 'cp-centro-civico',
        date: today.toISOString().split('T')[0],
        time,
        format: formats[index],
        language: languages[index],
        availableSeats: 100 - Math.floor(Math.random() * 20),
        totalSeats: 100,
        price: 12.00
      }))
    }
  ];

  return schedules;
};

// Generar horarios de ejemplo para una película
export const generateSampleSchedules = (movieId: string): MovieSchedule[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const times = ['18:20', '20:30', '22:40'];
  const formats = ['2D', '3D'] as const;
  const languages = ['ESP', 'SUB'] as const;

  const schedules: MovieSchedule[] = [
    {
      cinemaId: 'cp-alcazar',
      cinemaName: 'CP Alcazar',
      showtimes: times.map((time, index) => ({
        id: `${movieId}-alcazar-${index}`,
        movieId,
        cinemaId: 'cp-alcazar',
        date: today.toISOString().split('T')[0],
        time,
        format: formats[index % formats.length],
        language: languages[index % languages.length],
        availableSeats: 150 - Math.floor(Math.random() * 50),
        totalSeats: 150,
        price: 15.00
      }))
    },
    {
      cinemaId: 'cp-brasil',
      cinemaName: 'CP Brasil',
      showtimes: times.map((time, index) => ({
        id: `${movieId}-brasil-${index}`,
        movieId,
        cinemaId: 'cp-brasil',
        date: today.toISOString().split('T')[0],
        time,
        format: formats[index % formats.length],
        language: languages[index % languages.length],
        availableSeats: 120 - Math.floor(Math.random() * 40),
        totalSeats: 120,
        price: 12.00
      }))
    },
    {
      cinemaId: 'cp-centro-civico',
      cinemaName: 'CP Centro Civico',
      showtimes: times.map((time, index) => ({
        id: `${movieId}-civico-${index}`,
        movieId,
        cinemaId: 'cp-centro-civico',
        date: today.toISOString().split('T')[0],
        time,
        format: formats[index % formats.length],
        language: languages[index % languages.length],
        availableSeats: 100 - Math.floor(Math.random() * 30),
        totalSeats: 100,
        price: 10.00
      }))
    }
  ];

  return schedules;
};

// Obtener horarios para una película específica
export const getMovieSchedules = async (movieId: string): Promise<MovieSchedule[]> => {
  try {
    // 🔥 NUEVA IMPLEMENTACIÓN: Leer horarios reales desde Firebase
    const realSchedules = await getSchedulesFromFirebase(movieId);
    
    if (realSchedules.length > 0) {
      return realSchedules;
    }
    
    // 🔄 FALLBACK: Si no hay horarios en Firebase, usar los hardcodeados
    
    // Verificar si es Avatar para usar horarios específicos (legacy)
    if (movieId === 'avatar-camino-agua' || movieId.includes('avatar')) {
      return generateAvatarSchedules(movieId);
    }
    
    // Generar datos de ejemplo como último recurso
    return generateSampleSchedules(movieId);
    
  } catch (error) {
    console.error('❌ Error getting movie schedules:', error);
    // En caso de error, generar horarios de ejemplo
    return generateSampleSchedules(movieId);
  }
};

// Obtener horarios para una película en un cine específico
export const getMovieScheduleForCinema = async (
  movieId: string, 
  cinemaId: string
): Promise<MovieSchedule | null> => {
  try {
    const schedules = await getMovieSchedules(movieId);
    return schedules.find(schedule => schedule.cinemaId === cinemaId) || null;
  } catch (error) {
    console.error('Error getting movie schedule for cinema:', error);
    throw error;
  }
};

// Obtener información de un horario específico
export const getShowtimeById = async (
  movieId: string, 
  showtimeId: string
): Promise<Showtime | null> => {
  try {
    const schedules = await getMovieSchedules(movieId);
    
    for (const schedule of schedules) {
      const showtime = schedule.showtimes.find(st => st.id === showtimeId);
      if (showtime) {
        return showtime;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting showtime:', error);
    throw error;
  }
};

// ✨ NUEVA FUNCIÓN: Crear compra de ticket con reserva de asientos integrada
export const createTicketPurchaseWithReservation = async (
  userId: string,
  movieId: string,
  showtimeId: string,
  cinemaId: string,
  selectedSeats: string[],
  totalPrice: number
): Promise<{ ticketId: string; reservationIds: string[] }> => {
  try {
    // Importar función de reserva
    const { createReservation } = await import('./reservationService');
    
    // Crear reserva completa (asientos + ticket)
    const { reservationIds, ticketId } = await createReservation(
      userId,
      movieId, 
      showtimeId,
      cinemaId,
      selectedSeats,
      totalPrice
    );
    
    return { ticketId, reservationIds };
  } catch (error) {
    console.error('Error creando compra con reserva:', error);
    throw error;
  }
};

// ✨ NUEVA FUNCIÓN: Confirmar compra y asientos
export const confirmTicketPurchaseWithSeats = async (
  ticketId: string,
  reservationIds: string[]
): Promise<void> => {
  try {
    // Importar función de confirmación
    const { confirmReservation } = await import('./reservationService');
    
    // Confirmar reserva (esto actualiza tanto el ticket como los asientos)
    await confirmReservation(ticketId, reservationIds);
  } catch (error) {
    console.error('Error confirmando compra:', error);
    throw error;
  }
};

// ✨ NUEVA FUNCIÓN: Cancelar compra y liberar asientos
export const cancelTicketPurchaseWithSeats = async (
  ticketId: string,
  reservationIds: string[]
): Promise<void> => {
  try {
    // Importar función de cancelación
    const { cancelReservation } = await import('./reservationService');
    
    // Cancelar reserva (esto libera los asientos y cancela el ticket)
    await cancelReservation(ticketId, reservationIds);
  } catch (error) {
    console.error('Error cancelando compra:', error);
    throw error;
  }
};

// Crear una compra de entrada (función legacy mantenida para compatibilidad)
export const createTicketPurchase = async (
  purchase: Omit<TicketPurchase, 'id' | 'purchaseDate' | 'status'>
): Promise<string> => {
  try {
    const ticketPurchase: TicketPurchase = {
      ...purchase,
      seatReservations: [], // Campo requerido en la nueva estructura
      purchaseDate: new Date(),
      status: 'pending'
    };

    const docRef = await addDoc(collection(db, 'tickets'), {
      ...ticketPurchase,
      purchaseDate: Timestamp.fromDate(ticketPurchase.purchaseDate)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating ticket purchase:', error);
    throw error;
  }
};

// Obtener compras de un usuario (actualizado para usar nueva colección)
export const getUserTicketPurchases = async (userId: string): Promise<TicketPurchase[]> => {
  try {
    // ✨ OPTIMIZACIÓN: Consulta simple sin orderBy para evitar índice compuesto
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const purchases: TicketPurchase[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      purchases.push({
        id: doc.id,
        ...data,
        purchaseDate: data.purchaseDate.toDate()
      } as TicketPurchase);
    });
    
    // ✨ OPTIMIZACIÓN: Ordenar en memoria en lugar de en Firebase
    purchases.sort((a, b) => 
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
    
    return purchases;
  } catch (error) {
    console.error('Error getting user ticket purchases:', error);
    throw error;
  }
};

// Confirmar compra (función legacy mantenida para compatibilidad)
export const confirmTicketPurchase = async (purchaseId: string): Promise<void> => {
  try {
    const purchaseRef = doc(db, 'tickets', purchaseId); // Cambiado de 'ticketPurchases' a 'tickets'
    await updateDoc(purchaseRef, {
      status: 'confirmed',
      confirmedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error confirming ticket purchase:', error);
    throw error;
  }
};

// Cancelar compra (función legacy mantenida para compatibilidad)
export const cancelTicketPurchase = async (purchaseId: string): Promise<void> => {
  try {
    const purchaseRef = doc(db, 'tickets', purchaseId); // Cambiado de 'ticketPurchases' a 'tickets'
    await updateDoc(purchaseRef, {
      status: 'cancelled',
      cancelledAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error cancelling ticket purchase:', error);
    throw error;
  }
};

// ========================================
// NUEVAS FUNCIONES PARA TICKETS CON QR
// ========================================

/**
 * Crear ticket con código QR después de una compra exitosa
 * @param userId - ID del usuario que realiza la compra
 * @param movieId - ID de la película
 * @param movieTitle - Título de la película
 * @param cinema - Nombre del cine
 * @param seats - Array de asientos seleccionados (ej: ["A1", "A2"])
 * @param totalAmount - Monto total de la compra
 * @returns Ticket creado con código QR
 */
export const createTicketWithQR = async (
  userId: string,
  movieId: string,
  movieTitle: string,
  userName: string,
  userEmail: string,
  cinema: string,
  seats: string[],
  totalAmount: number,
  tickets?: TicketItem[],
  snacks?: SnackItem[]
): Promise<Ticket> => {
  try {
    // Generar código de compra único
    const purchaseCode = generatePurchaseCode();
    
    // Generar sala aleatoria
    const sala = generateRandomSala();
    
    // Obtener fecha y hora de Perú
    const { date, time } = getCurrentPeruDateTime();

    // Crear datos para el QR (JSON stringificado)
    const qrData = JSON.stringify({
      purchaseCode,
      movie: movieTitle,
      cinema,
      date,
      time,
      sala,
      seats: seats.join(', ')
    });

    // Datos del ticket
    const ticketData = {
      userId,
      movieId,
      purchaseCode,
      movieTitle,
      userName,
      userEmail,
      cinema,
      purchaseDate: date,
      purchaseTime: time,
      sala,
      seats,
      totalAmount,
      createdAt: Timestamp.now(),
      qrData,
      tickets: tickets || [],
      snacks: snacks || [],
      visits: 0,
      points: 0
    };

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, 'tickets'), ticketData);

    console.log('✅ Ticket creado exitosamente:', docRef.id);

    return {
      id: docRef.id,
      ...ticketData,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('❌ Error creando ticket con QR:', error);
    throw error;
  }
};

/**
 * Obtener todos los tickets de un usuario
 * @param userId - ID del usuario
 * @returns Array de tickets del usuario ordenados por fecha de creación (más recientes primero)
 */
export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  try {
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const tickets: Ticket[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Validar que el documento tenga los campos necesarios
      if (!data.purchaseCode || !data.movieTitle) {
        console.warn(`⚠️ Ticket incompleto ignorado: ${doc.id}`);
        return; // Saltar este documento
      }

      tickets.push({
        id: doc.id,
        userId: data.userId,
        movieId: data.movieId,
        purchaseCode: data.purchaseCode,
        movieTitle: data.movieTitle,
        userName: data.userName || 'Usuario',
        userEmail: data.userEmail || '',
        cinema: data.cinema || 'Cineplanet',
        purchaseDate: data.purchaseDate || new Date().toLocaleDateString('es-PE'),
        purchaseTime: data.purchaseTime || '00:00',
        sala: data.sala || 'Sala 1',
        seats: data.seats || [],
        totalAmount: data.totalAmount || 0,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        qrData: data.qrData || '{}',
        tickets: data.tickets || [],
        snacks: data.snacks || [],
        visits: data.visits || 0,
        points: data.points || 0
      });
    });

    // Ordenar por fecha de creación (más recientes primero)
    tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log(`✅ Se encontraron ${tickets.length} tickets para el usuario`);
    return tickets;
  } catch (error) {
    console.error('❌ Error obteniendo tickets del usuario:', error);
    throw error;
  }
};

/**
 * Obtener un ticket específico por su ID
 * @param ticketId - ID del ticket
 * @returns Ticket encontrado o null si no existe
 */
export const getTicketById = async (ticketId: string): Promise<Ticket | null> => {
  try {
    const ticketDoc = await getDocs(query(collection(db, 'tickets'), where('__name__', '==', ticketId)));
    
    if (ticketDoc.empty) {
      console.warn(`⚠️ No se encontró el ticket con ID: ${ticketId}`);
      return null;
    }

    const ticketData = ticketDoc.docs[0].data();
    
    // Validar que tenga los campos necesarios
    if (!ticketData.purchaseCode || !ticketData.movieTitle) {
      console.error(`❌ Ticket con datos incompletos: ${ticketId}`);
      return null;
    }
    
    return {
      id: ticketDoc.docs[0].id,
      userId: ticketData.userId,
      movieId: ticketData.movieId,
      purchaseCode: ticketData.purchaseCode,
      movieTitle: ticketData.movieTitle,
      userName: ticketData.userName || 'Usuario',
      userEmail: ticketData.userEmail || '',
      cinema: ticketData.cinema || 'Cineplanet',
      purchaseDate: ticketData.purchaseDate || new Date().toLocaleDateString('es-PE'),
      purchaseTime: ticketData.purchaseTime || '00:00',
      sala: ticketData.sala || 'Sala 1',
      seats: ticketData.seats || [],
      totalAmount: ticketData.totalAmount || 0,
      createdAt: ticketData.createdAt ? ticketData.createdAt.toDate() : new Date(),
      qrData: ticketData.qrData || '{}',
      tickets: ticketData.tickets || [],
      snacks: ticketData.snacks || [],
      visits: ticketData.visits || 0,
      points: ticketData.points || 0
    };
  } catch (error) {
    console.error('❌ Error obteniendo ticket por ID:', error);
    throw error;
  }
};

/**
 * Obtener un ticket por su código de compra
 * @param purchaseCode - Código de compra (ej: "WLKXP5R")
 * @returns Ticket encontrado o null si no existe
 */
export const getTicketByPurchaseCode = async (purchaseCode: string): Promise<Ticket | null> => {
  try {
    const q = query(
      collection(db, 'tickets'),
      where('purchaseCode', '==', purchaseCode)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn(`⚠️ No se encontró el ticket con código: ${purchaseCode}`);
      return null;
    }

    const ticketData = querySnapshot.docs[0].data();
    
    // Validar que tenga los campos necesarios
    if (!ticketData.purchaseCode || !ticketData.movieTitle) {
      console.error(`❌ Ticket con datos incompletos para código: ${purchaseCode}`);
      return null;
    }
    
    return {
      id: querySnapshot.docs[0].id,
      userId: ticketData.userId,
      movieId: ticketData.movieId,
      purchaseCode: ticketData.purchaseCode,
      movieTitle: ticketData.movieTitle,
      userName: ticketData.userName || 'Usuario',
      userEmail: ticketData.userEmail || '',
      cinema: ticketData.cinema || 'Cineplanet',
      purchaseDate: ticketData.purchaseDate || new Date().toLocaleDateString('es-PE'),
      purchaseTime: ticketData.purchaseTime || '00:00',
      sala: ticketData.sala || 'Sala 1',
      seats: ticketData.seats || [],
      totalAmount: ticketData.totalAmount || 0,
      createdAt: ticketData.createdAt ? ticketData.createdAt.toDate() : new Date(),
      qrData: ticketData.qrData || '{}',
      tickets: ticketData.tickets || [],
      snacks: ticketData.snacks || [],
      visits: ticketData.visits || 0,
      points: ticketData.points || 0
    };
  } catch (error) {
    console.error('❌ Error obteniendo ticket por código de compra:', error);
    throw error;
  }
};