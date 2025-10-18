/**
 * Cineplanet App Colors - Colores oficiales de la marca Cineplanet
 */

const tintColorLight = '#1E3A8A'; // Azul Cineplanet oscuro como en la imagen
const tintColorDark = '#fff';
const primaryBlue = '#1E3A8A'; // Azul principal de Cineplanet oscuro
const headerBlue = '#2563EB'; // Azul medio para headers
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
    header: headerBlue, // Nuevo color para headers
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
    header: headerBlue, // Nuevo color para headers
    secondary: secondaryRed,
    inputBackground: '#2A2A2A',
    inputBorder: '#404040',
    placeholder: '#9E9E9E',
    link: '#64B5F6',
    buttonPrimary: primaryBlue,
    buttonSecondary: secondaryRed,
  },
};
