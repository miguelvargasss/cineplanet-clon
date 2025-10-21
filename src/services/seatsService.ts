// 💺 SERVICIO DE ASIENTOS
// Servicio completo para gestión de asientos y reservas en Firebase

import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Seat, SeatReservation } from '../types';

// Generar estructura de asientos para una función específica
const generateSeatsLayout = (): Omit<Seat, 'isOccupied' | 'isSelected'>[] => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;
  const seats: Omit<Seat, 'isOccupied' | 'isSelected'>[] = [];

  rows.forEach((row) => {
    for (let number = 1; number <= seatsPerRow; number++) {
      const seatId = `${row}${number}`;
      
      seats.push({
        id: seatId,
        row,
        number,
        isWheelchair: row === 'A' && (number === 1 || number === 12), // Primera fila, extremos
      });
    }
  });

  return seats;
};

// Obtener asientos ocupados para una función específica
const getOccupiedSeats = async (showtimeId: string): Promise<string[]> => {
  try {
    const reservationsRef = collection(db, 'seatReservations');
    // 🔧 Optimizado: Solo filtrar por showtimeId (campo principal)
    const q = query(
      reservationsRef, 
      where('showtimeId', '==', showtimeId)
    );
    
    const querySnapshot = await getDocs(q);
    const occupiedSeats: string[] = [];
    
    // Filtrar por status en memoria para evitar índice compuesto
    querySnapshot.forEach((doc) => {
      const reservation = doc.data() as SeatReservation;
      // Solo incluir asientos reservados o comprados
      if (reservation.status === 'reserved' || reservation.status === 'purchased') {
        occupiedSeats.push(reservation.seatId);
      }
    });
    
    return occupiedSeats;
  } catch (error) {
    console.error('Error obteniendo asientos ocupados:', error);
    console.warn('Retornando array vacío - la colección seatReservations puede no existir aún');
    return []; // Retornar array vacío en lugar de fallar
  }
};

// Obtener asientos para una función específica con estado de ocupación
export const getSeatsByCinemaAndShowtime = async (
  cinemaId: string,
  showtimeId: string
): Promise<Seat[]> => {
  try {
    // Generar layout de asientos
    const seatsLayout = generateSeatsLayout();
    
    // Obtener asientos ocupados desde Firebase
    const occupiedSeats = await getOccupiedSeats(showtimeId);
    
    // Combinar información
    const seats: Seat[] = seatsLayout.map(seat => ({
      ...seat,
      isOccupied: occupiedSeats.includes(seat.id),
      isSelected: false
    }));

    return seats;
  } catch (error) {
    console.error('Error obteniendo asientos:', error);
    throw new Error('Error al cargar los asientos');
  }
};

// Verificar disponibilidad de asientos específicos
export const checkSeatAvailability = async (
  seatIds: string[],
  showtimeId: string
): Promise<{ available: boolean; unavailableSeats: string[] }> => {
  try {
    const occupiedSeats = await getOccupiedSeats(showtimeId);
    const unavailableSeats = seatIds.filter(seatId => occupiedSeats.includes(seatId));
    
    return {
      available: unavailableSeats.length === 0,
      unavailableSeats
    };
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    console.warn('Asumiendo que todos los asientos están disponibles debido a error');
    // En caso de error, asumir que todos los asientos están disponibles
    return {
      available: true,
      unavailableSeats: []
    };
  }
};

// Reservar asientos temporalmente (antes de la compra)
export const reserveSeatsTemporarily = async (
  seatIds: string[],
  showtimeId: string,
  movieId: string,
  cinemaId: string,
  userId: string,
  minutesToExpire: number = 10
): Promise<string[]> => {
  try {
    // Verificar disponibilidad primero
    const availability = await checkSeatAvailability(seatIds, showtimeId);
    if (!availability.available) {
      throw new Error(`Los siguientes asientos no están disponibles: ${availability.unavailableSeats.join(', ')}`);
    }

    const reservationIds: string[] = [];
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + minutesToExpire);

    // Crear reservas temporales
    for (const seatId of seatIds) {
      const reservation: Omit<SeatReservation, 'id'> = {
        seatId,
        showtimeId,
        movieId,
        cinemaId,
        userId,
        reservedAt: new Date(),
        status: 'reserved',
        expiresAt
      };

      const docRef = await addDoc(collection(db, 'seatReservations'), {
        ...reservation,
        reservedAt: Timestamp.fromDate(reservation.reservedAt),
        expiresAt: Timestamp.fromDate(reservation.expiresAt!)
      });

      reservationIds.push(docRef.id);
    }

    return reservationIds;
  } catch (error) {
    console.error('Error reservando asientos:', error);
    throw error;
  }
};

// Confirmar reservas (cambiar de 'reserved' a 'purchased')
export const confirmSeatReservations = async (reservationIds: string[]): Promise<void> => {
  try {
    const updatePromises = reservationIds.map(async (reservationId) => {
      const reservationRef = doc(db, 'seatReservations', reservationId);
      await updateDoc(reservationRef, {
        status: 'purchased',
        expiresAt: null // Ya no expira porque fue comprado
      });
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error confirmando reservas:', error);
    throw new Error('Error al confirmar las reservas de asientos');
  }
};

// Liberar asientos (eliminar reservas)
export const releaseSeats = async (reservationIds: string[]): Promise<void> => {
  try {
    const deletePromises = reservationIds.map(async (reservationId) => {
      const reservationRef = doc(db, 'seatReservations', reservationId);
      await deleteDoc(reservationRef);
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error liberando asientos:', error);
    throw new Error('Error al liberar los asientos');
  }
};
