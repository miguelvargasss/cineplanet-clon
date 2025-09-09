// 🔧 UTILIDADES GENERALES DE LA APLICACIÓN CINEPLANET

// Validaciones
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateDNI = (dni: string): boolean => {
  return /^\d{8}$/.test(dni);
};

export const validatePhone = (phone: string): boolean => {
  return /^9\d{8}$/.test(phone);
};

export const validatePassword = (password: string): boolean => {
  // Al menos 6 caracteres, una mayúscula, una minúscula y un número
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/.test(password);
};

// Formateo de datos
export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
};

export const formatCurrency = (amount: number): string => {
  return `S/ ${amount.toFixed(2)}`;
};

// Transformaciones de texto
export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const generateMemberNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CP${timestamp.slice(-6)}${random}`;
};

// Helpers para fechas
export const isToday = (date: string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

export const isFutureDate = (date: string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate > today;
};

// Helpers para colores
export const getColorForRating = (rating: string): string => {
  switch (rating) {
    case 'G': return '#4CAF50'; // Verde
    case 'PG': return '#FF9800'; // Naranja
    case 'PG-13': return '#FF5722'; // Rojo claro
    case 'R': return '#F44336'; // Rojo
    default: return '#757575'; // Gris
  }
};

// Debounce function para búsquedas
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// Storage helpers (usando AsyncStorage como alternativa más simple)
export const storage = {
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      // Implementación básica - podrías usar AsyncStorage o SecureStore
      console.log(`Setting ${key}:`, value);
      // await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },
  
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      // Implementación básica - podrías usar AsyncStorage o SecureStore
      console.log(`Getting ${key}`);
      // const value = await AsyncStorage.getItem(key);
      // return value ? JSON.parse(value) : null;
      return null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      // Implementación básica - podrías usar AsyncStorage o SecureStore
      console.log(`Removing ${key}`);
      // await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }
};
