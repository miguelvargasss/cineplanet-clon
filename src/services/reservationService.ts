// 🎫 SERVICIO DE RESERVAS
// Servicio especializado para gestionar reservas de asientos y tickets

import {
  collection, 
  doc, 
  getDocs, 
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { SeatReservation, TicketPurchase } from '../types';
import { 
  reserveSeatsTemporarily, 
  confirmSeatReservations, 
  releaseSeats
} from './seatsService';
import { cleanupExpiredReservations } from './cleanupService';

// Crear una reserva completa (asientos + información de la compra)
export const createReservation = async (
  userId: string,
  movieId: string,
  showtimeId: string,
  cinemaId: string,
  seatIds: string[],
  totalPrice: number
): Promise<{ reservationIds: string[]; ticketId: string }> => {
  try {
    // Limpiar reservas expiradas primero
    await cleanupExpiredReservations();
    
    // Reservar asientos temporalmente (10 minutos para completar la compra)
    const reservationIds = await reserveSeatsTemporarily(
      seatIds,
      showtimeId,
      movieId,
      cinemaId,
      userId,
      10 // 10 minutos para completar la compra
    );

    // Crear el ticket en estado pendiente
    const ticket: Omit<TicketPurchase, 'id'> = {
      userId,
      movieId,
      showtimeId,
      cinemaId,
      seats: seatIds,
      seatReservations: reservationIds,
      totalPrice,
      purchaseDate: new Date(),
      status: 'pending'
    };

    const ticketRef = await addDoc(collection(db, 'tickets'), {
      ...ticket,
      purchaseDate: Timestamp.fromDate(ticket.purchaseDate)
    });

    return {
      reservationIds,
      ticketId: ticketRef.id
    };
  } catch (error) {
    console.error('Error creando reserva:', error);
    throw error;
  }
};

// Confirmar una reserva (cambiar a estado "purchased")
export const confirmReservation = async (
  ticketId: string,
  reservationIds: string[]
): Promise<void> => {
  try {
    // Confirmar las reservas de asientos
    await confirmSeatReservations(reservationIds);

    // Actualizar el ticket a confirmado
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, {
      status: 'confirmed'
    });

    console.log('Reserva confirmada exitosamente');
  } catch (error) {
    console.error('Error confirmando reserva:', error);
    throw new Error('Error al confirmar la reserva');
  }
};

// Cancelar una reserva
export const cancelReservation = async (
  ticketId: string,
  reservationIds: string[]
): Promise<void> => {
  try {
    // Liberar los asientos
    await releaseSeats(reservationIds);

    // Actualizar el ticket a cancelado
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, {
      status: 'cancelled'
    });

    console.log('Reserva cancelada exitosamente');
  } catch (error) {
    console.error('Error cancelando reserva:', error);
    throw new Error('Error al cancelar la reserva');
  }
};

// Obtener reservas de un usuario
export const getUserReservations = async (userId: string): Promise<TicketPurchase[]> => {
  try {
    const ticketsRef = collection(db, 'tickets');
    const q = query(
      ticketsRef,
      where('userId', '==', userId),
      orderBy('purchaseDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reservations: TicketPurchase[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        ...data,
        purchaseDate: data.purchaseDate.toDate(),
      } as TicketPurchase);
    });

    return reservations;
  } catch (error) {
    console.error('Error obteniendo reservas del usuario:', error);
    throw new Error('Error al cargar las reservas');
  }
};

// Obtener reservas por función (para verificar disponibilidad)
export const getReservationsByShowtime = async (showtimeId: string): Promise<SeatReservation[]> => {
  try {
    const reservationsRef = collection(db, 'seatReservations');
    // 🔧 Optimizado: Solo filtrar por showtimeId para evitar índice compuesto
    const q = query(
      reservationsRef,
      where('showtimeId', '==', showtimeId)
    );

    const querySnapshot = await getDocs(q);
    const reservations: SeatReservation[] = [];

    // Filtrar por status en memoria
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Solo incluir reservas activas (reserved o purchased)
      if (data.status === 'reserved' || data.status === 'purchased') {
        reservations.push({
          id: doc.id,
          ...data,
          reservedAt: data.reservedAt.toDate(),
          expiresAt: data.expiresAt ? data.expiresAt.toDate() : undefined,
        } as SeatReservation);
      }
    });

    return reservations;
  } catch (error) {
    console.error('Error obteniendo reservas por función:', error);
    // En lugar de lanzar error, retornar array vacío para compatibilidad
    console.warn('Retornando array vacío de reservas - la colección seatReservations puede no existir aún');
    return [];
  }
};

// Limpiar todas las reservas de una película específica (cuando se elimina)
export const cleanupMovieReservations = async (movieId: string): Promise<void> => {
  try {
    // Obtener todas las reservas de la película
    const reservationsRef = collection(db, 'seatReservations');
    const q = query(reservationsRef, where('movieId', '==', movieId));
    
    const querySnapshot = await getDocs(q);
    const deletePromises: Promise<void>[] = [];

    querySnapshot.forEach((docSnapshot) => {
      deletePromises.push(deleteDoc(docSnapshot.ref));
    });

    await Promise.all(deletePromises);

    // También limpiar tickets relacionados
    const ticketsRef = collection(db, 'tickets');
    const ticketsQuery = query(ticketsRef, where('movieId', '==', movieId));
    
    const ticketsSnapshot = await getDocs(ticketsQuery);
    const ticketDeletePromises: Promise<void>[] = [];

    ticketsSnapshot.forEach((docSnapshot) => {
      ticketDeletePromises.push(deleteDoc(docSnapshot.ref));
    });

    await Promise.all(ticketDeletePromises);

    console.log(`Limpiadas reservas y tickets para la película: ${movieId}`);
  } catch (error) {
    console.error('Error limpiando reservas de película:', error);
    throw new Error('Error al limpiar las reservas de la película');
  }
};

// Obtener estadísticas de ocupación por función
export const getShowtimeOccupancyStats = async (showtimeId: string): Promise<{
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  occupancyPercentage: number;
}> => {
  try {
    const totalSeats = 120; // 10 filas × 12 asientos
    const reservations = await getReservationsByShowtime(showtimeId);
    const occupiedSeats = reservations.length;
    const availableSeats = totalSeats - occupiedSeats;
    const occupancyPercentage = Math.round((occupiedSeats / totalSeats) * 100);

    return {
      totalSeats,
      occupiedSeats,
      availableSeats,
      occupancyPercentage
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de ocupación:', error);
    // En caso de error, retornar valores por defecto (todos los asientos disponibles)
    console.warn('Retornando valores por defecto - todos los asientos disponibles');
    return {
      totalSeats: 120,
      occupiedSeats: 0,
      availableSeats: 120,
      occupancyPercentage: 0
    };
  }
};

