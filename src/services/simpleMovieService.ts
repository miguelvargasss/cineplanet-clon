import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Función simplificada para agregar película directamente a Firebase
export const addMovieDirectly = async (movieData: any, category: 'movies' | 'moviesEstreno' = 'movies') => {
  try {
    console.log(`🎬 Agregando película: ${movieData.title} a ${category}`);
    
    const movieDoc = {
      ...movieData,
      releaseDate: Timestamp.fromDate(new Date(movieData.releaseDate)),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      isNowPlaying: category === 'movies',
      isComingSoon: category === 'moviesEstreno',
      isBTSWeek: false
    };
    
    const docRef = await addDoc(collection(db, category), movieDoc);
    console.log(`✅ Película agregada exitosamente con ID: ${docRef.id}`);
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Error agregando película:', error);
    throw error;
  }
};

// Función para verificar si una película ya existe
export const movieExists = async (title: string, category: 'movies' | 'moviesEstreno' = 'movies') => {
  try {
    const snapshot = await getDocs(collection(db, category));
    return snapshot.docs.some(doc => doc.data().title === title);
  } catch (error) {
    console.error('Error verificando película:', error);
    return false;
  }
};

// Función simplificada para agregar película solo si no existe
export const addMovieIfNotExists = async (movieData: any, category: 'movies' | 'moviesEstreno' = 'movies') => {
  try {
    const exists = await movieExists(movieData.title, category);
    
    if (exists) {
      console.log(`⚠️ La película "${movieData.title}" ya existe en ${category}`);
      return null;
    }
    
    return await addMovieDirectly(movieData, category);
  } catch (error) {
    console.error('Error en addMovieIfNotExists:', error);
    throw error;
  }
};