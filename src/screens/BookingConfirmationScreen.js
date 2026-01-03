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
import { CalendarIcon, ClockIcon, LocationIcon, CheckIcon, CloseIcon } from '../components/Icons';
import LoadingIndicator from '../components/LoadingIndicator';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const BookingConfirmationScreen = ({ bookingData, onDone, activeTab, onTabPress }) => {
  const [mentor, setMentor] = useState(null);
  const [mentee, setMentee] = useState(null);

  useEffect(() => {
    if (bookingData) {
      const mentorData = getUserById(bookingData.mentorId);
      const menteeData = getUserById(bookingData.menteeId);
      setMentor(mentorData);
      setMentee(menteeData);
    }
  }, [bookingData]);

  if (!bookingData || !mentor || !mentee) {
    return (
      <View style={styles.container}>
        <NavigationTabs activeTab={activeTab} onTabPress={onTabPress} />
        <LoadingIndicator />
      </View>
    );
  }

  const { date, slot, mentorTimezone } = bookingData;
  const dateObj = new Date(`${date}T00:00:00`);
  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const timezoneDisplay = mentorTimezone === 'Asia/Kolkata' ? 'Indian Standard Time (IST)' :
                          mentorTimezone === 'Brazil/Sao_Paulo' ? 'Brasília Time (BRT)' : 
                          'Eastern Standard Time (EST)';

  return (
    <View style={styles.container}>
      <NavigationTabs activeTab={activeTab} onTabPress={onTabPress} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Booking Confirmed</Text>
          <TouchableOpacity onPress={onDone}>
            <CloseIcon size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmarkCircle}>
              <CheckIcon size={48} color="#fff" />
            </View>
          </View>

          <Text style={styles.confirmationTitle}>Your session is confirmed</Text>

          <View style={styles.bookingCard}>
            <View style={styles.mentorSection}>
              <View style={styles.avatar} />
              <View style={styles.mentorInfo}>
                <Text style={styles.mentorName}>{mentor.name}</Text>
                <Text style={styles.mentorRole}>Computer Science Mentor</Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <CalendarIcon size={20} color="#666" style={styles.detailIconStyle} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formattedDate}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <ClockIcon size={20} color="#666" style={styles.detailIconStyle} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <LocationIcon size={20} color="#666" style={styles.detailIconStyle} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Timezone</Text>
                  <Text style={styles.detailValue}>{timezoneDisplay}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.meetingLinkCard}>
            <Text style={styles.meetingLinkLabel}>Meeting link</Text>
            <Text style={styles.meetingLink}>meet.example.com/session-abc123</Text>
          </View>

          <View style={styles.reminderCard}>
            <Text style={styles.reminderText}>
              A calendar invite has been sent to your email. You'll receive a reminder 24 hours before the session.
            </Text>
          </View>

          <TouchableOpacity style={styles.addCalendarButton}>
            <Text style={styles.addCalendarButtonText}>Add to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewSessionsButton} onPress={onDone}>
            <Text style={styles.viewSessionsButtonText}>View My Sessions</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isSmallScreen ? 12 : 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Inter, sans-serif',
  },
  content: {
    padding: isSmallScreen ? 12 : 16,
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginBottom: 16,
  },
  checkmarkCircle: {
    width: isSmallScreen ? 70 : 80,
    height: isSmallScreen ? 70 : 80,
    borderRadius: isSmallScreen ? 35 : 40,
    backgroundColor: '#7B2CBF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Inter, sans-serif',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isSmallScreen ? 16 : 20,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mentorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: isSmallScreen ? 45 : 50,
    height: isSmallScreen ? 45 : 50,
    borderRadius: isSmallScreen ? 22.5 : 25,
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
  detailsSection: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIconStyle: {
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Inter, sans-serif',
  },
  detailValue: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  meetingLinkCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  meetingLinkLabel: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Inter, sans-serif',
  },
  meetingLink: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#7B2CBF',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  reminderCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: isSmallScreen ? 12 : 16,
    width: '100%',
    marginBottom: 24,
  },
  reminderText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Inter, sans-serif',
  },
  addCalendarButton: {
    backgroundColor: '#7B2CBF',
    padding: isSmallScreen ? 14 : 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCalendarButtonText: {
    color: '#fff',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  viewSessionsButton: {
    backgroundColor: '#fff',
    padding: isSmallScreen ? 14 : 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7B2CBF',
    marginBottom: 32,
  },
  viewSessionsButtonText: {
    color: '#7B2CBF',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
});

export default BookingConfirmationScreen;
