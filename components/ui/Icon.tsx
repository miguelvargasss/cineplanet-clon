import React from 'react';
import { 
  MaterialIcons, 
  Ionicons, 
  FontAwesome, 
  Feather,
  AntDesign,
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { type StyleProp, type TextStyle } from 'react-native';

// Definir las familias de iconos disponibles
export type IconFamily = 
  | 'MaterialIcons' 
  | 'Ionicons' 
  | 'FontAwesome' 
  | 'Feather' 
  | 'AntDesign' 
  | 'MaterialCommunityIcons';

// Props para el componente de icono
export interface IconProps {
  family: IconFamily;
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

/**
 * Componente de icono mejorado que soporta múltiples familias de @expo/vector-icons
 * 
 * Familias disponibles:
 * - MaterialIcons: Iconos de Material Design
 * - Ionicons: Iconos de Ionic Framework  
 * - FontAwesome: Iconos de Font Awesome
 * - Feather: Iconos minimalistas Feather
 * - AntDesign: Iconos de Ant Design
 * - MaterialCommunityIcons: Iconos de Material Design Community
 * 
 * Uso:
 * <Icon family="Ionicons" name="home" size={24} color="#007AFF" />
 * <Icon family="MaterialIcons" name="person" size={20} color="#666" />
 */
export function Icon({ family, name, size = 24, color = '#000', style }: IconProps) {
  const iconProps = { name: name as any, size, color, style };

  switch (family) {
    case 'MaterialIcons':
      return <MaterialIcons {...iconProps} />;
    case 'Ionicons':
      return <Ionicons {...iconProps} />;
    case 'FontAwesome':
      return <FontAwesome {...iconProps} />;
    case 'Feather':
      return <Feather {...iconProps} />;
    case 'AntDesign':
      return <AntDesign {...iconProps} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons {...iconProps} />;
    default:
      // Fallback a MaterialIcons si la familia no es reconocida
      return <MaterialIcons {...iconProps} />;
  }
}

// Componentes especializados para cada familia (para facilidad de uso)
export const MIcon = (props: Omit<IconProps, 'family'>) => 
  <Icon {...props} family="MaterialIcons" />;

export const IIcon = (props: Omit<IconProps, 'family'>) => 
  <Icon {...props} family="Ionicons" />;

export const FAIcon = (props: Omit<IconProps, 'family'>) => 
  <Icon {...props} family="FontAwesome" />;

export const FeatherIcon = (props: Omit<IconProps, 'family'>) => 
  <Icon {...props} family="Feather" />;

export const AIcon = (props: Omit<IconProps, 'family'>) => 
  <Icon {...props} family="AntDesign" />;

export const MCIcon = (props: Omit<IconProps, 'family'>) => 
  <Icon {...props} family="MaterialCommunityIcons" />;

// Re-exportar IconSymbol existente para compatibilidad hacia atrás
export { IconSymbol } from './IconSymbol';