import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { Movie } from '../../services/moviesService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2; 
const CARD_HEIGHT = CARD_WIDTH * 1.5; 

interface MovieCardProps {
  movie: Movie;
  onPress?: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onPress }) => {
  const isRecentPremiere = () => {
    const now = new Date();
    const releaseDate = new Date(movie.releaseDate);
    const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    
    return releaseDate >= twoWeeksAgo && releaseDate <= now;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ThemedView style={styles.card}>
        {movie.posterUrl ? (
          <Image 
            source={{ uri: movie.posterUrl }}
            style={styles.posterImage}
            resizeMode="cover"
          />
        ) : (
          <ThemedView style={styles.placeholderContainer}>
            <ThemedText style={styles.placeholderText}>
              {movie.title}
            </ThemedText>
          </ThemedView>
        )}
        
        {isRecentPremiere() && (
          <ThemedView style={styles.premiereBadge}>
            <ThemedText style={styles.premiereText}>ESTRENO</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  posterImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  premiereBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E53E3E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiereText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});