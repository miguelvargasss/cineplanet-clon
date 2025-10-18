import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

export type GenderOption = 'male' | 'female' | null;

export type GenderSelectorProps = {
  selectedGender: GenderOption;
  onGenderChange: (gender: GenderOption) => void;
};

export function GenderSelector({ selectedGender, onGenderChange }: GenderSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          styles.maleOption,
          { 
            backgroundColor: selectedGender === 'male' ? '#4A90E2' : '#F5F5F5',
            borderColor: selectedGender === 'male' ? '#4A90E2' : '#E0E0E0',
          }
        ]}
        onPress={() => onGenderChange('male')}
      >
        <View style={[styles.iconContainer, styles.maleIcon]}>
          <IconSymbol 
            name="person.fill" 
            size={40} 
            color={selectedGender === 'male' ? '#FFFFFF' : '#4A90E2'}
          />
        </View>
        <ThemedText 
          style={[
            styles.optionText, 
            { color: selectedGender === 'male' ? '#FFFFFF' : '#4A90E2' }
          ]}
        >
          Hombre
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          styles.femaleOption,
          { 
            backgroundColor: selectedGender === 'female' ? '#E91E63' : '#F5F5F5',
            borderColor: selectedGender === 'female' ? '#E91E63' : '#E0E0E0',
          }
        ]}
        onPress={() => onGenderChange('female')}
      >
        <View style={[styles.iconContainer, styles.femaleIcon]}>
          <IconSymbol 
            name="person.fill" 
            size={40} 
            color={selectedGender === 'female' ? '#FFFFFF' : '#E91E63'}
          />
        </View>
        <ThemedText 
          style={[
            styles.optionText, 
            { color: selectedGender === 'female' ? '#FFFFFF' : '#E91E63' }
          ]}
        >
          Mujer
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  maleOption: {
    // Estilos específicos para hombre
  },
  femaleOption: {
    // Estilos específicos para mujer
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  maleIcon: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
  },
  femaleIcon: {
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
