import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import WeeklyAvailabilityScreen from './screens/WeeklyAvailabilityScreen';
import DateSlotSelectionScreen from './screens/DateSlotSelectionScreen';
import BookingConfirmationScreen from './screens/BookingConfirmationScreen';
import RescheduleScreen from './screens/RescheduleScreen';
import EmptyStateScreen from './screens/EmptyStateScreen';
import { createBooking, updateDraftBooking } from './utils/database';

const SCREEN_STATES = {
  WEEKLY_AVAILABILITY: 'weekly_availability',
  DATE_SELECTION: 'date_selection',
  CONFIRMATION: 'confirmation',
  RESCHEDULE: 'reschedule',
  EMPTY_STATE: 'empty_state'
};

const TAB_NAMES = {
  AVAILABILITY: 'Availability',
  BOOKING: 'Booking',
  CONFIRMATION: 'Confirmation',
  RESCHEDULE: 'Reschedule',
  EMPTY_STATE: 'Empty State'
};

const App = () => {
  const [currentScreen, setCurrentScreen] = useState(SCREEN_STATES.WEEKLY_AVAILABILITY);
  const [bookingData, setBookingData] = useState(null);
  const [conflictData, setConflictData] = useState(null);
  
  const MENTOR_ID = 'mentor_01';
  const MENTEE_ID = 'mentee_01';

  const screenToTabMap = {
    [SCREEN_STATES.WEEKLY_AVAILABILITY]: TAB_NAMES.AVAILABILITY,
    [SCREEN_STATES.DATE_SELECTION]: TAB_NAMES.BOOKING,
    [SCREEN_STATES.CONFIRMATION]: TAB_NAMES.CONFIRMATION,
    [SCREEN_STATES.RESCHEDULE]: TAB_NAMES.RESCHEDULE,
    [SCREEN_STATES.EMPTY_STATE]: TAB_NAMES.EMPTY_STATE
  };

  const tabToScreenMap = {
    [TAB_NAMES.AVAILABILITY]: SCREEN_STATES.WEEKLY_AVAILABILITY,
    [TAB_NAMES.BOOKING]: SCREEN_STATES.DATE_SELECTION,
    [TAB_NAMES.CONFIRMATION]: SCREEN_STATES.CONFIRMATION,
    [TAB_NAMES.RESCHEDULE]: SCREEN_STATES.RESCHEDULE,
    [TAB_NAMES.EMPTY_STATE]: SCREEN_STATES.EMPTY_STATE
  };

  const getActiveTab = () => screenToTabMap[currentScreen] || TAB_NAMES.AVAILABILITY;

  const handleTabPress = (tabName) => {
    if (tabName === TAB_NAMES.CONFIRMATION && !bookingData) return;
    
    if (tabName === TAB_NAMES.RESCHEDULE && !conflictData) {
      setConflictData({
        mentorId: MENTOR_ID,
        date: '2025-01-10',
        slot: { startTime: '14:00', endTime: '15:00' },
        conflict: { hasConflict: true, reason: 'overlapping_booking' }
      });
    }
    
    const targetScreen = tabToScreenMap[tabName];
    if (targetScreen) {
      setCurrentScreen(targetScreen);
    }
  };

  const handleViewAvailability = () => {
    setCurrentScreen(SCREEN_STATES.DATE_SELECTION);
  };

  const handleSlotConfirmed = (data) => {
    setBookingData(data);
    
    updateDraftBooking({
      mentor_id: data.mentorId,
      mentee_id: data.menteeId,
      selected_date: data.date,
      slot_start: data.slot.startTime,
      slot_end: data.slot.endTime
    });

    try {
      createBooking({
        mentor_id: data.mentorId,
        mentee_id: data.menteeId,
        start_datetime: `${data.date}T${data.slot.startTime}:00`,
        end_datetime: `${data.date}T${data.slot.endTime}:00`
      });
      setCurrentScreen(SCREEN_STATES.CONFIRMATION);
    } catch (error) {
      setCurrentScreen(SCREEN_STATES.EMPTY_STATE);
    }
  };

  const handleConflictDetected = (data) => {
    setConflictData(data);
    setCurrentScreen(SCREEN_STATES.RESCHEDULE);
  };

  const handleReschedule = () => {
    setConflictData(null);
    setCurrentScreen(SCREEN_STATES.DATE_SELECTION);
  };

  const handleCancel = () => {
    setConflictData(null);
    setBookingData(null);
    setCurrentScreen(SCREEN_STATES.WEEKLY_AVAILABILITY);
  };

  const handleDone = () => {
    setBookingData(null);
    setCurrentScreen(SCREEN_STATES.WEEKLY_AVAILABILITY);
  };

  const renderScreen = () => {
    const activeTab = getActiveTab();
    const commonProps = { activeTab, onTabPress: handleTabPress };

    switch (currentScreen) {
      case SCREEN_STATES.WEEKLY_AVAILABILITY:
        return (
          <WeeklyAvailabilityScreen
            mentorId={MENTOR_ID}
            onSlotSelected={handleViewAvailability}
            {...commonProps}
          />
        );

      case SCREEN_STATES.DATE_SELECTION:
        return (
          <DateSlotSelectionScreen
            mentorId={MENTOR_ID}
            menteeId={MENTEE_ID}
            onSlotConfirmed={handleSlotConfirmed}
            onConflictDetected={handleConflictDetected}
            {...commonProps}
          />
        );

      case SCREEN_STATES.CONFIRMATION:
        return (
          <BookingConfirmationScreen
            bookingData={bookingData}
            onDone={handleDone}
            {...commonProps}
          />
        );

      case SCREEN_STATES.RESCHEDULE:
        return (
          <RescheduleScreen
            conflictData={{ ...conflictData, mentorId: MENTOR_ID }}
            onReschedule={handleReschedule}
            onCancel={handleCancel}
            {...commonProps}
          />
        );

      case SCREEN_STATES.EMPTY_STATE:
        return (
          <EmptyStateScreen
            message="No slots are currently available. Please try selecting a different date."
            onRetry={handleReschedule}
            showRetry={true}
            {...commonProps}
          />
        );

      default:
        return (
          <WeeklyAvailabilityScreen
            mentorId={MENTOR_ID}
            onSlotSelected={handleViewAvailability}
            {...commonProps}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});

export default App;
