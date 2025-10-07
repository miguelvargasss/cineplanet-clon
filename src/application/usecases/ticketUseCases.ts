import { TicketPurchase } from '../../domain/entities';
import { ITicketRepository, ISeatRepository } from '../../domain/repositories';

export class CreateTicketPurchaseUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private seatRepository: ISeatRepository
  ) {}

  async execute(ticketData: Omit<TicketPurchase, 'id' | 'purchaseDate' | 'status'>): Promise<string> {
    // Validar datos requeridos
    if (!ticketData.userId || !ticketData.movieId || !ticketData.showtimeId || 
        !ticketData.seats.length || ticketData.totalPrice <= 0) {
      throw new Error('All ticket data is required');
    }

    // Crear el ticket con estado pendiente
    const ticket: TicketPurchase = {
      ...ticketData,
      purchaseDate: new Date(),
      status: 'pending'
    };

    try {
      // Reservar los asientos
      await this.seatRepository.reserveSeats(ticketData.seats, ticketData.showtimeId);
      
      // Crear el ticket
      const ticketId = await this.ticketRepository.create(ticket);
      
      // Confirmar el ticket
      await this.ticketRepository.updateStatus(ticketId, 'confirmed');
      
      return ticketId;
    } catch (error) {
      // Si algo falla, liberar los asientos
      await this.seatRepository.releaseSeats(ticketData.seats, ticketData.showtimeId);
      throw error;
    }
  }
}

export class GetUserTicketsUseCase {
  constructor(private ticketRepository: ITicketRepository) {}

  async execute(userId: string): Promise<TicketPurchase[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return await this.ticketRepository.getByUserId(userId);
  }
}

export class CancelTicketUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private seatRepository: ISeatRepository
  ) {}

  async execute(ticketId: string): Promise<void> {
    if (!ticketId) {
      throw new Error('Ticket ID is required');
    }

    const ticket = await this.ticketRepository.getById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status === 'cancelled') {
      throw new Error('Ticket is already cancelled');
    }

    // Liberar los asientos
    await this.seatRepository.releaseSeats(ticket.seats, ticket.showtimeId);
    
    // Cancelar el ticket
    await this.ticketRepository.cancel(ticketId);
  }
}