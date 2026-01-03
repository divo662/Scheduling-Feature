import { 
  createDateInTimezone, 
  parseISODatetime, 
  slotsOverlap, 
  getDayOfWeek
} from './timezone';
import { 
  getMentorWeeklyAvailability, 
  getBookings, 
  getMentorAvailabilityOverrides 
} from './database';
import { format as dateFormat, isSameDay } from 'date-fns';

export const getAvailableSlotsForDate = (mentorId, dateStr, mentorTimezone) => {
  const selectedDate = parseISODatetime(`${dateStr}T00:00:00`);
  const dayOfWeek = getDayOfWeek(selectedDate);
  
  const weeklyAvailability = getMentorWeeklyAvailability(mentorId)
    .filter(avail => avail.day_of_week === dayOfWeek);
  
  if (weeklyAvailability.length === 0) {
    return [];
  }
  
  const existingBookings = getBookings({ 
    mentor_id: mentorId, 
    status: 'CONFIRMED' 
  }).filter(booking => {
    const bookingDate = parseISODatetime(booking.start_datetime);
    return isSameDay(bookingDate, selectedDate);
  });
  
  const overrides = getMentorAvailabilityOverrides(mentorId)
    .filter(override => override.date === dateStr);
  
  const availableSlots = [];
  
  weeklyAvailability.forEach(weeklySlot => {
    const slotStart = createDateInTimezone(
      dateStr, 
      weeklySlot.slot_start, 
      mentorTimezone
    );
    const slotEnd = createDateInTimezone(
      dateStr, 
      weeklySlot.slot_end, 
      mentorTimezone
    );
    
    const isBlocked = overrides.some(override => {
      const overrideStart = createDateInTimezone(
        dateStr, 
        override.slot_start, 
        mentorTimezone
      );
      const overrideEnd = createDateInTimezone(
        dateStr, 
        override.slot_end, 
        mentorTimezone
      );
      return slotsOverlap(slotStart, slotEnd, overrideStart, overrideEnd);
    });
    
    if (isBlocked) return;
    
    const hasConflict = existingBookings.some(booking => {
      const bookingStart = parseISODatetime(booking.start_datetime);
      const bookingEnd = parseISODatetime(booking.end_datetime);
      return slotsOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
    });
    
    if (!hasConflict) {
      availableSlots.push({
        start: slotStart,
        end: slotEnd,
        startTime: weeklySlot.slot_start,
        endTime: weeklySlot.slot_end
      });
    }
  });
  
  const uniqueSlots = availableSlots.filter((slot, index, self) =>
    index === self.findIndex(s => 
      s.startTime === slot.startTime && s.endTime === slot.endTime
    )
  );
  
  return uniqueSlots.sort((a, b) => a.start - b.start);
};

export const checkSlotConflict = (mentorId, dateStr, slotStart, slotEnd, mentorTimezone) => {
  const selectedStart = createDateInTimezone(dateStr, slotStart, mentorTimezone);
  const selectedEnd = createDateInTimezone(dateStr, slotEnd, mentorTimezone);
  
  const existingBookings = getBookings({ 
    mentor_id: mentorId, 
    status: 'CONFIRMED' 
  });
  
  const conflictingBooking = existingBookings.find(booking => {
    const bookingStart = parseISODatetime(booking.start_datetime);
    const bookingEnd = parseISODatetime(booking.end_datetime);
    return slotsOverlap(selectedStart, selectedEnd, bookingStart, bookingEnd);
  });
  
  if (conflictingBooking) {
    return {
      hasConflict: true,
      reason: 'overlapping_booking',
      conflictingBooking
    };
  }
  
  const overrides = getMentorAvailabilityOverrides(mentorId)
    .filter(override => override.date === dateStr);
  
  const conflictingOverride = overrides.find(override => {
    const overrideStart = createDateInTimezone(
      dateStr, 
      override.slot_start, 
      mentorTimezone
    );
    const overrideEnd = createDateInTimezone(
      dateStr, 
      override.slot_end, 
      mentorTimezone
    );
    return slotsOverlap(selectedStart, selectedEnd, overrideStart, overrideEnd);
  });
  
  if (conflictingOverride) {
    return {
      hasConflict: true,
      reason: 'mentor_unavailable',
      conflictingOverride
    };
  }
  
  return { hasConflict: false };
};

export const getAvailableDates = (mentorId, mentorTimezone, weeksAhead = 4) => {
  const today = new Date();
  const datesWithSlots = [];
  
  for (let i = 0; i < weeksAhead * 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = dateFormat(date, 'yyyy-MM-dd');
    const slots = getAvailableSlotsForDate(mentorId, dateStr, mentorTimezone);
    
    if (slots.length > 0) {
      datesWithSlots.push({
        date: dateStr,
        dateObj: date,
        slotsCount: slots.length
      });
    }
  }
  
  return datesWithSlots;
};
