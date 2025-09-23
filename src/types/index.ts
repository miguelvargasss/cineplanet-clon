// 🎭 TIPOS GLOBALES DE LA APLICACIÓN CINEPLANET

// Tipos de usuario y autenticación
export interface User {
  id: string;
  memberNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  documentType: 'DNI' | 'CE' | 'PASSPORT';
  documentNumber: string;
  phone: string;
  birthDate: string;
  gender: 'M' | 'F' | 'O';
  selectedCineplanet: string;
  acceptsTerms: boolean;
  acceptsPromotions: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Tipos de cines
export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Tipos de funciones
export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  date: string;
  time: string;
  format: '2D' | '3D' | 'IMAX' | 'VIP';
  language: 'ESP' | 'SUB' | 'DOB';
  availableSeats: number;
  totalSeats: number;
  price: number;
}

// Tipos de formularios
export interface LoginForm {
  memberNumber: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  password: string;
  confirmPassword: string;
  selectedCineplanet: string;
  acceptsTerms: boolean;
  acceptsPromotions: boolean;
}

// Tipos de API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Tipos de navegación (si necesitas tipado para las rutas)
export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'movies': undefined;
  '+not-found': undefined;
};

export type AuthStackParamList = {
  'login': undefined;
  'register': undefined;
};
