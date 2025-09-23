import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MovieCard } from '@/components/MovieCard';
import { useAuth } from '@/src/contexts/AuthContext';
import { Movie, getMoviesByCategory, addParaNormanMovie, addBTSMovie } from '@/src/services/moviesService';
import { logoutUser } from '@/src/services/authService';
import { router } from 'expo-router';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';

export default function MoviesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const statusBarColor = '#051135ff'; // Azul muy oscuro para status bar (detalles del teléfono)
  const headerColor = '#2f64baff'; // Azul más claro para header (separación visual)
  const insets = useSafeAreaInsets();

  const tabs = ['En Cartelera', 'Próximos Estrenos', 'BTS Week'];
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user, userProfile } = useAuth();

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      let category: 'nowPlaying' | 'comingSoon' | 'btsWeek';
      
      switch (selectedTab) {
        case 0:
          category = 'nowPlaying';
          break;
        case 1:
          category = 'comingSoon';
          break;
        case 2:
          category = 'btsWeek';
          break;
        default:
          category = 'nowPlaying';
      }
      
      const moviesData = await getMoviesByCategory(category);
      setMovies(moviesData);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Agregar ParaNorman si estamos en la pestaña de Próximos Estrenos
    if (selectedTab === 1) {
      try {
        await addParaNormanMovie();
        console.log('ParaNorman agregada exitosamente');
      } catch (error) {
        console.log('ParaNorman ya existe o error al agregar:', error);
      }
    }
    
    // Agregar película BTS si estamos en la pestaña BTS Week
    if (selectedTab === 2) {
      try {
        await addBTSMovie();
        console.log('BTS Movie agregada exitosamente');
      } catch (error) {
        console.log('BTS Movie ya existe o error al agregar:', error);
      }
    }
    
    await loadMovies();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getUserInitials = () => {
    if (userProfile) {
      return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <ProtectedRoute>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={statusBarColor}
        translucent={false}
      />
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        {/* Status Bar Simulation */}
        <View style={[styles.statusBar, { backgroundColor: statusBarColor }]} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <ThemedText style={styles.headerTitle}>Películas</ThemedText>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton}>
            <IconSymbol name="magnifyingglass" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
            <ThemedText style={styles.profileText}>{getUserInitials()}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpButton}>
            <IconSymbol name="questionmark.circle" size={18} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              selectedTab === index && styles.activeTab
            ]}
            onPress={() => setSelectedTab(index)}
          >
            <ThemedText 
              style={[
                styles.tabText,
                { color: selectedTab === index ? '#E53E3E' : '#666666' } // Rojo más intenso para tab activo
              ]}
            >
              {tab}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <IconSymbol name="mappin" size={24} color="#666666" />
          <ThemedText style={[styles.filterText, { color: '#666666' }]}>
            Ciudad
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <IconSymbol name="calendar" size={24} color="#666666" />
          <ThemedText style={[styles.filterText, { color: '#666666' }]}>
            Fecha
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.filterButton, { borderRightWidth: 0 }]}>
          <IconSymbol name="ellipsis" size={24} color="#666666" />
          <ThemedText style={[styles.filterText, { color: '#666666' }]}>
            Opciones
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Movies List */}
      <ScrollView 
        style={styles.moviesContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#E53E3E']}
            tintColor="#E53E3E"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53E3E" />
            <ThemedText style={[styles.loadingText, { color: textColor }]}>
              Cargando películas...
            </ThemedText>
          </View>
        ) : movies.length > 0 ? (
          <View style={styles.moviesList}>
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPress={() => {
                  router.push(`/movie-details?id=${movie.id}`);
                }}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="film" size={48} color="#999" style={{ marginBottom: 16 }} />
            <ThemedText style={[styles.emptyText, { color: textColor, fontSize: 18, fontWeight: '600', marginBottom: 8 }]}>
              No hay películas disponibles
            </ThemedText>
            <ThemedText style={[styles.emptySubText, { color: textColor, opacity: 0.7, textAlign: 'center' }]}>
              {selectedTab === 0 ? 'No hay películas en cartelera en este momento' :
               selectedTab === 1 ? 'No hay próximos estrenos programados' :
               'No hay películas BTS Week disponibles'}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation - Navegación principal de la app */}
      <View style={[
        styles.bottomNav, 
        { 
          backgroundColor,
          paddingBottom: Math.max(insets.bottom, 12), // Margen seguro adaptable
        }
      ]}>
        <TouchableOpacity style={styles.navItem}>
          <IconSymbol name="house" size={24} color="#999" />
          <ThemedText style={styles.navText}>Inicio</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <IconSymbol name="play.rectangle" size={24} color="#2563EB" />
          <ThemedText style={[styles.navText, { color: "#2563EB", fontWeight: '600' }]}>Películas</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <IconSymbol name="building.2" size={24} color="#999" />
          <ThemedText style={styles.navText}>Cines</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <IconSymbol name="bag" size={24} color="#999" />
          <ThemedText style={styles.navText}>Dulcería</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <IconSymbol name="ellipsis" size={24} color="#999" />
          <ThemedText style={styles.navText}>Más</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: 35, // Ajustar altura
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10, // Ajustar padding
    paddingTop: 10, // Ajustar padding top
  },
  headerTitle: {
    fontSize: 20, // Aumentar ligeramente
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'left',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Reducir gap
  },
  headerIconButton: {
    width: 36, // Reducir tamaño
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E3A8A', // Azul oscuro para contraste con header más claro
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF', // Círculo blanco más pequeño
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11, // Reducir para que se vea bien en círculo más pequeño
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16, // Reducir padding
    paddingVertical: 8, // Reducir padding
    backgroundColor: '#FFFFFF',
  },
  tab: {
    marginRight: 24, // Reducir margen
    paddingBottom: 6, // Reducir padding
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#E53E3E',
  },
  tabText: {
    fontSize: 14, // Reducir tamaño
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    height: 70,
  },
  filterText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  moviesContainer: {
    flex: 1,
  },
  moviesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    color: '#999',
    paddingHorizontal: 32,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minWidth: 60,
  },
  navText: {
    fontSize: 11,
    marginTop: 4,
    color: '#999',
    fontWeight: '400',
    textAlign: 'center',
  },
});
