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
import { getAvailableSlotsForDate, checkSlotConflict } from '../utils/scheduling';
import { format } from 'date-fns';
import NavigationTabs from '../components/NavigationTabs';
import { CalendarIcon, BackArrowIcon } from '../components/Icons';
import LoadingIndicator from '../components/LoadingIndicator';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const DateSlotSelectionScreen = ({ 
  mentorId, 
  menteeId, 
  onSlotConfirmed,
  onConflictDetected,
  activeTab,
  onTabPress
}) => {
  const [mentor, setMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const mentorData = getUserById(mentorId);
    setMentor(mentorData);
    
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + daysToMonday + i);
      dates.push({
        dateStr: format(date, 'yyyy-MM-dd'),
        dateObj: date,
        display: format(date, 'MMM d'),
        dayName: format(date, 'EEE'),
        dayShort: format(date, 'EEE').substring(0, 3)
      });
    }
    setAvailableDates(dates);
  }, [mentorId]);

  const handleDateSelect = (dateStr, isAvailable) => {
    if (!isAvailable) return;
    
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setErrorMessage(null);
    setCurrentStep(2);
    
    if (mentor) {
      const slots = getAvailableSlotsForDate(mentorId, dateStr, mentor.timezone);
      setAvailableSlots(slots);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot || !mentor) return;

    setErrorMessage(null);

    const conflict = checkSlotConflict(
      mentorId,
      selectedDate,
      selectedSlot.startTime,
      selectedSlot.endTime,
      mentor.timezone
    );

    if (conflict.hasConflict) {
      const conflictReason = conflict.reason === 'overlapping_booking' 
        ? 'This time slot conflicts with an existing booking. Please select a different time.'
        : conflict.conflictingOverride?.reason || 'Mentor is unavailable for this time slot. Please select a different time.';
      
      setErrorMessage(conflictReason);
      onConflictDetected({
        date: selectedDate,
        slot: selectedSlot,
        conflict
      });
    } else {
      onSlotConfirmed({
        mentorId,
        menteeId,
        date: selectedDate,
        slot: selectedSlot,
        mentorTimezone: mentor.timezone
      });
    }
  };

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

  const datesWithAvailability = availableDates.map(date => {
    const slots = getAvailableSlotsForDate(mentorId, date.dateStr, mentor.timezone);
    return { ...date, hasSlots: slots.length > 0 };
  });

  const timezoneDisplay = mentor.timezone === 'Asia/Kolkata' ? 'IST (UTC+5:30)' :
                         mentor.timezone === 'Brazil/Sao_Paulo' ? 'BRT (UTC-3)' : 'EST (UTC-5)';

  return (
    <View style={styles.container}>
      <NavigationTabs activeTab={activeTab} onTabPress={onTabPress} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <BackArrowIcon size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Book a Session</Text>
        </View>

        <View style={styles.mentorInfo}>
          <View style={styles.avatar} />
          <View style={styles.mentorDetails}>
            <Text style={styles.mentorName}>{mentor.name}</Text>
            <Text style={styles.sessionDuration}>60 min session</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, currentStep >= 1 && styles.progressStepActive]}>
            <View style={[styles.progressCircle, currentStep >= 1 && styles.progressCircleActive]}>
              <Text style={[styles.progressNumber, currentStep >= 1 && styles.progressNumberActive]}>1</Text>
            </View>
            <Text style={[styles.progressLabel, currentStep >= 1 && styles.progressLabelActive]}>Date</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={[styles.progressStep, currentStep >= 2 && styles.progressStepActive]}>
            <View style={[styles.progressCircle, currentStep >= 2 && styles.progressCircleActive]}>
              <Text style={[styles.progressNumber, currentStep >= 2 && styles.progressNumberActive]}>2</Text>
            </View>
            <Text style={[styles.progressLabel, currentStep >= 2 && styles.progressLabelActive]}>Time</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={18} color="#333" style={styles.calendarIconStyle} />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
            <View style={styles.datesContainer}>
              {datesWithAvailability.map((date) => (
                <TouchableOpacity
                  key={date.dateStr}
                  style={[
                    styles.dateCard,
                    selectedDate === date.dateStr && styles.dateCardSelected,
                    !date.hasSlots && styles.dateCardDisabled
                  ]}
                  onPress={() => handleDateSelect(date.dateStr, date.hasSlots)}
                  disabled={!date.hasSlots}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      selectedDate === date.dateStr && styles.dateDaySelected,
                      !date.hasSlots && styles.dateDayDisabled
                    ]}
                  >
                    {date.dayShort}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      selectedDate === date.dateStr && styles.dateTextSelected,
                      !date.hasSlots && styles.dateTextDisabled
                    ]}
                  >
                    {date.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {selectedDate && currentStep === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            {availableSlots.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No slots available for this date</Text>
              </View>
            ) : (
              <View style={styles.slotsContainer}>
                {availableSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slotCard,
                      selectedSlot?.startTime === slot.startTime && styles.slotCardSelected
                    ]}
                    onPress={() => handleSlotSelect(slot)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        selectedSlot?.startTime === slot.startTime && styles.slotTextSelected
                      ]}
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.timezoneInfo}>
          <Text style={styles.timezoneText}>Timezone: {timezoneDisplay}</Text>
        </View>

        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedDate || !selectedSlot) && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={!selectedDate || !selectedSlot}
        >
          <Text style={[
            styles.confirmButtonText,
            (!selectedDate || !selectedSlot) && styles.confirmButtonTextDisabled
          ]}>
            Confirm Booking
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingBottom: 16,
  },
  avatar: {
    width: isSmallScreen ? 45 : 50,
    height: isSmallScreen ? 45 : 50,
    borderRadius: isSmallScreen ? 22.5 : 25,
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
  sessionDuration: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#666',
    fontFamily: 'Inter, sans-serif',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressStepActive: {
    // Active state styling
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCircleActive: {
    backgroundColor: '#7B2CBF',
  },
  progressNumber: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#999',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  progressNumberActive: {
    color: '#fff',
  },
  progressLabel: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#999',
    fontFamily: 'Inter, sans-serif',
  },
  progressLabelActive: {
    color: '#333',
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  datesScroll: {
    marginHorizontal: -16,
  },
  datesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  dateCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateCardSelected: {
    borderColor: '#7B2CBF',
    backgroundColor: '#f3e8ff',
  },
  dateCardDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.5,
  },
  dateDay: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Inter, sans-serif',
  },
  dateDaySelected: {
    color: '#7B2CBF',
    fontWeight: '600',
  },
  dateDayDisabled: {
    color: '#999',
  },
  dateText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  dateTextSelected: {
    color: '#7B2CBF',
    fontWeight: '600',
  },
  dateTextDisabled: {
    color: '#999',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotCard: {
    backgroundColor: '#f5f5f5',
    padding: isSmallScreen ? 10 : 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  slotCardSelected: {
    borderColor: '#7B2CBF',
    backgroundColor: '#f3e8ff',
  },
  slotText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#333',
    fontFamily: 'Inter, sans-serif',
  },
  slotTextSelected: {
    color: '#7B2CBF',
    fontWeight: '600',
  },
  emptyState: {
    padding: isSmallScreen ? 20 : 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#999',
    fontFamily: 'Inter, sans-serif',
  },
  timezoneInfo: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: 16,
  },
  timezoneText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#666',
    fontFamily: 'Inter, sans-serif',
  },
  confirmButton: {
    backgroundColor: '#7B2CBF',
    padding: isSmallScreen ? 14 : 16,
    marginHorizontal: isSmallScreen ? 12 : 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  confirmButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  confirmButtonTextDisabled: {
    color: '#999',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: isSmallScreen ? 12 : 14,
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
  },
});

export default DateSlotSelectionScreen;
