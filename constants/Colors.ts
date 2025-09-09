/**
 * Cineplanet App Colors - Colores oficiales de la marca Cineplanet
 */

const tintColorLight = '#1565C0'; // Azul Cineplanet más oscuro
const tintColorDark = '#fff';
const primaryBlue = '#1565C0'; // Azul principal de Cineplanet más oscuro
const secondaryRed = '#E91E63'; // Rosa/Rojo de Cineplanet

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF', // Fondo blanco como la imagen 1
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: primaryBlue,
    secondary: secondaryRed,
    inputBackground: 'transparent',
    inputBorder: '#E0E0E0',
    placeholder: '#9E9E9E',
    link: primaryBlue,
    buttonPrimary: primaryBlue,
    buttonSecondary: secondaryRed,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: primaryBlue,
    secondary: secondaryRed,
    inputBackground: '#2A2A2A',
    inputBorder: '#404040',
    placeholder: '#9E9E9E',
    link: '#64B5F6',
    buttonPrimary: primaryBlue,
    buttonSecondary: secondaryRed,
  },
};
