// SERVICIO PARA HORARIOS Y COMPRA DE ENTRADAS

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MovieSchedule, Showtime, TicketPurchase } from '../types';
import { getCinemaById } from '../data/cinemas';

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
    // Verificar si es Avatar para usar horarios específicos
    if (movieId === 'avatar-camino-agua' || movieId.includes('avatar')) {
      return generateAvatarSchedules(movieId);
    }
    
    // En una implementación real, esto vendría de Firebase
    // Por ahora, generamos datos de ejemplo
    return generateSampleSchedules(movieId);
  } catch (error) {
    console.error('Error getting movie schedules:', error);
    throw error;
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

// Crear una compra de entrada
export const createTicketPurchase = async (
  purchase: Omit<TicketPurchase, 'id' | 'purchaseDate' | 'status'>
): Promise<string> => {
  try {
    const ticketPurchase: TicketPurchase = {
      ...purchase,
      purchaseDate: new Date(),
      status: 'pending'
    };

    const docRef = await addDoc(collection(db, 'ticketPurchases'), {
      ...ticketPurchase,
      purchaseDate: Timestamp.fromDate(ticketPurchase.purchaseDate)
    });

    console.log('✅ Ticket purchase created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating ticket purchase:', error);
    throw error;
  }
};

// Obtener compras de un usuario
export const getUserTicketPurchases = async (userId: string): Promise<TicketPurchase[]> => {
  try {
    const q = query(
      collection(db, 'ticketPurchases'),
      where('userId', '==', userId),
      orderBy('purchaseDate', 'desc')
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
    
    return purchases;
  } catch (error) {
    console.error('Error getting user ticket purchases:', error);
    throw error;
  }
};

// Confirmar compra
export const confirmTicketPurchase = async (purchaseId: string): Promise<void> => {
  try {
    const purchaseRef = doc(db, 'ticketPurchases', purchaseId);
    await updateDoc(purchaseRef, {
      status: 'confirmed',
      confirmedAt: Timestamp.fromDate(new Date())
    });
    
    console.log('✅ Ticket purchase confirmed:', purchaseId);
  } catch (error) {
    console.error('Error confirming ticket purchase:', error);
    throw error;
  }
};

// Cancelar compra
export const cancelTicketPurchase = async (purchaseId: string): Promise<void> => {
  try {
    const purchaseRef = doc(db, 'ticketPurchases', purchaseId);
    await updateDoc(purchaseRef, {
      status: 'cancelled',
      cancelledAt: Timestamp.fromDate(new Date())
    });
    
    console.log('✅ Ticket purchase cancelled:', purchaseId);
  } catch (error) {
    console.error('Error cancelling ticket purchase:', error);
    throw error;
  }
};