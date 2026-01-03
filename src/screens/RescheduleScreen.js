import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { getUserById } from '../utils/database';
import { format } from 'date-fns';
import NavigationTabs from '../components/NavigationTabs';
import { CalendarIcon, ClockIcon, AlertIcon, BackArrowIcon } from '../components/Icons';
import LoadingIndicator from '../components/LoadingIndicator';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const RescheduleScreen = ({ conflictData, onReschedule, onCancel, activeTab, onTabPress }) => {
  const [mentor, setMentor] = useState(null);
  const [selectedNewDate, setSelectedNewDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    if (conflictData?.mentorId) {
      const mentorData = getUserById(conflictData.mentorId);
      setMentor(mentorData);
    }

    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + daysToMonday + i);
      
      if (!isNaN(date.getTime())) {
        try {
          dates.push({
            dateStr: format(date, 'yyyy-MM-dd'),
            dateObj: date,
            dayShort: format(date, 'EEE').substring(0, 3)
          });
        } catch (e) {
          console.error('Date formatting error:', e);
        }
      }
    }
    setAvailableDates(dates);
  }, [conflictData]);

  if (!conflictData || !conflictData.date || !conflictData.slot) {
    return (
      <View style={styles.container}>
        <NavigationTabs activeTab={activeTab} onTabPress={onTabPress} />
        <LoadingIndicator />
      </View>
    );
  }

  const { date, slot, conflict } = conflictData;
  
  let formattedDate = 'Date not available';
  try {
    const dateObj = new Date(`${date}T00:00:00`);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');
    }
  } catch (e) {
    console.error('Date formatting error:', e);
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Time not available';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      if (isNaN(hour)) return timeStr;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${String(hour12).padStart(2, '0')}:${minutes || '00'} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const timezoneDisplay = mentor?.timezone === 'Asia/Kolkata' ? 'IST' :
                          mentor?.timezone === 'Brazil/Sao_Paulo' ? 'BRT' : 'EST';

  return (
    <View style={styles.container}>
      <NavigationTabs activeTab={activeTab} onTabPress={onTabPress} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <BackArrowIcon size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Reschedule Session</Text>
        </View>

        <View style={styles.currentBookingCard}>
          <Text style={styles.cardTitle}>Current booking</Text>
          <View style={styles.mentorSection}>
            <View style={styles.avatar} />
            <View style={styles.mentorInfo}>
              <Text style={styles.mentorName}>{mentor?.name || 'Mentor'}</Text>
              <Text style={styles.mentorRole}>Computer Science</Text>
            </View>
          </View>
          <View style={styles.bookingDetails}>
            <View style={styles.bookingDetailRow}>
              <CalendarIcon size={18} color="#333" style={styles.bookingIconStyle} />
              <Text style={styles.bookingText}>{formattedDate}</Text>
            </View>
            <View style={styles.bookingDetailRow}>
              <ClockIcon size={18} color="#333" style={styles.bookingIconStyle} />
              <Text style={styles.bookingText}>
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)} {timezoneDisplay}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.alertBox}>
          <View style={styles.alertIconContainer}>
            <AlertIcon size={16} color="#fff" />
          </View>
          <Text style={styles.alertText}>
            Your mentor will be notified of the reschedule request.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={18} color="#333" style={styles.calendarIconStyle} />
            <Text style={styles.sectionTitle}>Select New Date</Text>
          </View>
          <View style={styles.datesContainer}>
            {availableDates.map((dateItem, index) => {
              // Mark Wednesday as disabled (as shown in Figma)
              const isDisabled = dateItem.dayShort === 'Wed';
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateButton,
                    selectedNewDate === dateItem.dateStr && styles.dateButtonSelected,
                    isDisabled && styles.dateButtonDisabled
                  ]}
                  onPress={() => !isDisabled && setSelectedNewDate(dateItem.dateStr)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[
                      styles.dateButtonText,
                      selectedNewDate === dateItem.dateStr && styles.dateButtonTextSelected,
                      isDisabled && styles.dateButtonTextDisabled
                    ]}
                  >
                    {dateItem.dayShort}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              !selectedNewDate && styles.buttonDisabled
            ]}
            onPress={onReschedule}
            disabled={!selectedNewDate}
          >
            <Text style={[
              styles.confirmButtonText,
              !selectedNewDate && styles.buttonTextDisabled
            ]}>
              Confirm Reschedule
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
  currentBookingCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: isSmallScreen ? 16 : 20,
    marginHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Inter, sans-serif',
  },
  mentorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  mentorInfo: {
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
  bookingDetails: {
    gap: 12,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingIconStyle: {
    marginRight: 12,
  },
  bookingText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#333',
    fontFamily: 'Inter, sans-serif',
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  alertIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertText: {
    flex: 1,
    fontSize: isSmallScreen ? 12 : 14,
    color: '#856404',
    lineHeight: 20,
    fontFamily: 'Inter, sans-serif',
  },
  section: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarIconStyle: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter, sans-serif',
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonSelected: {
    borderColor: '#7B2CBF',
    backgroundColor: '#f3e8ff',
  },
  dateButtonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.5,
  },
  dateButtonText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  dateButtonTextSelected: {
    color: '#7B2CBF',
    fontWeight: '600',
  },
  dateButtonTextDisabled: {
    color: '#999',
  },
  buttonContainer: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: 32,
    gap: 12,
  },
  button: {
    padding: isSmallScreen ? 14 : 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#e0e0e0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#333',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});

export default RescheduleScreen;
