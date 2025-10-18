import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { IconSymbol } from '../ui/IconSymbol';

interface FilterBarProps {
  selectedCity: string;
  selectedCinema: string;
  selectedDate: string;
  onCityPress: () => void;
  onCinemaPress: () => void;
  onDatePress: () => void;
}

export default function FilterBar({ 
  selectedCity,
  selectedCinema,
  selectedDate,
  onCityPress,
  onCinemaPress,
  onDatePress 
}: FilterBarProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Formatear la fecha para mostrar
  const formatDateDisplay = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (date === today) return 'Hoy';
    if (date === tomorrowStr) return 'Mañana';
    
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-ES', { 
      weekday: 'long',
      day: 'numeric'
    });
  };

  // Formatear el nombre del cine para mostrar
  const formatCinemaDisplay = (cinemaId: string) => {
    // Si es un ID, intentar convertir a nombre legible
    if (cinemaId.startsWith('cp-')) {
      return cinemaId.replace('cp-', 'CP ').replace(/-/g, ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return cinemaId;
  };

  return (
    <View style={styles.container}>
      {/* Ciudad */}
      <TouchableOpacity style={styles.filterButton} onPress={onCityPress}>
        <IconSymbol name="mappin" size={20} color="#3B82F6" />
        <ThemedText style={styles.filterLabel}>
          {selectedCity}
        </ThemedText>
      </TouchableOpacity>

      {/* Separador */}
      <View style={styles.separator} />

      {/* Cine */}
      <TouchableOpacity style={styles.filterButton} onPress={onCinemaPress}>
        <IconSymbol name="camera" size={20} color="#3B82F6" />
        <ThemedText style={styles.filterLabel}>
          {formatCinemaDisplay(selectedCinema)}
        </ThemedText>
      </TouchableOpacity>

      {/* Separador */}
      <View style={styles.separator} />

      {/* Fecha */}
      <TouchableOpacity style={styles.filterButton} onPress={onDatePress}>
        <IconSymbol name="calendar" size={20} color="#3B82F6" />
        <ThemedText style={styles.filterLabel}>
          {formatDateDisplay(selectedDate)}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 0,
    marginVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginTop: 4,
    textAlign: 'center',
  },
  separator: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
});