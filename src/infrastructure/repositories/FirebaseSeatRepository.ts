import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Seat } from '../../domain/entities';
import { ISeatRepository } from '../../domain/repositories';

export class FirebaseSeatRepository implements ISeatRepository {
  private collectionName = 'seats';

  async getByCinemaAndShowtime(cinemaId: string, showtimeId: string): Promise<Seat[]> {
    try {
      // En un escenario real, esto sería una consulta a Firebase
      // Por ahora, generamos asientos dinámicamente para la demo
      return this.generateSeatsForShowtime(cinemaId, showtimeId);
    } catch (error) {
      console.error('Error getting seats:', error);
      throw new Error('Failed to fetch seats');
    }
  }

  async updateSeatStatus(seatId: string, isOccupied: boolean): Promise<void> {
    try {
      // En un escenario real, actualizaríamos el estado en Firebase
      console.log(`Updating seat ${seatId} to ${isOccupied ? 'occupied' : 'available'}`);
    } catch (error) {
      console.error('Error updating seat status:', error);
      throw new Error('Failed to update seat status');
    }
  }

  async reserveSeats(seatIds: string[], showtimeId: string): Promise<void> {
    try {
      // En un escenario real, marcaríamos los asientos como ocupados en Firebase
      console.log(`Reserving seats ${seatIds.join(', ')} for showtime ${showtimeId}`);
      
      // Simular posible error si algunos asientos ya están ocupados
      for (const seatId of seatIds) {
        await this.updateSeatStatus(seatId, true);
      }
    } catch (error) {
      console.error('Error reserving seats:', error);
      throw new Error('Failed to reserve seats');
    }
  }

  async releaseSeats(seatIds: string[], showtimeId: string): Promise<void> {
    try {
      // En un escenario real, marcaríamos los asientos como disponibles en Firebase
      console.log(`Releasing seats ${seatIds.join(', ')} for showtime ${showtimeId}`);
      
      for (const seatId of seatIds) {
        await this.updateSeatStatus(seatId, false);
      }
    } catch (error) {
      console.error('Error releasing seats:', error);
      throw new Error('Failed to release seats');
    }
  }

  private generateSeatsForShowtime(cinemaId: string, showtimeId: string): Seat[] {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
    const seatsPerRow = 15;
    const seats: Seat[] = [];

    rows.forEach((row) => {
      for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
        const seatId = `${row}${seatNumber}`;
        
        // Simular asientos ocupados aleatoriamente (30% ocupados)
        const isOccupied = Math.random() < 0.3;
        
        // Asientos para sillas de ruedas (posiciones específicas)
        const isWheelchair = (row === 'F' && seatNumber === 1) || 
                           (row === 'F' && seatNumber === 15) ||
                           (row === 'N' && seatNumber === 1) ||
                           (row === 'N' && seatNumber === 15);

        seats.push({
          id: seatId,
          row,
          number: seatNumber,
          isOccupied,
          isWheelchair,
          isSelected: false,
          cinemaId,
          showtimeId
        });
      }
    });

    return seats;
  }
}