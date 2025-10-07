export interface Movie {
  id?: string;
  title: string;
  description: string;
  posterUrl: string;
  trailerUrl?: string;
  duration: number; // en minutos
  genre: string[];
  director: string;
  cast: string[];
  rating: string; // PG, PG-13, R, etc.
  language: string;
  subtitle?: string;
  releaseDate: Date;
  isActive: boolean;
  category: 'cartelera' | 'estreno' | 'proximamente';
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  amenities: string[];
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Showtime {
  id: string;
  time: string;
  price: number;
  cinemaId: string;
  movieId: string;
  date: string;
  format: '2D' | '3D' | 'IMAX' | '4DX';
  language: 'DOBLADA' | 'SUBTITULADA';
  quality: 'REGULAR' | 'PRIME' | 'VIP';
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  isOccupied: boolean;
  isWheelchair: boolean;
  isSelected: boolean;
  cinemaId: string;
  showtimeId: string;
}

export interface TicketPurchase {
  id?: string;
  userId: string;
  movieId: string;
  showtimeId: string;
  cinemaId: string;
  seats: string[];
  totalPrice: number;
  purchaseDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: Date;
  preferences: {
    favoriteGenres: string[];
    preferredLanguage: 'DOBLADA' | 'SUBTITULADA';
    preferredCinemas: string[];
  };
}