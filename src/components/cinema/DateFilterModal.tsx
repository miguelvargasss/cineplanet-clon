import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { IconSymbol } from '../ui/IconSymbol';

interface DateFilterModalProps {
  visible: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

export default function DateFilterModal({ 
  visible, 
  selectedDate, 
  onSelectDate, 
  onClose 
}: DateFilterModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Generar las tres fechas: Hoy, Mañana, y el tercer día
  const generateDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    return [
      {
        key: 'today',
        label: 'Hoy',
        date: today.toISOString().split('T')[0],
        displayDate: today.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })
      },
      {
        key: 'tomorrow',
        label: 'Mañana',
        date: tomorrow.toISOString().split('T')[0],
        displayDate: tomorrow.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })
      },
      {
        key: 'dayafter',
        label: dayAfter.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }),
        date: dayAfter.toISOString().split('T')[0],
        displayDate: dayAfter.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })
      }
    ];
  };

  const dates = generateDates();

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <IconSymbol name="calendar" size={20} color="#FFFFFF" />
            <ThemedText style={styles.headerTitle}>Filtra por Fecha</ThemedText>
          </View>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol name="xmark" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Dates List */}
        <View style={styles.datesList}>
          {dates.map((dateItem) => (
            <TouchableOpacity
              key={dateItem.key}
              style={[
                styles.dateItem,
                selectedDate === dateItem.date && styles.selectedDateItem
              ]}
              onPress={() => {
                onSelectDate(dateItem.date);
                onClose();
              }}
            >
              <ThemedText style={[
                styles.dateText,
                selectedDate === dateItem.date && styles.selectedDateText
              ]}>
                {dateItem.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E53E3E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Para status bar
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  datesList: {
    flex: 1,
  },
  dateItem: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedDateItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
  },
  selectedDateText: {
    fontWeight: '600',
  },
});