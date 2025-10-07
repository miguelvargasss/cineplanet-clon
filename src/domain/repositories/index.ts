import { Movie, Cinema, Showtime, Seat, TicketPurchase, User } from '../entities';

export interface IMovieRepository {
  getAll(): Promise<Movie[]>;
  getById(id: string): Promise<Movie | null>;
  getByCategory(category: 'cartelera' | 'estreno' | 'proximamente'): Promise<Movie[]>;
  create(movie: Movie): Promise<string>;
  update(id: string, movie: Partial<Movie>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ICinemaRepository {
  getAll(): Promise<Cinema[]>;
  getById(id: string): Promise<Cinema | null>;
  getByCity(city: string): Promise<Cinema[]>;
  create(cinema: Cinema): Promise<string>;
  update(id: string, cinema: Partial<Cinema>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IShowtimeRepository {
  getByMovieId(movieId: string): Promise<Showtime[]>;
  getByCinemaId(cinemaId: string): Promise<Showtime[]>;
  getByMovieAndCinema(movieId: string, cinemaId: string): Promise<Showtime[]>;
  getById(id: string): Promise<Showtime | null>;
  create(showtime: Showtime): Promise<string>;
  update(id: string, showtime: Partial<Showtime>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ISeatRepository {
  getByCinemaAndShowtime(cinemaId: string, showtimeId: string): Promise<Seat[]>;
  updateSeatStatus(seatId: string, isOccupied: boolean): Promise<void>;
  reserveSeats(seatIds: string[], showtimeId: string): Promise<void>;
  releaseSeats(seatIds: string[], showtimeId: string): Promise<void>;
}

export interface ITicketRepository {
  create(ticket: TicketPurchase): Promise<string>;
  getByUserId(userId: string): Promise<TicketPurchase[]>;
  getById(id: string): Promise<TicketPurchase | null>;
  updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<void>;
  cancel(id: string): Promise<void>;
}

export interface IUserRepository {
  create(user: User): Promise<string>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<void>;
  delete(id: string): Promise<void>;
}