import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Icon } from '@/components/ui/Icon';

export default function MoviesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const statusBarColor = '#051135ff'; // Azul muy oscuro para status bar (detalles del teléfono)
  const headerColor = '#2f64baff'; // Azul más claro para header (separación visual)
  const insets = useSafeAreaInsets();

  const tabs = ['En Cartelera', 'Próximos Estrenos', 'BTS Week'];
  const [selectedTab, setSelectedTab] = React.useState(0);

  return (
    <>
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
            <Icon family="Ionicons" name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <ThemedText style={styles.profileText}>MV</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpButton}>
            <Icon family="Ionicons" name="help-circle" size={18} color="#3B82F6" />
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
          <Icon family="Ionicons" name="location" size={32} color="#3B82F6" />
          <ThemedText style={[styles.filterText, { color: textColor }]}>
            Ciudad
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Icon family="Ionicons" name="calendar" size={32} color="#3B82F6" />
          <ThemedText style={[styles.filterText, { color: textColor }]}>
            Fecha
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Icon family="Ionicons" name="funnel" size={32} color="#3B82F6" />
          <ThemedText style={[styles.filterText, { color: textColor }]}>
            Opciones
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Movies Grid */}
      <ScrollView style={styles.moviesContainer} showsVerticalScrollIndicator={false}>
        {/* Aquí se mostrarán las películas dinámicamente */}
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: textColor }]}>
            Próximamente aquí se mostrarán las películas disponibles
          </ThemedText>
        </View>
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
          <Icon family="Ionicons" name="home-outline" size={24} color="#999" />
          <ThemedText style={styles.navText}>Inicio</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Icon family="Ionicons" name="videocam-outline" size={24} color="#2563EB" />
          <ThemedText style={[styles.navText, { color: "#2563EB", fontWeight: '600' }]}>Películas</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Icon family="Ionicons" name="business-outline" size={24} color="#999" />
          <ThemedText style={styles.navText}>Cines</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Icon family="Ionicons" name="bag-outline" size={24} color="#999" />
          <ThemedText style={styles.navText}>Dulcería</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Icon family="Ionicons" name="ellipsis-horizontal" size={24} color="#999" />
          <ThemedText style={styles.navText}>Más</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 1, // Mínimo espacio entre rectángulos
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0, // Sin esquinas redondeadas como en la imagen
    backgroundColor: '#FFFFFF',
    height: 80, // Altura fija para que se vean más rectangulares
  },
  filterText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  moviesContainer: {
    flex: 1,
    paddingHorizontal: 8, // Reducir padding para más espacio
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
