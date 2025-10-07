// Adapter layer to maintain compatibility with existing code
import { Movie as DomainMovie } from '../domain/entities';
import { getMovieByIdUseCase, getMoviesUseCase } from '../config/dependencies';

// Legacy types for backward compatibility
export interface Movie {
  id?: string;
  title: string;
  description: string;
  posterUrl: string;
  trailerUrl?: string;
  duration: number;
  genre: string[];
  director: string;
  cast: string[];
  rating: string;
  language: string;
  subtitle?: string;
  releaseDate?: Date;
  isActive?: boolean;
}

// Legacy service functions that delegate to use cases
export async function getMovieById(id: string): Promise<Movie | null> {
  try {
    const domainMovie = await getMovieByIdUseCase.execute(id);
    if (!domainMovie) return null;
    
    // Convert domain entity to legacy format
    return {
      id: domainMovie.id,
      title: domainMovie.title,
      description: domainMovie.description,
      posterUrl: domainMovie.posterUrl,
      trailerUrl: domainMovie.trailerUrl,
      duration: domainMovie.duration,
      genre: domainMovie.genre,
      director: domainMovie.director,
      cast: domainMovie.cast,
      rating: domainMovie.rating,
      language: domainMovie.language,
      subtitle: domainMovie.subtitle,
      releaseDate: domainMovie.releaseDate,
      isActive: domainMovie.isActive
    };
  } catch (error) {
    console.error('Error in getMovieById adapter:', error);
    throw error;
  }
}

export async function getMovies(): Promise<Movie[]> {
  try {
    const domainMovies = await getMoviesUseCase.execute();
    
    // Convert domain entities to legacy format
    return domainMovies.map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.description,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl,
      duration: movie.duration,
      genre: movie.genre,
      director: movie.director,
      cast: movie.cast,
      rating: movie.rating,
      language: movie.language,
      subtitle: movie.subtitle,
      releaseDate: movie.releaseDate,
      isActive: movie.isActive
    }));
  } catch (error) {
    console.error('Error in getMovies adapter:', error);
    throw error;
  }
}

export async function getMoviesByCategory(category: 'cartelera' | 'estreno' | 'proximamente'): Promise<Movie[]> {
  try {
    const domainMovies = await getMoviesUseCase.execute(category);
    
    // Convert domain entities to legacy format
    return domainMovies.map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.description,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl,
      duration: movie.duration,
      genre: movie.genre,
      director: movie.director,
      cast: movie.cast,
      rating: movie.rating,
      language: movie.language,
      subtitle: movie.subtitle,
      releaseDate: movie.releaseDate,
      isActive: movie.isActive
    }));
  } catch (error) {
    console.error('Error in getMoviesByCategory adapter:', error);
    throw error;
  }
}