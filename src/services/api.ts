// 🌐 SERVICIOS DE API PARA CINEPLANET

import { ApiResponse, User, Movie, Cinema, Showtime, LoginForm, RegisterForm } from '../types';

// Configuración base de la API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.cineplanet.pe';

// Helper para realizar peticiones HTTP
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: data,
        error: data.message || 'Error en la petición',
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      data: {} as T,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

// 🔐 SERVICIOS DE AUTENTICACIÓN
export const authService = {
  login: async (credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    // Simulación de login (reemplazar con API real)
    console.log('Login attempt:', credentials);
    
    // Simulación de respuesta exitosa
    const mockUser: User = {
      id: '1',
      memberNumber: credentials.memberNumber,
      email: 'usuario@example.com',
      firstName: 'Usuario',
      lastName: 'Demo',
      documentType: 'DNI',
      documentNumber: '12345678',
      phone: '987654321',
      birthDate: '1990-01-01',
      gender: 'M',
      selectedCineplanet: 'Cajamarca',
      acceptsTerms: true,
      acceptsPromotions: false,
    };

    return {
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
      },
    };
  },

  register: async (userData: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    // Simulación de registro (reemplazar con API real)
    console.log('Register attempt:', userData);
    
    return apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async (): Promise<ApiResponse<void>> => {
    // Simulación de logout
    return {
      success: true,
      data: undefined,
    };
  },

  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// 🎬 SERVICIOS DE PELÍCULAS
export const moviesService = {
  getMovies: async (filters?: {
    inTheaters?: boolean;
    comingSoon?: boolean;
    genre?: string;
  }): Promise<ApiResponse<Movie[]>> => {
    const queryParams = new URLSearchParams();
    if (filters?.inTheaters) queryParams.append('inTheaters', 'true');
    if (filters?.comingSoon) queryParams.append('comingSoon', 'true');
    if (filters?.genre) queryParams.append('genre', filters.genre);

    return apiRequest<Movie[]>(`/movies?${queryParams.toString()}`);
  },

  getMovieById: async (id: string): Promise<ApiResponse<Movie>> => {
    return apiRequest<Movie>(`/movies/${id}`);
  },

  getShowtimes: async (movieId: string, cinemaId?: string, date?: string): Promise<ApiResponse<Showtime[]>> => {
    const queryParams = new URLSearchParams();
    if (cinemaId) queryParams.append('cinemaId', cinemaId);
    if (date) queryParams.append('date', date);

    return apiRequest<Showtime[]>(`/movies/${movieId}/showtimes?${queryParams.toString()}`);
  },
};

// 🎭 SERVICIOS DE CINES
export const cinemasService = {
  getCinemas: async (city?: string): Promise<ApiResponse<Cinema[]>> => {
    const queryParams = city ? `?city=${city}` : '';
    return apiRequest<Cinema[]>(`/cinemas${queryParams}`);
  },

  getCinemaById: async (id: string): Promise<ApiResponse<Cinema>> => {
    return apiRequest<Cinema>(`/cinemas/${id}`);
  },
};

// 👤 SERVICIOS DE USUARIO
export const userService = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/user/profile');
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Mock data para desarrollo (eliminar cuando tengas API real)
export const mockData = {
  movies: [
    {
      id: '1',
      title: 'Avatar: El Camino del Agua',
      genre: 'Ciencia Ficción',
      duration: 192,
      rating: 'PG-13',
      poster: 'https://via.placeholder.com/300x450',
      synopsis: 'Jake Sully vive con su nueva familia en el planeta Pandora...',
      releaseDate: '2023-12-15',
      isInTheaters: true,
      isComingSoon: false,
    },
    // Agregar más películas mock aquí
  ] as Movie[],
  
  cinemas: [
    {
      id: '1',
      name: 'Cineplanet Cajamarca',
      address: 'Av. Hoyos Rubio 755',
      city: 'Cajamarca',
      coordinates: { latitude: -7.1639, longitude: -78.5005 },
    },
  ] as Cinema[],
};
