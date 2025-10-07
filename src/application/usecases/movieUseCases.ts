import { Movie } from '../../domain/entities';
import { IMovieRepository } from '../../domain/repositories';

export class GetMoviesUseCase {
  constructor(private movieRepository: IMovieRepository) {}

  async execute(category?: 'cartelera' | 'estreno' | 'proximamente'): Promise<Movie[]> {
    if (category) {
      return await this.movieRepository.getByCategory(category);
    }
    return await this.movieRepository.getAll();
  }
}

export class GetMovieByIdUseCase {
  constructor(private movieRepository: IMovieRepository) {}

  async execute(id: string): Promise<Movie | null> {
    if (!id) {
      throw new Error('Movie ID is required');
    }
    return await this.movieRepository.getById(id);
  }
}