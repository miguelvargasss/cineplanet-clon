// Dependency Injection Container
import { FirebaseMovieRepository } from '../infrastructure/repositories/FirebaseMovieRepository';
import { FirebaseSeatRepository } from '../infrastructure/repositories/FirebaseSeatRepository';
import { GetMoviesUseCase, GetMovieByIdUseCase } from '../application/usecases/movieUseCases';
import { GetSeatsByCinemaAndShowtimeUseCase, ReserveSeatsUseCase, ReleaseSeatsUseCase } from '../application/usecases/seatUseCases';
import { CreateTicketPurchaseUseCase, GetUserTicketsUseCase, CancelTicketUseCase } from '../application/usecases/ticketUseCases';

// Repositories
export const movieRepository = new FirebaseMovieRepository();
export const seatRepository = new FirebaseSeatRepository();
// TODO: Add other repositories when implemented
// export const ticketRepository = new FirebaseTicketRepository();
// export const cinemaRepository = new FirebaseCinemaRepository();
// export const userRepository = new FirebaseUserRepository();

// Use Cases
export const getMoviesUseCase = new GetMoviesUseCase(movieRepository);
export const getMovieByIdUseCase = new GetMovieByIdUseCase(movieRepository);
export const getSeatsByCinemaAndShowtimeUseCase = new GetSeatsByCinemaAndShowtimeUseCase(seatRepository);
export const reserveSeatsUseCase = new ReserveSeatsUseCase(seatRepository);
export const releaseSeatsUseCase = new ReleaseSeatsUseCase(seatRepository);

// TODO: Add ticket use cases when ticket repository is implemented
// export const createTicketPurchaseUseCase = new CreateTicketPurchaseUseCase(ticketRepository, seatRepository);
// export const getUserTicketsUseCase = new GetUserTicketsUseCase(ticketRepository);
// export const cancelTicketUseCase = new CancelTicketUseCase(ticketRepository, seatRepository);