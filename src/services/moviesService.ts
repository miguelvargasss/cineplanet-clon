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
        console.log(`Movie not found in ${collectionName}, trying next collection...`);
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
    console.error('Error getting movies by category:', error);
    
    // En caso de error, devolver array vacío 
    console.log('Returning empty array due to Firebase error');
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
    console.log(`Movie added to ${collectionName} with ID: ${docRef.id}`);
    
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
    console.log(`Agregando película de muestra a la categoría: ${category}`);
    
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

// Función para agregar RE: ParaNorman a Próximos Estrenos
export const addParaNormanMovie = async (): Promise<void> => {
  try {
    console.log('Agregando película "RE: ParaNorman" a Próximos Estrenos...');
    
    const paraNormanMovie = {
      title: 'RE: ParaNorman',
      description: 'ParaNorman: Una historia de fantasmas, brujas y una maldición vuelve a los cines este Halloween: ¡más grande, más audaz y más aterradora que nunca! De los creadores de Coraline, este clásico favorito de los fanáticos regresa en una espectacular remasterización en formatos 3D y 2D, acompañado por un nuevo cortometraje animado, The Thrifting, con Anna Kendrick como Courtney y la presentación de un nuevo personaje en la voz de Finn Wolfhard.',
      genre: ['Familiar', 'Animación', 'Terror'],
      duration: 104, // 1h 44min
      releaseDate: new Date('2025-10-31'), // Halloween 2025
      posterUrl: 'https://th.bing.com/th/id/R.e5ac7db6233f64ff1a5590c066c81842?rik=Tuauz4tmThgRoQ&pid=ImgRaw&r=0',
      director: 'Chris Butler, Sam Fell',
      cast: ['Kodi Smit-McPhee', 'Anna Kendrick', 'Christopher Mintz-Plasse', 'Tucker Albrizzi'],
      rating: 'APT',
      language: 'Doblada',
      subtitle: 'Subtítulos en español',
    };

    await addSingleMovie(paraNormanMovie, 'comingSoon');
    console.log('Película "RE: ParaNorman" agregada exitosamente a Próximos Estrenos');
    
  } catch (error) {
    console.error('Error agregando película "RE: ParaNorman":', error);
    throw error;
  }
};

// Función para agregar BTS 2016 HYYH On Stage: Epilogue Remastered a BTS Week
export const addBTSMovie = async (): Promise<void> => {
  try {
    console.log('Agregando película "BTS 2016 HYYH On Stage: Epilogue Remastered" a BTS Week...');
    
    const btsMovie = {
      title: 'BTS 2016 HYYH On Stage: Epilogue Remastered',
      description: '#1 BTS 2016 Live The Most Beautiful Moment in Life On Stage: Epilogue Remastered. El gran final de la serie "The Most Beautiful Moment in Life" de BTS, donde la historia de la juventud brilla con más fuerza: <BTS 2016 Live The Most Beautiful Moment in Life On Stage: Epilogue Remastered>. Desde la emotividad de "Autumn Leaves" y "Butterfly" hasta las explosivas actuaciones de "FIRE", "Save ME" y "EPILOGUE: Young Forever", ¡la historia de la juventud que definió a BTS tal y como lo conocemos hoy, cobra vida en la pantalla!',
      genre: ['Concierto', 'Musical', 'K-Pop'],
      duration: 103, // 1h 43min
      releaseDate: new Date('2025-11-15'), // Noviembre 2025
      posterUrl: 'https://tse2.mm.bing.net/th/id/OIP.K3c-fFemrJrS5d1n5gzWIwHaNL?rs=1&pid=ImgDetMain&o=7&rm=3',
      director: 'Big Hit Entertainment',
      cast: ['RM', 'Jin', 'Suga', 'J-Hope', 'Jimin', 'V', 'Jungkook'],
      rating: '+14',
      language: 'Subtitulada',
      subtitle: 'Subtítulos en español',
    };

    await addSingleMovie(btsMovie, 'btsWeek');
    console.log('Película "BTS 2016 HYYH On Stage: Epilogue Remastered" agregada exitosamente a BTS Week');
    
  } catch (error) {
    console.error('Error agregando película "BTS 2016 HYYH On Stage: Epilogue Remastered":', error);
    throw error;
  }
};