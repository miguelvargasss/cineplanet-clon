import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MovieSchedule } from '../types';

export interface Movie {
  id?: string;
  title: string;
  description: string;
  genre: string[];
  duration: number; // en minutos
  releaseDate: Date;
  posterUrl: string;
  trailerUrl?: string;
  director: string;
  cast: string[];
  rating: string; // PG, PG-13, R, etc.
  language: string;
  subtitle?: string;
  isNowPlaying: boolean;
  isComingSoon: boolean;
  isBTSWeek?: boolean;
  schedules?: MovieSchedule[]; // Horarios por cine
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieInput {
  title: string;
  description: string;
  genre: string[];
  duration: number;
  releaseDate: Date;
  posterUrl: string; // URL externa de la imagen
  director: string;
  cast: string[];
  rating: string;
  language: string;
  subtitle?: string;
  isNowPlaying?: boolean; // Opcional, se maneja por colecciones
  isComingSoon?: boolean; // Opcional, se maneja por colecciones
  isBTSWeek?: boolean; // Opcional, se maneja por colecciones
  trailerUrl?: string;
}

// Obtener una película específica por ID
export const getMovieById = async (movieId: string): Promise<Movie | null> => {
  try {
    // Buscar en todas las colecciones de películas
    const collections = ['movies', 'moviesEstreno', 'moviesBts'];
    
    for (const collectionName of collections) {
      try {
        const movieRef = doc(db, collectionName, movieId);
        const movieSnap = await getDoc(movieRef);
        
        if (movieSnap.exists()) {
          const data = movieSnap.data();
          return {
            id: movieSnap.id,
            ...data,
            releaseDate: data.releaseDate.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          } as Movie;
        }
      } catch {
        // Continuar buscando en la siguiente colección si hay error
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting movie by ID:', error);
    throw error;
  }
};

// Obtener todas las películas
export const getAllMovies = async (): Promise<Movie[]> => {
  try {
    const moviesRef = collection(db, 'movies');
    const q = query(moviesRef, orderBy('releaseDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const movies: Movie[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      movies.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error('Error getting movies:', error);
    throw error;
  }
};

// Obtener películas por categoría usando colecciones separadas
export const getMoviesByCategory = async (category: 'nowPlaying' | 'comingSoon' | 'btsWeek'): Promise<Movie[]> => {
  try {
    let collectionName: string;
    
    // Mapear categoría a nombre de colección
    switch (category) {
      case 'nowPlaying':
        collectionName = 'movies';
        break;
      case 'comingSoon':
        collectionName = 'moviesEstreno';
        break;
      case 'btsWeek':
        collectionName = 'moviesBts';
        break;
      default:
        collectionName = 'movies';
    }
    
    const moviesRef = collection(db, collectionName);
    // Cambiar orden: usar createdAt ascendente para que las nuevas películas aparezcan al final
    const q = query(moviesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const movies: Movie[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      movies.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error('Error getting movies by category:', error);
    return [];
  }
};

// Agregar película a una colección específica
export const addMovieToCategory = async (movieData: MovieInput, category: 'nowPlaying' | 'comingSoon' | 'btsWeek'): Promise<string> => {
  try {
    let collectionName: string;
    
    switch (category) {
      case 'nowPlaying':
        collectionName = 'movies';
        break;
      case 'comingSoon':
        collectionName = 'moviesEstreno';
        break;
      case 'btsWeek':
        collectionName = 'moviesBts';
        break;
      default:
        collectionName = 'movies';
    }
    
    const now = new Date();
    const movieDoc = {
      ...movieData,
      // Establecer campos booleanos según la categoría
      isNowPlaying: category === 'nowPlaying',
      isComingSoon: category === 'comingSoon',
      isBTSWeek: category === 'btsWeek',
      releaseDate: Timestamp.fromDate(movieData.releaseDate),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };
    
    // Agregar película a la colección específica
    const docRef = await addDoc(collection(db, collectionName), movieDoc);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding movie to category:', error);
    throw error;
  }
};

// Función legacy para compatibilidad (usa colección 'movies' por defecto)
export const addMovie = async (movieData: MovieInput): Promise<string> => {
  return addMovieToCategory(movieData, 'nowPlaying');
};

// Actualizar película
export const updateMovie = async (movieId: string, movieData: Partial<MovieInput>): Promise<void> => {
  try {
    const movieRef = doc(db, 'movies', movieId);
    const updateData: any = {
      ...movieData,
      updatedAt: Timestamp.fromDate(new Date()),
    };
    
    if (movieData.releaseDate) {
      updateData.releaseDate = Timestamp.fromDate(movieData.releaseDate);
    }
    
    await updateDoc(movieRef, updateData);
  } catch (error) {
    console.error('Error updating movie:', error);
    throw error;
  }
};

// Eliminar película
export const deleteMovie = async (movieId: string): Promise<void> => {
  try {
    // Eliminar documento de Firestore
    const movieRef = doc(db, 'movies', movieId);
    await deleteDoc(movieRef);
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw error;
  }
};

// Función para enviar una película específica a Firebase
export const addSingleMovie = async (movieData: MovieInput, category: 'nowPlaying' | 'comingSoon' | 'btsWeek'): Promise<string> => {
  try {
    const movieId = await addMovieToCategory(movieData, category);
    return movieId;
  } catch (error) {
    console.error(`Error agregando película "${movieData.title}":`, error);
    throw error;
  }
};

// Función helper para poblar base de datos con película específica por categoría
export const seedSampleMovies = async (category: 'nowPlaying' | 'comingSoon' | 'btsWeek' = 'nowPlaying'): Promise<void> => {
  try {
    // Solo agregar si específicamente se solicita
    const caminaOMuereMovie = {
      title: 'Camina o Muere',
      description: 'De la esperada adaptación de la primera novela escrita por el maestro del suspenso Stephen King, y bajo la dirección de Francis Lawrence —la mente detrás de las impactantes películas de Los Juegos del Hambre (En llamas, Sinsajo partes 1 y 2, y La balada de los pájaros cantores y serpientes)— llega THE LONG WALK, un thriller intenso, estremecedor y profundamente emocional. Una historia que no solo pondrá a prueba los límites de sus protagonistas, sino también los del espectador, con una pregunta inquietante: ¿Hasta dónde serías capaz de llegar?',
      genre: ['Acción', 'Thriller', 'Drama'],
      duration: 110, // 1h 50min
      releaseDate: new Date('2025-09-22'),
      posterUrl: 'https://tse4.mm.bing.net/th/id/OIP.XkIm4a4l96EnTrOy-cn5CgHaJQ?rs=1&pid=ImgDetMain&o=7&rm=3',
      director: 'Francis Lawrence',
      cast: ['Reparto por confirmar'],
      rating: '+14 DNI',
      language: 'Subtitulada',
      subtitle: 'Subtítulos en español',
    };

    await addSingleMovie(caminaOMuereMovie, category);
    
  } catch (error) {
    console.error('Error agregando película "Camina o Muere":', error);
    throw error;
  }
};

// Función para verificar y agregar películas automáticamente
export const ensureMoviesExist = async (): Promise<void> => {
  try {
    // Verificar si hay películas en "En Cartelera"
    const moviesRef = collection(db, 'movies');
    const moviesSnapshot = await getDocs(moviesRef);
    
    // Si hay menos de 2 películas, agregar las películas básicas
    if (moviesSnapshot.size < 2) {
      // Agregar Avatar si no existe
      const avatarMovie = {
        title: "AVATAR: EL CAMINO DEL AGUA [2022]",
        description: "Jake Sully vive con su nueva familia formada en el planeta de Pandora. Cuando una familiar amenaza regresa para acabar lo que empezó anteriormente, Jake debe trabajar con Neytiri y el ejército de la raza Na'vi para proteger su planeta.",
        genre: ["Aventura", "Ciencia Ficción", "Acción"],
        duration: 192,
        releaseDate: "2022-12-16",
        posterUrl: "https://lumiere-a.akamaihd.net/v1/images/b162385cffbbe656f1e654b80098ac57_3276x4096_380354b0.jpeg?region=0,0,3276,4096",
        director: "James Cameron",
        cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver", "Stephen Lang", "Kate Winslet"],
        rating: "+14",
        language: "Inglés",
        subtitle: "Subtítulos en español",
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        schedules: [
          {
            cinemaId: "cineplanet-san-miguel",
            showtimes: ["19:30", "21:45", "22:10"]
          },
          {
            cinemaId: "cineplanet-centro-civico", 
            showtimes: ["19:30", "21:45", "22:10"]
          },
          {
            cinemaId: "cineplanet-alcazar",
            showtimes: ["19:30", "21:45", "22:10"]
          }
        ]
      };
      
      // Agregar Crónicas de Exorcismo si no existe
      const cronicasMovie = {
        title: "CRÓNICAS DE EXORCISMO: EL COMIENZO",
        description: "El padre Park es un médico convertido en sacerdote que fue excomulgado por realizar exorcismos para una iglesia que negaba la existencia de males sobrenaturales. Cuando su viejo amigo, un monje de un templo secreto y lleno de magia, lo llama para proteger a un niño ingenuo, pero poderoso, de su malvado maestro, el padre Park deberá enfrentarse a su pasado.",
        genre: ["Animación"],
        duration: 85,
        releaseDate: "2024-01-15",
        posterUrl: "https://cinesunidosweb.blob.core.windows.net/poster/HO00005608.jpg",
        director: "No especificado",
        cast: [],
        rating: "+14",
        language: "DOBLADA",
        subtitle: "Subtítulos en español",
        trailerUrl: "https://www.youtube.com/watch?v=example",
        schedules: [
          {
            cinemaId: "cineplanet-san-miguel",
            showtimes: ["17:20", "20:30"]
          },
          {
            cinemaId: "cineplanet-centro-civico", 
            showtimes: ["17:20", "20:30"]
          },
          {
            cinemaId: "cineplanet-alcazar",
            showtimes: ["17:20", "20:30"]
          }
        ]
      };
      
      await addMovieSimple(avatarMovie, 'movies');
      await addMovieSimple(cronicasMovie, 'movies');
    }
    
    // Verificar próximos estrenos
    const comingSoonRef = collection(db, 'moviesEstreno');
    const comingSoonSnapshot = await getDocs(comingSoonRef);
    
    if (comingSoonSnapshot.size === 0) {
      
      const chainsawMovie = {
        title: "CHAINSAW MAN: REZE ARC",
        description: "Denji continúa su vida como Chainsaw Man, pero nuevos demonios y amenazas aparecen. La llegada de Reze, una misteriosa chica con poderes explosivos, cambiará todo lo que creía conocer sobre su mundo.",
        genre: ["Animación", "Acción", "Sobrenatural"],
        duration: 120,
        releaseDate: "2024-03-15",
        posterUrl: "https://i.imgur.com/chainsaw-reze.jpg",
        director: "Ryu Nakayama",
        cast: ["Kikunosuke Toya", "Ai Fairouz", "Makima Hayashi"],
        rating: "+16",
        language: "Japonés",
        subtitle: "Subtítulos en español",
        trailerUrl: "https://www.youtube.com/watch?v=chainsaw-reze",
        schedules: [
          {
            cinemaId: "cineplanet-san-miguel",
            showtimes: ["16:00", "19:00", "22:00"]
          },
          {
            cinemaId: "cineplanet-centro-civico", 
            showtimes: ["15:30", "18:30", "21:30"]
          },
          {
            cinemaId: "cineplanet-alcazar",
            showtimes: ["17:00", "20:00", "23:00"]
          }
        ]
      };
      
      await addMovieSimple(chainsawMovie, 'moviesEstreno');
    }
    
  } catch (error) {
    console.error('❌ Error en ensureMoviesExist:', error);
    // No lanzar error para no afectar la carga de otras películas
  }
};

// 🚀 FUNCIÓN SIMPLIFICADA PARA AGREGAR PELÍCULAS
export const addMovieSimple = async (movieData: any, category: 'movies' | 'moviesEstreno' = 'movies'): Promise<string | null> => {
  try {
    // Verificar si ya existe
    const collectionRef = collection(db, category);
    const snapshot = await getDocs(collectionRef);
    const exists = snapshot.docs.some(doc => doc.data().title === movieData.title);
    
    if (exists) {
      return null;
    }
    
    // Preparar documento
    const movieDoc = {
      ...movieData,
      releaseDate: Timestamp.fromDate(new Date(movieData.releaseDate)),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      isNowPlaying: category === 'movies',
      isComingSoon: category === 'moviesEstreno',
      isBTSWeek: false
    };
    
    // Agregar a Firebase
    const docRef = await addDoc(collectionRef, movieDoc);
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Error agregando película:', error);
    throw error;
  }
};