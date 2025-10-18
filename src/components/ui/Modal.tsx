import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/src/hooks/useThemeColor';

interface BasicModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BasicModal({ visible, onClose, children }: BasicModalProps) {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor }]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
});
