import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useThemeColor } from '@/src/hooks/useThemeColor';

export type ThemedCheckboxProps = {
  checked: boolean;
  onPress: () => void;
  size?: number;
};

export function ThemedCheckbox({ 
  checked, 
  onPress, 
  size = 20 
}: ThemedCheckboxProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'inputBorder');
  const backgroundColor = useThemeColor({}, 'inputBackground');

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: checked ? primaryColor : backgroundColor,
          borderColor: checked ? primaryColor : borderColor,
        }
      ]}
      onPress={onPress}
    >
      {checked && (
        <IconSymbol 
          name="checkmark" 
          size={size * 0.6} 
          color="#FFFFFF"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
