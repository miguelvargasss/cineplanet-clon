import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from './ui/IconSymbol';
import { limecinemas } from '@/src/data/cinemas';

interface CinemaFilterModalProps {
  visible: boolean;
  selectedCinema: string;
  onSelectCinema: (cinema: string) => void;
  onClose: () => void;
}

// Cines adicionales que aparecen en las imágenes
const additionalCinemas = [
  { id: 'cp-plaza-santa-catalina', name: 'CP Plaza Santa Catalina' },
  { id: 'cp-chiclayo-mall-aventura', name: 'CP Chiclayo Mall Aventura' },
  { id: 'cp-guardia-civil', name: 'CP Guardia Civil' },
  { id: 'cp-parque-la-molina', name: 'CP Parque La Molina' },
  { id: 'cp-juliaca', name: 'CP Juliaca' },
  { id: 'cp-san-juan-lurigancho', name: 'CP San Juan de Lurigancho' },
  { id: 'cp-la-molina', name: 'CP La Molina' },
  { id: 'cp-norte', name: 'CP Norte' },
  { id: 'cp-mall-del-sur', name: 'CP Mall del Sur' }
];

export default function CinemaFilterModal({ 
  visible, 
  selectedCinema, 
  onSelectCinema, 
  onClose 
}: CinemaFilterModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Combinar cines existentes con los adicionales
  const allCinemas = [
    ...limecinemas.map(cinema => ({ id: cinema.id, name: cinema.name })),
    ...additionalCinemas
  ];

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <IconSymbol name="building.2" size={20} color="#FFFFFF" />
            <ThemedText style={styles.headerTitle}>Filtra por Cine</ThemedText>
          </View>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol name="xmark" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Cinemas List */}
        <ScrollView style={styles.cinemasList}>
          {allCinemas.map((cinema) => (
            <TouchableOpacity
              key={cinema.id}
              style={[
                styles.cinemaItem,
                selectedCinema === cinema.id && styles.selectedCinemaItem
              ]}
              onPress={() => {
                onSelectCinema(cinema.id);
                onClose();
              }}
            >
              <ThemedText style={[
                styles.cinemaText,
                selectedCinema === cinema.id && styles.selectedCinemaText
              ]}>
                {cinema.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F64BA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Para status bar
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  cinemasList: {
    flex: 1,
  },
  cinemaItem: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedCinemaItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cinemaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
  },
  selectedCinemaText: {
    fontWeight: '600',
  },
});