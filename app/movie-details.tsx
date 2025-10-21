import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Movie, getMovieById } from '@/src/services/moviesService';
import { useAuth } from '@/src/contexts/AuthContext';
import { MovieSchedule, Showtime } from '@/src/types';
import { getMovieScheduleForCinema } from '@/src/services/ticketService';
import FilterBar from '@/src/components/cinema/FilterBar';
import CityFilterModal from '@/src/components/cinema/CityFilterModal';
import CinemaFilterModal from '@/src/components/cinema/CinemaFilterModal';
import DateFilterModal from '@/src/components/cinema/DateFilterModal';
import CinemaSchedule from '@/src/components/cinema/CinemaSchedule';

const { height } = Dimensions.get('window');

export default function MovieDetailsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useAuth();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'comprar' | 'detalle'>('detalle');
  
  // Estados para la compra
  const [selectedCity, setSelectedCity] = useState('Lima');
  const [selectedCinema, setSelectedCinema] = useState('cp-alcazar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [userCinemaSchedule, setUserCinemaSchedule] = useState<MovieSchedule | null>(null);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  
  // Estados para los modales
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  // Colores del header similar a movies.tsx
  const statusBarColor = '#051135ff'; // Azul muy oscuro para status bar
  const headerColor = '#2f64baff'; // Azul más claro para header

  const loadSchedules = useCallback(async (movieId: string) => {
    try {
      setLoadingSchedules(true);
      
      // Usar el cine seleccionado por el usuario
      const userSchedule = await getMovieScheduleForCinema(movieId, selectedCinema);
      setUserCinemaSchedule(userSchedule);
    } catch (err) {
      console.error('❌ ERROR: Error loading schedules:', err);
    } finally {
      setLoadingSchedules(false);
    }
  }, [selectedCinema]);

  const loadMovie = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const movieId = params.id as string;
      if (movieId) {
        const movieData = await getMovieById(movieId);
        if (movieData) {
          setMovie(movieData);
          // Cargar horarios cuando se cambie a la pestaña de comprar
          if (selectedTab === 'comprar') {
            await loadSchedules(movieId);
          }
        } else {
          setError('Película no encontrada');
        }
      } else {
        setError('ID de película no válido');
      }
    } catch (err) {
      console.error('Error loading movie:', err);
      setError('Error al cargar la película');
    } finally {
      setLoading(false);
    }
  }, [params.id, selectedTab, loadSchedules]);



  const handleShowtimeSelect = async (showtime: Showtime) => {
    if (!user) {
      Alert.alert(
        'Iniciar Sesión',
        'Debes iniciar sesión para comprar entradas',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar Sesión', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    // Redirigir a la pantalla de selección de asientos
    router.push({
      pathname: '/seat-selection',
      params: {
        movieId: movie!.id!,
        showtimeId: showtime.id,
        cinemaId: showtime.cinemaId,
        time: showtime.time,
        price: showtime.price.toString(),
        date: selectedDate,
        cinemaName: selectedCinema
      }
    });
  };

  useEffect(() => {
    loadMovie();
  }, [loadMovie]);

  // Cargar horarios cuando se cambie a la pestaña de comprar
  useEffect(() => {
    if (selectedTab === 'comprar' && movie?.id) {
      loadSchedules(movie.id);
    }
  }, [selectedTab, movie?.id, loadSchedules]);

  // Recargar horarios cuando cambie el cine seleccionado
  useEffect(() => {
    if (selectedTab === 'comprar' && movie?.id) {
      loadSchedules(movie.id);
    }
  }, [selectedCinema, selectedTab, movie?.id, loadSchedules]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} h ${mins} min` : `${mins} min`;
  };

  const getUserInitials = () => {
    if (userProfile) {
      return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={statusBarColor}
        translucent={false}
      />
      
      {/* Status Bar Simulation */}
      <View style={[styles.statusBar, { backgroundColor: statusBarColor }]} />
      
      {/* Header estilo Cineplanet */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Películas</ThemedText>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton}>
            <IconSymbol name="magnifyingglass" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <ThemedText style={styles.profileText}>{getUserInitials()}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpButton}>
            <IconSymbol name="questionmark.circle" size={18} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53E3E" />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Cargando película...
          </ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={[styles.errorText, { color: textColor }]}>
            {error}
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadMovie}>
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      ) : movie ? (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 60 }}
        >
          {/* Video/Imagen principal */}
          <View style={styles.mediaContainer}>
            {/* Sección Estreno - Movida aquí y posicionada encima */}
            <View style={styles.premiereSection}>
              <ThemedText style={styles.premiereText}>Estreno</ThemedText>
            </View>
            <Image 
              source={{ uri: movie.posterUrl }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            <View style={styles.playButton}>
                <IconSymbol name="play.fill" size={32} color="white" />
            </View>
          </View>

          {/* Información de la película con insignia de clasificación */}
          <View style={styles.movieInfoContainer}>
            <View style={styles.movieInfoMain}>
              <ThemedText style={styles.movieTitleMain}>{movie.title}</ThemedText>
              <ThemedText style={styles.movieSubtitleMain}>
                {movie.genre.join(' | ')} | {formatDuration(movie.duration)} | {movie.rating}
              </ThemedText>
            </View>
            <View style={styles.ratingBadge}>
              <ThemedText style={styles.ratingBadgeText}>+14 DNI</ThemedText>
            </View>
          </View>

          {/* Tabs de navegación */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                selectedTab === 'detalle' && styles.activeTab
              ]}
              onPress={() => setSelectedTab('detalle')}
            >
              <ThemedText style={[
                styles.tabText,
                selectedTab === 'detalle' ? styles.activeTabText : styles.inactiveTabText
              ]}>
                Detalle
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab, 
                selectedTab === 'comprar' && styles.activeTab
              ]}
              onPress={() => setSelectedTab('comprar')}
            >
              <ThemedText style={[
                styles.tabText,
                selectedTab === 'comprar' ? styles.activeTabText : styles.inactiveTabText
              ]}>
                Comprar
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Contenido de los tabs */}
          {selectedTab === 'detalle' ? (
            <View style={styles.detailsContainer}>
            {/* Sinopsis */}
            <View style={styles.sectionWithoutBorder}>
              <ThemedText style={styles.sectionTitle}>
                Sinopsis
              </ThemedText>
              <ThemedText style={[styles.sectionContent, { color: textColor }]}>
                {movie.description}
              </ThemedText>
            </View>

            {/* Director */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Director
              </ThemedText>
              <ThemedText style={[styles.sectionContent, { color: textColor }]}>
                {movie.director}
              </ThemedText>
            </View>

            {/* Reparto */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Reparto
              </ThemedText>
              <ThemedText style={[styles.sectionContent, { color: textColor }]}>
                {movie.cast.join(', ')}
              </ThemedText>
            </View>

            {/* Idioma */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Idioma
              </ThemedText>
              <View style={styles.languageContainer}>
                <View style={styles.languageButton}>
                  <ThemedText style={styles.languageButtonText}>
                    {movie.subtitle || movie.language}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Disponible en */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Disponible
              </ThemedText>
              <View style={styles.formatContainer}>
                <View style={styles.formatButton}>
                  <ThemedText style={styles.formatButtonText}>2D</ThemedText>
                </View>
                <View style={styles.formatButton}>
                  <ThemedText style={styles.formatButtonText}>REGULAR</ThemedText>
                </View>
                <View style={styles.formatButton}>
                  <ThemedText style={styles.formatButtonText}>PRIME</ThemedText>
                </View>
              </View>
            </View>
            
            {/* Espaciador para evitar superposición con navegación */}
            <View style={styles.bottomSpacer} />
            </View>
          ) : (
            <View style={styles.purchaseContainer}>
              {loadingSchedules ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#E53E3E" />
                  <ThemedText style={[styles.loadingText, { color: textColor }]}>
                    Cargando horarios...
                  </ThemedText>
                </View>
              ) : (
                <>
                  {/* Barra de filtros */}
                  <FilterBar
                    selectedCity={selectedCity}
                    selectedCinema={selectedCinema}
                    selectedDate={selectedDate}
                    onCityPress={() => setShowCityModal(true)}
                    onCinemaPress={() => setShowCinemaModal(true)}
                    onDatePress={() => setShowDateModal(true)}
                  />

                  {/* Horarios del cine seleccionado */}
                  {userCinemaSchedule ? (
                    <CinemaSchedule
                      schedule={userCinemaSchedule}
                      isUserCinema={true}
                      onShowtimeSelect={handleShowtimeSelect}
                    />
                  ) : (
                    <View style={styles.noCinemaContainer}>
                      <Image 
                        source={require('../img/FuncionNoAbierta.jpg')}
                        style={styles.noScheduleImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}

                  {/* Modales de filtro */}
                  <CityFilterModal
                    visible={showCityModal}
                    selectedCity={selectedCity}
                    onSelectCity={setSelectedCity}
                    onClose={() => setShowCityModal(false)}
                  />

                  <CinemaFilterModal
                    visible={showCinemaModal}
                    selectedCinema={selectedCinema}
                    onSelectCinema={setSelectedCinema}
                    onClose={() => setShowCinemaModal(false)}
                  />

                  <DateFilterModal
                    visible={showDateModal}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onClose={() => setShowDateModal(false)}
                  />
                </>
              )}
              
              <View style={styles.bottomSpacer} />
            </View>
          )}
        </ScrollView>
      ) : null}
    </View>
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
  backButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
  },
  shareButton: {
    padding: 8,
  },
  mediaContainer: {
    position: 'relative',
    height: height * 0.3,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 64,
    height: 64,
    marginTop: -32,
    marginLeft: -32,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  movieInfoMain: {
    flex: 1,
  },
  movieTitleMain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  movieSubtitleMain: {
    fontSize: 14,
    color: '#666666',
  },
  ratingBadge: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  premiereSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E53E3E',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 1,
  },
  premiereText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  movieTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  movieSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  detailsContainer: {
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#0066CC',
    paddingBottom: 16,
    marginHorizontal: 16,
  },
  sectionWithoutBorder: {
    marginBottom: 24,
    paddingBottom: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0066CC',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  languageContainer: {
    flexDirection: 'row',
  },
  languageButton: {
    borderWidth: 1,
    borderColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  languageButtonText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '500',
  },
  formatContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  formatButton: {
    borderWidth: 1,
    borderColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  formatButtonText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '500',
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E53E3E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 80,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#E53E3E',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#E53E3E',
  },
  inactiveTabText: {
    color: '#999999',
  },
  purchaseContainer: {
    paddingHorizontal: 0,
  },
  noCinemaContainer: {
    margin: 0,
    padding: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  noScheduleImage: {
    width: '100%',
    height: 400,
    marginVertical: 0,
  },
  noCinemaText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});