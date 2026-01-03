const database = require('../../database.json');

export const getUsers = () => database.users;

export const getUserById = (userId) => {
  return database.users.find(user => user.user_id === userId);
};

export const getMentorWeeklyAvailability = (mentorId) => {
  return database.mentor_weekly_availability.filter(
    availability => availability.mentor_id === mentorId
  );
};

export const getBookings = (filters = {}) => {
  let bookings = [...database.bookings];
  
  if (filters.mentor_id) {
    bookings = bookings.filter(b => b.mentor_id === filters.mentor_id);
  }
  
  if (filters.mentee_id) {
    bookings = bookings.filter(b => b.mentee_id === filters.mentee_id);
  }
  
  if (filters.status) {
    bookings = bookings.filter(b => b.status === filters.status);
  }
  
  return bookings;
};

export const getDraftBooking = () => database.draft_booking;

export const getMentorAvailabilityOverrides = (mentorId) => {
  return database.mentor_availability_overrides.filter(
    override => override.mentor_id === mentorId
  );
};

export const createBooking = (bookingData) => {
  const newBooking = {
    booking_id: `booking_${String(database.bookings.length + 1).padStart(2, '0')}`,
    ...bookingData,
    status: 'CONFIRMED'
  };
  
  database.bookings.push(newBooking);
  return newBooking;
};

export const updateDraftBooking = (draftData) => {
  database.draft_booking = { ...database.draft_booking, ...draftData };
  return database.draft_booking;
};
