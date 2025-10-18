import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { useThemeColor } from '@/src/hooks/useThemeColor';

interface CityTabsProps {
  selectedCity: string;
  onCitySelect: (city: string) => void;
}

export default function CityTabs({ selectedCity, onCitySelect }: CityTabsProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cities = ['Lima']; // Por ahora solo Lima

  return (
    <View style={styles.container}>
      {cities.map((city) => (
        <TouchableOpacity
          key={city}
          style={[
            styles.tab,
            selectedCity === city && styles.activeTab
          ]}
          onPress={() => onCitySelect(city)}
        >
          <View style={styles.tabContent}>
            <ThemedText style={[
              styles.tabText,
              selectedCity === city ? styles.activeTabText : { color: textColor }
            ]}>
              {city}
            </ThemedText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#E53E3E',
  },
  tabContent: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E53E3E',
    fontWeight: 'bold',
  },
});