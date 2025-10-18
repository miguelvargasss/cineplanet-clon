import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { ThemedView } from '../ui/ThemedView';
import { IconSymbol } from '../ui/IconSymbol';
import { useThemeColor } from '@/src/hooks/useThemeColor';

export type DropdownOption = {
  label: string;
  value: string;
};

export type ThemedDropdownProps = {
  options: DropdownOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  lightColor?: string;
  darkColor?: string;
};

export function ThemedDropdown({
  options,
  selectedValue,
  onValueChange,
  placeholder = "Seleccionar...",
  lightColor,
  darkColor,
}: ThemedDropdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'inputBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const iconColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'primary');

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor, borderColor }]}
        onPress={() => setIsVisible(true)}
      >
        <ThemedText 
          style={[
            styles.text, 
            { color: selectedOption ? textColor : placeholderColor }
          ]}
        >
          {displayText}
        </ThemedText>
        <IconSymbol 
          name="chevron.down" 
          size={16} 
          color={iconColor}
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <ThemedView style={[styles.modal, { borderColor: primaryColor }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <ThemedText style={[styles.optionText, { color: textColor }]}>
                    {item.label}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 300,
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
  },
});
