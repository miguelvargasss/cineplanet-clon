import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Movie } from '../../domain/entities';
import { IMovieRepository } from '../../domain/repositories';

export class FirebaseMovieRepository implements IMovieRepository {
  private collectionName = 'movies';

  async getAll(): Promise<Movie[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Movie));
    } catch (error) {
      console.error('Error getting movies:', error);
      throw new Error('Failed to fetch movies');
    }
  }

  async getById(id: string): Promise<Movie | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Movie;
      }
      return null;
    } catch (error) {
      console.error('Error getting movie by ID:', error);
      throw new Error('Failed to fetch movie');
    }
  }

  async getByCategory(category: 'cartelera' | 'estreno' | 'proximamente'): Promise<Movie[]> {
    try {
      const collectionRef = category === 'cartelera' ? 'movies' : 
                          category === 'estreno' ? 'moviesEstreno' : 'moviesBts';
      
      const querySnapshot = await getDocs(collection(db, collectionRef));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Movie));
    } catch (error) {
      console.error('Error getting movies by category:', error);
      throw new Error('Failed to fetch movies by category');
    }
  }

  async create(movie: Movie): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), movie);
      return docRef.id;
    } catch (error) {
      console.error('Error creating movie:', error);
      throw new Error('Failed to create movie');
    }
  }

  async update(id: string, movie: Partial<Movie>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, movie);
    } catch (error) {
      console.error('Error updating movie:', error);
      throw new Error('Failed to update movie');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting movie:', error);
      throw new Error('Failed to delete movie');
    }
  }
}