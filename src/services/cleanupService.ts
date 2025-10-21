// 🧹 SERVICIO DE LIMPIEZA AUTOMÁTICA
// Servicio para limpiar datos obsoletos y mantener la base de datos optimizada
// ⚡ OPTIMIZADO: Consultas simples para evitar índices compuestos de Firebase

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Limpiar reservas expiradas (ejecutar periódicamente)
export const cleanupExpiredReservations = async (): Promise<{
  cleanedCount: number;
  message: string;
}> => {
  try {
    const reservationsRef = collection(db, 'seatReservations');
    const now = Timestamp.now();
    
    // 🔧 NUEVA ESTRATEGIA: Solo filtrar por expiresAt para evitar índice compuesto
    // Luego filtrar por status en memoria (más eficiente para casos pequeños)
    const q = query(
      reservationsRef,
      where('expiresAt', '<', now)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises: Promise<void>[] = [];

    // 🔧 Filtrar por status en memoria para evitar índice compuesto
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      // Solo eliminar si el status es 'reserved' (filtro en memoria)
      if (data.status === 'reserved') {
        deletePromises.push(deleteDoc(docSnapshot.ref));
      }
    });

    await Promise.all(deletePromises);
    
    const cleanedCount = deletePromises.length;
    console.log(`🧹 Limpiadas ${cleanedCount} reservas expiradas`);
    
    return {
      cleanedCount,
      message: `Se limpiaron ${cleanedCount} reservas expiradas`
    };
  } catch (error) {
    console.error('Error limpiando reservas expiradas:', error);
    throw new Error('Error al limpiar reservas expiradas');
  }
};

// Limpiar tickets pendientes muy antiguos (más de 24 horas)
export const cleanupOldPendingTickets = async (): Promise<{
  cleanedCount: number;
  message: string;
}> => {
  try {
    const ticketsRef = collection(db, 'tickets');
    const dayAgo = new Date();
    dayAgo.setHours(dayAgo.getHours() - 24);
    
    // Buscar tickets pendientes de más de 24 horas
    const q = query(
      ticketsRef,
      where('status', '==', 'pending'),
      where('purchaseDate', '<', Timestamp.fromDate(dayAgo))
    );

    const querySnapshot = await getDocs(q);
    const updatePromises: Promise<void>[] = [];

    querySnapshot.forEach((docSnapshot) => {
      // En lugar de eliminar, cambiar estado a 'expired'
      updatePromises.push(
        updateDoc(docSnapshot.ref, {
          status: 'expired',
          expiredAt: Timestamp.now()
        })
      );
    });

    await Promise.all(updatePromises);
    
    const cleanedCount = updatePromises.length;
    console.log(`🧹 Marcados como expirados ${cleanedCount} tickets pendientes antiguos`);
    
    return {
      cleanedCount,
      message: `Se marcaron como expirados ${cleanedCount} tickets pendientes antiguos`
    };
  } catch (error) {
    console.error('Error limpiando tickets pendientes:', error);
    throw new Error('Error al limpiar tickets pendientes');
  }
};

// Función principal de limpieza (ejecutar diariamente)
export const performDailyCleanup = async (): Promise<{
  totalCleaned: number;
  summary: string[];
}> => {
  try {
    console.log('🧹 Iniciando limpieza diaria automática...');
    
    // Limpiar reservas expiradas
    const reservationsResult = await cleanupExpiredReservations();
    
    // Limpiar tickets pendientes antiguos
    const ticketsResult = await cleanupOldPendingTickets();
    
    const totalCleaned = reservationsResult.cleanedCount + ticketsResult.cleanedCount;
    const summary = [
      reservationsResult.message,
      ticketsResult.message,
      `✅ Limpieza completada. Total de elementos procesados: ${totalCleaned}`
    ];
    
    console.log('🧹 Limpieza diaria completada:', summary);
    
    return {
      totalCleaned,
      summary
    };
  } catch (error) {
    console.error('Error en limpieza diaria:', error);
    throw new Error('Error durante la limpieza diaria');
  }
};

// Función para verificar la salud de la base de datos
export const getDatabaseHealthStats = async (): Promise<{
  totalReservations: number;
  activeReservations: number;
  expiredReservations: number;
  totalTickets: number;
  confirmedTickets: number;
  pendingTickets: number;
  expiredTickets: number;
}> => {
  try {
    // Contar reservas
    const reservationsRef = collection(db, 'seatReservations');
    const allReservationsSnapshot = await getDocs(reservationsRef);
    
    let activeReservations = 0;
    let expiredReservations = 0;
    const now = new Date();
    
    allReservationsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'reserved' && data.expiresAt) {
        const expiresAt = data.expiresAt.toDate();
        if (expiresAt > now) {
          activeReservations++;
        } else {
          expiredReservations++;
        }
      } else if (data.status === 'purchased') {
        activeReservations++;
      }
    });
    
    // Contar tickets
    const ticketsRef = collection(db, 'tickets');
    const allTicketsSnapshot = await getDocs(ticketsRef);
    
    let confirmedTickets = 0;
    let pendingTickets = 0;
    let expiredTickets = 0;
    
    allTicketsSnapshot.forEach((doc) => {
      const data = doc.data();
      switch (data.status) {
        case 'confirmed':
          confirmedTickets++;
          break;
        case 'pending':
          pendingTickets++;
          break;
        case 'expired':
        case 'cancelled':
          expiredTickets++;
          break;
      }
    });
    
    return {
      totalReservations: allReservationsSnapshot.size,
      activeReservations,
      expiredReservations,
      totalTickets: allTicketsSnapshot.size,
      confirmedTickets,
      pendingTickets,
      expiredTickets
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de salud:', error);
    throw new Error('Error al obtener estadísticas de la base de datos');
  }
};

