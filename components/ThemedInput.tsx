import React, { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, type TextInputProps } from 'react-native';
import { type SymbolViewProps } from 'expo-symbols';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  isPassword?: boolean;
  icon?: SymbolViewProps['name'];
  placeholder?: string;
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  isPassword = false,
  icon,
  placeholder,
  ...rest
}: ThemedInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = '#9E9E9E';
  const iconColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'primary');

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Color del borde: azul si está enfocado, gris si no
  const currentBorderColor = isFocused ? primaryColor : '#E0E0E0';

  return (
    <View style={[styles.container, { borderBottomColor: currentBorderColor }]}>
      {icon && (
        <IconSymbol 
          name={icon} 
          size={20} 
          color={iconColor} 
          style={styles.icon} 
        />
      )}
      
      <TextInput
        style={[
          styles.input,
          { color: textColor, flex: 1 },
          style,
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        secureTextEntry={isPassword && !isPasswordVisible}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />
      
      {isPassword && (
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
          <IconSymbol
            name={isPasswordVisible ? 'eye.slash' : 'eye'}
            size={20}
            color={iconColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 0,
    paddingVertical: 12,
    marginVertical: 4,
  },
  input: {
    fontSize: 16,
    minHeight: 24,
    paddingVertical: 4,
  },
  icon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 4,
  },
});
