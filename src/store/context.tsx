// 🗃️ GESTIÓN DE ESTADO GLOBAL CON CONTEXT API
// Alternativa ligera a Redux para el estado de la aplicación

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User } from '../types';

// Estados de la aplicación
interface AppState {
  // Estado de autenticación
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
  };
  
  // Estado de películas
  movies: {
    currentMovies: any[];
    selectedMovie: any | null;
    isLoading: boolean;
  };
  
  // Estado de UI
  ui: {
    theme: 'light' | 'dark';
    activeTab: string;
    isModalOpen: boolean;
  };
}

// Acciones disponibles
type AppAction =
  // Acciones de autenticación
  | { type: 'AUTH_START_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  
  // Acciones de películas
  | { type: 'MOVIES_START_LOADING' }
  | { type: 'MOVIES_SET_LIST'; payload: any[] }
  | { type: 'MOVIES_SET_SELECTED'; payload: any }
  
  // Acciones de UI
  | { type: 'UI_SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'UI_SET_ACTIVE_TAB'; payload: string }
  | { type: 'UI_TOGGLE_MODAL'; payload: boolean };

// Estado inicial
const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    isLoading: false,
  },
  movies: {
    currentMovies: [],
    selectedMovie: null,
    isLoading: false,
  },
  ui: {
    theme: 'light',
    activeTab: 'home',
    isModalOpen: false,
  },
};

// Reducer principal
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Auth actions
    case 'AUTH_START_LOADING':
      return {
        ...state,
        auth: { ...state.auth, isLoading: true },
      };
      
    case 'AUTH_SUCCESS':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload.user,
          isLoading: false,
        },
      };
      
    case 'AUTH_FAILURE':
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
          isLoading: false,
        },
      };
      
    case 'AUTH_LOGOUT':
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
          isLoading: false,
        },
      };
      
    // Movies actions
    case 'MOVIES_START_LOADING':
      return {
        ...state,
        movies: { ...state.movies, isLoading: true },
      };
      
    case 'MOVIES_SET_LIST':
      return {
        ...state,
        movies: {
          ...state.movies,
          currentMovies: action.payload,
          isLoading: false,
        },
      };
      
    case 'MOVIES_SET_SELECTED':
      return {
        ...state,
        movies: { ...state.movies, selectedMovie: action.payload },
      };
      
    // UI actions
    case 'UI_SET_THEME':
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload },
      };
      
    case 'UI_SET_ACTIVE_TAB':
      return {
        ...state,
        ui: { ...state.ui, activeTab: action.payload },
      };
      
    case 'UI_TOGGLE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, isModalOpen: action.payload },
      };
      
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook para usar el context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de AppProvider');
  }
  return context;
}

// Hooks específicos para diferentes partes del estado
export function useAuth() {
  const { state, dispatch } = useAppContext();
  
  return {
    ...state.auth,
    login: (user: User, token: string) => 
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } }),
    logout: () => dispatch({ type: 'AUTH_LOGOUT' }),
    startLoading: () => dispatch({ type: 'AUTH_START_LOADING' }),
  };
}

export function useMovies() {
  const { state, dispatch } = useAppContext();
  
  return {
    ...state.movies,
    setMovies: (movies: any[]) => 
      dispatch({ type: 'MOVIES_SET_LIST', payload: movies }),
    setSelectedMovie: (movie: any) => 
      dispatch({ type: 'MOVIES_SET_SELECTED', payload: movie }),
    startLoading: () => dispatch({ type: 'MOVIES_START_LOADING' }),
  };
}

export function useUI() {
  const { state, dispatch } = useAppContext();
  
  return {
    ...state.ui,
    setTheme: (theme: 'light' | 'dark') => 
      dispatch({ type: 'UI_SET_THEME', payload: theme }),
    setActiveTab: (tab: string) => 
      dispatch({ type: 'UI_SET_ACTIVE_TAB', payload: tab }),
    toggleModal: (isOpen: boolean) => 
      dispatch({ type: 'UI_TOGGLE_MODAL', payload: isOpen }),
  };
}
