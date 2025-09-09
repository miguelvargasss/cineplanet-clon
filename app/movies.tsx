import React from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function MoviesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const statusBarColor = '#1E40AF'; // Azul más oscuro para la barra de estado
  const headerColor = '#3B82F6'; // Azul más claro para el header principal
  const insets = useSafeAreaInsets();

  const tabs = ['En Cartelera', 'Próximos Estrenos', 'BTS Week'];
  const [selectedTab, setSelectedTab] = React.useState(0);

  const filterOptions = [
    { icon: 'location.fill', label: 'Cajamarca' },
    { icon: 'calendar', label: 'Fecha' },
    { icon: 'line.3.horizontal', label: 'Opciones' },
  ];

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Status Bar Simulation */}
      <View style={[styles.statusBar, { backgroundColor: statusBarColor }]} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ThemedText style={{ color: '#FFFFFF', fontSize: 20 }}>‹</ThemedText>
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Películas</ThemedText>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <ThemedText style={{ color: '#FFFFFF', fontSize: 18 }}>🔍</ThemedText>
          </TouchableOpacity>
          <View style={styles.profileButton}>
            <ThemedText style={styles.profileText}>MV</ThemedText>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <ThemedText style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>?</ThemedText>
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
                { color: selectedTab === index ? '#E50914' : textColor } // Rojo para tab activo
              ]}
            >
              {tab}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        {filterOptions.map((option, index) => (
          <TouchableOpacity key={index} style={styles.filterButton}>
            <ThemedText style={{ fontSize: 16 }}>
              {index === 0 ? '📍' : index === 1 ? '📅' : '⚙️'}
            </ThemedText>
            <ThemedText style={[styles.filterText, { color: textColor }]}>
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Movies Grid */}
      <ScrollView style={styles.moviesContainer} showsVerticalScrollIndicator={false}>
        <Image 
          source={require('@/assets/images/peliculas-cajamarca.jpg')}
          style={styles.moviesImage}
          resizeMode="cover"
        />
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
          <ThemedText style={{ fontSize: 20 }}>🏠</ThemedText>
          <ThemedText style={styles.navText}>Inicio</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <ThemedText style={{ fontSize: 20 }}>🎬</ThemedText>
          <ThemedText style={[styles.navText, { color: headerColor }]}>Películas</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <ThemedText style={{ fontSize: 20 }}>🏢</ThemedText>
          <ThemedText style={styles.navText}>Cines</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <ThemedText style={{ fontSize: 20 }}>🛍️</ThemedText>
          <ThemedText style={styles.navText}>Dulcería</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <ThemedText style={{ fontSize: 20 }}>⋯</ThemedText>
          <ThemedText style={styles.navText}>Más</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: 30,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12, // Reducir padding vertical
  },
  tab: {
    marginRight: 32,
    paddingBottom: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#E50914', // Mantenemos el rojo para el indicador de tab activo
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8, // Reducir padding vertical
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    alignItems: 'center',
    flex: 1,
  },
  filterText: {
    marginTop: 4,
    fontSize: 12,
  },
  moviesContainer: {
    flex: 1,
    paddingHorizontal: 8, // Reducir padding para más espacio
  },
  moviesImage: {
    width: width - 16, // Casi todo el ancho de la pantalla
    height: (width - 16) * 1.4, // Proporción más alta para mostrar más contenido
    marginVertical: 8, // Menos margen vertical
    borderRadius: 8, // Esquinas redondeadas como en el diseño
  },
  bottomNav: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: '#999',
    textAlign: 'center',
  },
});
