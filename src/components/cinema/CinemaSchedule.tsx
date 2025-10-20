import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { IconSymbol } from '../ui/IconSymbol';
import { MovieSchedule, Showtime } from '@/src/types';

interface CinemaScheduleProps {
  schedule: MovieSchedule;
  isUserCinema: boolean;
  onShowtimeSelect: (showtime: Showtime) => void;
}

export default function CinemaSchedule({ 
  schedule, 
  isUserCinema, 
  onShowtimeSelect 
}: CinemaScheduleProps) {
  const [isExpanded, setIsExpanded] = useState(isUserCinema);
  const textColor = useThemeColor({}, 'text');

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <View style={styles.container}>
      {/* Header del cine */}
      <TouchableOpacity 
        style={styles.cinemaHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.cinemaInfo}>
          <View style={styles.heartIcon}>
            <IconSymbol name="heart" size={16} color="#2F64BA" />
          </View>
          <View style={styles.cinemaDetails}>
            <ThemedText style={[styles.cinemaName, { color: textColor }]}>
              {schedule.cinemaName}
            </ThemedText>
            <ThemedText style={styles.cinemaAddress}>
              {schedule.cinemaId === 'cp-alcazar' ? 'Av. Santa Cruz 814-816 Miraflores Lima Lima' :
               schedule.cinemaId === 'cp-brasil' ? 'Av. Brasil 714 - 792 Piso 3  Breña Lima Lima' :
               'Jr. Carlos Zavala 148 Lima Lima Lima'}
            </ThemedText>
          </View>
        </View>
        <IconSymbol 
          name={isExpanded ? "minus" : "plus"} 
          size={24} 
          color="#2F64BA" 
        />
      </TouchableOpacity>

      {/* Horarios */}
      {isExpanded && (
        <View style={styles.scheduleContainer}>
          <View style={styles.formatHeader}>
            <ThemedText style={[styles.formatText, { color: textColor }]}>
              3D, REGULAR, SUBTITULAD
            </ThemedText>
          </View>
          
          <View style={styles.showtimesContainer}>
            {schedule.showtimes.map((showtime) => (
              <TouchableOpacity
                key={showtime.id}
                style={styles.showtimeButton}
                onPress={() => onShowtimeSelect(showtime)}
              >
                <ThemedText style={styles.showtimeText}>
                  {formatTime(showtime.time)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cinemaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  cinemaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  heartIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  cinemaDetails: {
    flex: 1,
  },
  cinemaName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cinemaAddress: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  scheduleContainer: {
    padding: 16,
  },
  formatHeader: {
    marginBottom: 12,
  },
  formatText: {
    fontSize: 14,
    fontWeight: '600',
  },
  showtimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  showtimeButton: {
    borderWidth: 1,
    borderColor: '#2F64BA',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  showtimeText: {
    color: '#2F64BA',
    fontSize: 14,
    fontWeight: '600',
  },
});