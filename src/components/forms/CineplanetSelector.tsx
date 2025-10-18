import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useThemeColor } from '@/src/hooks/useThemeColor';

// Lista completa de Cineplanets
const cineplanets = [
  'CP Santa Clara',
  'CP Risso',
  'CP Villa El Salvador',
  'CP Puno',
  'CP Ventanilla',
  'CP San Borja',
  'CP Santa Clara Qhatu Plaza',
  'CP Brasil',
  'CP Salaverry',
  'CP Villa María del Triunfo',
  'CP Centro Civico',
  'CP Centro Jr. De La Unión',
  'CP Plaza Santa Catalina',
  'CP Chiclayo Mall Aventura',
  'CP Guardia Civil',
  'CP Juliaca',
  'CP Parque La Molina',
  'CP San Miguel',
  'CP San Juan de Lurigancho',
  'CP Arequipa Real Plaza',
  'CP Lurin',
  'CP Arequipa Mall Plaza',
  'CP La Molina',
  'CP Norte',
  'CP Cajamarca',
  'CP Mall del Sur',
  'CP Piura',
  'CP Huancayo Real Plaza',
  'CP Cusco',
  'CP Primavera',
  'CP Pucallpa',
  'CP Huanuco Real Plaza',
  'CP Piura Real Plaza',
  'CP Alcazar',
  'CP Tacna',
  'CP Pro',
  'CP Comas',
  'CP Chiclayo Real Plaza',
  'CP Puruchuco',
  'CP Trujillo Centro',
  'CP Arequipa Paseo Central',
  'CP Canto Grande',
  'CP El Polo',
];

export type CineplanetSelectorProps = {
  onBack: () => void;
  onSelect: (cineplanet: string) => void;
  selectedCineplanet?: string;
};

export function CineplanetSelector({ 
  onBack, 
  onSelect, 
  selectedCineplanet 
}: CineplanetSelectorProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'inputBorder');

  const handleSelectCineplanet = (cineplanet: string) => {
    onSelect(cineplanet);
    onBack(); // Regresa automáticamente al formulario
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <IconSymbol name="xmark" size={24} color={primaryColor} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: primaryColor }]}>
          Cineplanet Favorito
        </ThemedText>
      </View>

      {/* Lista de Cineplanets */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {cineplanets.map((cineplanet, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cineplanetItem,
              { borderBottomColor: borderColor }
            ]}
            onPress={() => handleSelectCineplanet(cineplanet)}
          >
            <View style={styles.cineplanetContent}>
              <IconSymbol 
                name={selectedCineplanet === cineplanet ? "heart.fill" : "heart"} 
                size={24} 
                color={primaryColor}
                style={styles.heartIcon}
              />
              <ThemedText style={[styles.cineplanetText, { color: primaryColor }]}>
                {cineplanet}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  scrollContainer: {
    flex: 1,
  },
  cineplanetItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cineplanetContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    marginRight: 16,
  },
  cineplanetText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
});
