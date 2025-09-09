import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export type DateSelectorProps = {
  selectedDate?: Date;
  onDateChange: (date: Date) => void;
  placeholder?: string;
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthsShort = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const daysOfWeekFull = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DateSelector({ 
  selectedDate, 
  onDateChange, 
  placeholder = "DD-MM-AAAA" 
}: DateSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(selectedDate || new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const yearScrollRef = useRef<ScrollView>(null);
  
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const iconColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'primary');

  // Scroll automático al año seleccionado cuando se abre el selector
  useEffect(() => {
    if (showYearSelector && yearScrollRef.current) {
      const selectedYear = tempDate.getFullYear();
      const yearIndex = selectedYear - 1900; // Posición del año en la lista
      const itemHeight = 48; // Altura aproximada de cada item de año
      const scrollPosition = yearIndex * itemHeight - 100; // Centrar en pantalla
      
      setTimeout(() => {
        yearScrollRef.current?.scrollTo({
          y: Math.max(0, scrollPosition),
          animated: true,
        });
      }, 100);
    }
  }, [showYearSelector, tempDate]);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
  };

  const displayText = selectedDate ? formatDate(selectedDate) : placeholder;

  const handlePress = () => {
    setTempDate(selectedDate || new Date());
    setIsModalVisible(true);
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(day);
    setTempDate(newDate);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(tempDate);
    const currentMonth = newDate.getMonth();
    const currentYear = newDate.getFullYear();
    
    if (direction === 'prev') {
      if (currentMonth === 0) {
        // Si es enero, ir a diciembre del año anterior
        newDate.setFullYear(currentYear - 1);
        newDate.setMonth(11);
      } else {
        newDate.setMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        // Si es diciembre, ir a enero del año siguiente
        newDate.setFullYear(currentYear + 1);
        newDate.setMonth(0);
      } else {
        newDate.setMonth(currentMonth + 1);
      }
    }
    setTempDate(newDate);
  };

  const handleYearClick = () => {
    setShowYearSelector(true);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(year);
    setTempDate(newDate);
    setShowYearSelector(false);
  };

  const generateYears = () => {
    const years = [];
    for (let year = 1900; year <= 2025; year++) {
      years.push(year);
    }
    return years; // Mantener orden cronológico: 1900...2025
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(tempDate);
    const firstDay = getFirstDayOfMonth(tempDate);
    const days = [];

    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor, borderColor }]}
        onPress={handlePress}
      >
        <ThemedText 
          style={[
            styles.text, 
            { color: selectedDate ? textColor : placeholderColor }
          ]}
        >
          {displayText}
        </ThemedText>
        <IconSymbol 
          name="calendar" 
          size={20} 
          color={iconColor}
        />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { borderColor: primaryColor }]}>
            {/* Header con año y fecha */}
            <View style={[styles.modalHeader, { backgroundColor: primaryColor }]}>
              <TouchableOpacity onPress={handleYearClick}>
                <ThemedText style={[styles.yearText, { color: '#FFFFFF' }]}>
                  {tempDate.getFullYear()}
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={[styles.dateText, { color: '#FFFFFF' }]}>
                {`${daysOfWeekFull[tempDate.getDay()]}, ${monthsShort[tempDate.getMonth()]} ${tempDate.getDate()}`}
              </ThemedText>
            </View>

            {showYearSelector ? (
              /* Selector de año */
              <View style={styles.yearSelectorContainer}>
                <ScrollView 
                  ref={yearScrollRef}
                  style={styles.yearsList}
                  showsVerticalScrollIndicator={false}
                >
                  {generateYears().map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.yearItem,
                        year === tempDate.getFullYear() && { backgroundColor: primaryColor },
                      ]}
                      onPress={() => handleYearSelect(year)}
                    >
                      <ThemedText
                        style={[
                          styles.yearItemText,
                          {
                            color: year === tempDate.getFullYear() ? '#FFFFFF' : textColor,
                            fontWeight: year === tempDate.getFullYear() ? 'bold' : 'normal',
                            fontSize: year === tempDate.getFullYear() ? 18 : 16,
                          }
                        ]}
                      >
                        {year}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              /* Vista normal del calendario */
              <>
                {/* Navegación de mes */}
                <View style={styles.monthNavigation}>
                  <TouchableOpacity 
                    onPress={() => handleMonthChange('prev')}
                    style={styles.navButton}
                  >
                    <ThemedText style={{ color: textColor, fontSize: 20, fontWeight: 'bold' }}>‹</ThemedText>
                  </TouchableOpacity>
                  
                  <ThemedText style={[styles.monthYear, { color: textColor }]}>
                    {`${months[tempDate.getMonth()]} ${tempDate.getFullYear()}`}
                  </ThemedText>
                  
                  <TouchableOpacity 
                    onPress={() => handleMonthChange('next')}
                    style={styles.navButton}
                  >
                    <ThemedText style={{ color: textColor, fontSize: 20, fontWeight: 'bold' }}>›</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Días de la semana */}
                <View style={styles.weekDaysContainer}>
                  {daysOfWeek.map((day, index) => (
                    <View key={index} style={styles.weekDayItem}>
                      <ThemedText style={[styles.weekDayText, { color: textColor }]}>
                        {day}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                {/* Calendario */}
                <View style={styles.calendarContainer}>
                  {renderCalendar().map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayItem,
                        day === tempDate.getDate() && { backgroundColor: primaryColor },
                      ]}
                      onPress={() => day && handleDateSelect(day)}
                      disabled={!day}
                    >
                      {day && (
                        <ThemedText 
                          style={[
                            styles.dayText,
                            { 
                              color: day === tempDate.getDate() ? '#FFFFFF' : textColor 
                            }
                          ]}
                        >
                          {day}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <ThemedText style={[styles.buttonText, { color: primaryColor }]}>
                  CANCEL
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleConfirm} style={styles.okButton}>
                <ThemedText style={[styles.buttonText, { color: primaryColor }]}>
                  OK
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 8,
    borderWidth: 1,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '500',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  weekDayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dayItem: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  okButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  yearSelectorContainer: {
    height: 300,
    paddingHorizontal: 20,
  },
  yearsList: {
    flex: 1,
  },
  yearItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 4,
    marginVertical: 2,
  },
  yearItemText: {
    fontSize: 16,
  },
});
