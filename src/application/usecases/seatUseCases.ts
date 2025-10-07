import { Seat } from '../../domain/entities';
import { ISeatRepository } from '../../domain/repositories';

export class GetSeatsByCinemaAndShowtimeUseCase {
  constructor(private seatRepository: ISeatRepository) {}

  async execute(cinemaId: string, showtimeId: string): Promise<Seat[]> {
    if (!cinemaId || !showtimeId) {
      throw new Error('Cinema ID and Showtime ID are required');
    }
    return await this.seatRepository.getByCinemaAndShowtime(cinemaId, showtimeId);
  }
}

export class ReserveSeatsUseCase {
  constructor(private seatRepository: ISeatRepository) {}

  async execute(seatIds: string[], showtimeId: string): Promise<void> {
    if (!seatIds.length || !showtimeId) {
      throw new Error('Seat IDs and Showtime ID are required');
    }
    
    // Validar que los asientos estén disponibles
    const seats = await this.seatRepository.getByCinemaAndShowtime('', showtimeId);
    const requestedSeats = seats.filter(seat => seatIds.includes(seat.id));
    
    const occupiedSeats = requestedSeats.filter(seat => seat.isOccupied);
    if (occupiedSeats.length > 0) {
      throw new Error(`Some seats are already occupied: ${occupiedSeats.map(s => s.id).join(', ')}`);
    }
    
    await this.seatRepository.reserveSeats(seatIds, showtimeId);
  }
}

export class ReleaseSeatsUseCase {
  constructor(private seatRepository: ISeatRepository) {}

  async execute(seatIds: string[], showtimeId: string): Promise<void> {
    if (!seatIds.length || !showtimeId) {
      throw new Error('Seat IDs and Showtime ID are required');
    }
    await this.seatRepository.releaseSeats(seatIds, showtimeId);
  }
}