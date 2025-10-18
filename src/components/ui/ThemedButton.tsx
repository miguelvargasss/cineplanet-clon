import React from 'react';
import { StyleSheet, TouchableOpacity, View, type TouchableOpacityProps } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './IconSymbol';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { type SymbolViewProps } from 'expo-symbols';

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  lightColor?: string;
  darkColor?: string;
  textLightColor?: string;
  textDarkColor?: string;
  icon?: SymbolViewProps['name'];
};

export function ThemedButton({
  title,
  variant = 'primary',
  style,
  lightColor,
  darkColor,
  textLightColor,
  textDarkColor,
  icon,
  ...rest
}: ThemedButtonProps) {
  // Determinar colores basados en la variante
  let backgroundColorKey: keyof typeof import('@/src/constants/Colors').Colors.light;
  let textColorKey: keyof typeof import('@/src/constants/Colors').Colors.light;
  
  switch (variant) {
    case 'primary':
      backgroundColorKey = 'buttonPrimary';
      textColorKey = 'background'; // Texto blanco en botón azul
      break;
    case 'secondary':
      backgroundColorKey = 'buttonSecondary';
      textColorKey = 'background'; // Texto blanco en botón rosa
      break;
    case 'outline':
      backgroundColorKey = 'background';
      textColorKey = 'buttonPrimary';
      break;
    default:
      backgroundColorKey = 'buttonPrimary';
      textColorKey = 'background';
  }

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    backgroundColorKey
  );
  
  const textColor = useThemeColor(
    { light: textLightColor, dark: textDarkColor }, 
    textColorKey
  );

  const borderColor = useThemeColor({}, 'buttonPrimary');

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor,
          borderColor: variant === 'outline' ? borderColor : 'transparent',
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        style,
      ]}
      {...rest}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <IconSymbol 
            name={icon} 
            size={20} 
            color={textColor} 
            style={styles.icon} 
          />
        )}
        <ThemedText 
          style={[styles.buttonText, { color: textColor }]}
          type="defaultSemiBold"
        >
          {title}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
  },
  icon: {
    marginRight: 8,
  },
});