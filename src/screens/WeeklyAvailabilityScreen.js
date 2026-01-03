import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { getMentorWeeklyAvailability, getUserById } from '../utils/database';
import { format, startOfWeek, addDays, getDay } from 'date-fns';
import NavigationTabs from '../components/NavigationTabs';
import { ClockIcon, BackArrowIcon } from '../components/Icons';
import LoadingIndicator from '../components/LoadingIndicator';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const WeeklyAvailabilityScreen = ({ mentorId, onSlotSelected, activeTab, onTabPress }) => {
  const [mentor, setMentor] = useState(null);
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    const mentorData = getUserById(mentorId);
    setMentor(mentorData);
    
    const availability = getMentorWeeklyAvailability(mentorId);
    
    const grouped = availability.reduce((acc, slot) => {
      if (!acc[slot.day_of_week]) {
        acc[slot.day_of_week] = [];
      }
      
      const exists = acc[slot.day_of_week].some(
        s => s.slot_start === slot.slot_start && s.slot_end === slot.slot_end
      );
      
      if (!exists) {
        acc[slot.day_of_week].push(slot);
      }
      
      return acc;
    }, {});

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const dates = [];
    
    for (let i = 0; i < 5; i++) {
      const date = addDays(weekStart, i);
      dates.push({
        date,
        dateStr: format(date, 'yyyy-MM-dd'),
        dayName: dayNames[i],
        display: format(date, 'EEE, MMM d'),
        slots: grouped[dayNames[i]] || []
      });
    }
    
    setWeekDates(dates);
  }, [mentorId]);

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  if (!mentor) {
    return (
      <View style={styles.container}>
        <NavigationTabs activeTab={activeTab} onTabPress={onTabPress} />
        <LoadingIndicator />
      </View>
    );
  }

  const timezoneAbbr = mentor.timezone === 'Asia/Kolkata' ? 'IST' : 
                       mentor.timezone === 'Brazil/Sao_Paulo' ? 'BRT' : 'EST';

  return (
    <View style={styles.container}>
      <NavigationTabs activeTab={activeTab} onTabPress={onTabPress} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <BackArrowIcon size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Mentor Availability</Text>
        </View>

        <View style={styles.mentorInfo}>
          <View style={styles.avatar} />
          <View style={styles.mentorDetails}>
            <Text style={styles.mentorName}>{mentor.name}</Text>
            <Text style={styles.mentorRole}>Computer Science</Text>
          </View>
        </View>

        <View style={styles.weekHeader}>
          <Text style={styles.weekText}>
            Week of {format(weekDates[0]?.date || new Date(), 'MMM d')} - {format(weekDates[4]?.date || new Date(), 'MMM d')}
          </Text>
          <Text style={styles.timezoneText}>{timezoneAbbr}</Text>
        </View>

        {weekDates.map((dayData, index) => (
          <View key={index} style={styles.dayCard}>
            <Text style={styles.dayTitle}>{dayData.display}</Text>
            {dayData.slots.length === 0 ? (
              <Text style={styles.noSlotsText}>No slots</Text>
            ) : (
              <View style={styles.slotsContainer}>
                {dayData.slots
                  .sort((a, b) => a.slot_start.localeCompare(b.slot_start))
                  .map((slot, slotIndex) => (
                    <View key={slotIndex} style={styles.slotButton}>
                      <ClockIcon size={14} color="#333" style={styles.clockIconStyle} />
                      <Text style={styles.slotTime}>{formatTime(slot.slot_start)}</Text>
                    </View>
                  ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Viewing read-only schedule. Select a time slot from the booking screen to schedule a session.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallScreen ? 12 : 16,
    paddingTop: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Inter, sans-serif',
  },
  mentorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  mentorDetails: {
    flex: 1,
  },
  mentorName: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Inter, sans-serif',
  },
  mentorRole: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#666',
    fontFamily: 'Inter, sans-serif',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingBottom: 12,
  },
  weekText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter, sans-serif',
  },
  timezoneText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#666',
    fontFamily: 'Inter, sans-serif',
  },
  dayCard: {
    backgroundColor: '#fff',
    marginHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: 12,
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dayTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Inter, sans-serif',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  clockIconStyle: {
    marginRight: 6,
  },
  slotTime: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  noSlotsText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#999',
    fontStyle: 'italic',
    fontFamily: 'Inter, sans-serif',
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    marginHorizontal: isSmallScreen ? 12 : 16,
    marginTop: 8,
    marginBottom: 24,
    padding: isSmallScreen ? 10 : 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#666',
    lineHeight: 18,
    fontFamily: 'Inter, sans-serif',
  },
});

export default WeeklyAvailabilityScreen;

