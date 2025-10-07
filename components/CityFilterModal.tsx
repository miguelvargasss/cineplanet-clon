import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from './ui/IconSymbol';

interface CityFilterModalProps {
  visible: boolean;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onClose: () => void;
}

const cities = [
  'Lima',
  'Chiclayo', 
  'Juliaca',
  'Arequipa',
  'Huancayo',
  'Cusco',
  'Huánuco',
  'Piura',
  'Tacna',
  'Trujillo'
];

export default function CityFilterModal({ 
  visible, 
  selectedCity, 
  onSelectCity, 
  onClose 
}: CityFilterModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

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
            <IconSymbol name="mappin" size={20} color="#FFFFFF" />
            <ThemedText style={styles.headerTitle}>Filtra por Ciudad</ThemedText>
          </View>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol name="xmark" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Cities List */}
        <ScrollView style={styles.citiesList}>
          {cities.map((city) => (
            <TouchableOpacity
              key={city}
              style={[
                styles.cityItem,
                selectedCity === city && styles.selectedCityItem
              ]}
              onPress={() => {
                onSelectCity(city);
                onClose();
              }}
            >
              <ThemedText style={[
                styles.cityText,
                selectedCity === city && styles.selectedCityText
              ]}>
                {city}
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
  citiesList: {
    flex: 1,
  },
  cityItem: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedCityItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cityText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
  },
  selectedCityText: {
    fontWeight: '600',
  },
});