import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const { width } = Dimensions.get('window');

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToMyPurchases: () => void;
  onLogout: () => void;
  userInitials: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  onClose,
  onNavigateToMyPurchases,
  onLogout,
  userInitials
}) => {
  const menuOptions = [
    {
      id: 'profile',
      title: 'Mi Perfil',
      enabled: false,
    },
    {
      id: 'purchases',
      title: 'Mis Compras',
      enabled: true,
      onPress: onNavigateToMyPurchases,
    },
    {
      id: 'benefits',
      title: 'Mis Beneficios',
      enabled: false,
    },
    {
      id: 'card',
      title: 'Ver Tarjeta',
      enabled: false,
    },
    {
      id: 'logout',
      title: 'Logout',
      enabled: true,
      onPress: onLogout,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay con blur */}
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedView style={styles.modalContent}>
              {menuOptions.map((option, index) => (
                <React.Fragment key={option.id}>
                  <TouchableOpacity
                    style={[
                      styles.menuOption,
                      !option.enabled && styles.menuOptionDisabled
                    ]}
                    onPress={option.enabled ? option.onPress : undefined}
                    disabled={!option.enabled}
                  >
                    <ThemedText style={[
                      styles.menuOptionText,
                      !option.enabled && styles.menuOptionTextDisabled
                    ]}>
                      {option.title}
                    </ThemedText>
                  </TouchableOpacity>
                  
                  {index < menuOptions.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </React.Fragment>
              ))}
            </ThemedView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    maxWidth: 320,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  menuOption: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  menuOptionDisabled: {
    opacity: 0.5,
  },
  menuOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    textAlign: 'center',
  },
  menuOptionTextDisabled: {
    color: '#9CA3AF',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
  },
});