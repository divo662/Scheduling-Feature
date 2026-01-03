# Dreamverse Scheduling Feature

A React Native implementation of a one-on-one call scheduling feature for mentors and mentees in an edtech mobile app. This project focuses on frontend logic and state management for handling mentor availability, booking conflicts, and timezone-aware scheduling.

## Overview

This scheduling system allows mentees to view mentor availability, select available time slots, and handles conflict detection when booking sessions. The implementation emphasizes clean state management, calendar reasoning, and edge case handling.

## Features

- **Weekly Availability Display**: Shows mentor's recurring weekly availability slots organized by day
- **Date & Slot Selection**: Allows mentees to select a specific date and available time slot
- **Conflict Detection**: Automatically detects overlapping bookings and mentor unavailability
- **Reschedule Flow**: Handles conflicts by showing reschedule screen with conflict details
- **Empty State Handling**: Displays appropriate messages when no slots are available
- **Timezone Support**: Full timezone handling using date-fns-tz for accurate scheduling across timezones

## Project Structure

```
dreamverse/
├── src/
│   ├── screens/
│   │   ├── WeeklyAvailabilityScreen.js
│   │   ├── DateSlotSelectionScreen.js
│   │   ├── BookingConfirmationScreen.js
│   │   ├── RescheduleScreen.js
│   │   └── EmptyStateScreen.js
│   ├── components/
│   │   ├── NavigationTabs.js
│   │   ├── Icons.js
│   │   └── LoadingIndicator.js
│   ├── utils/
│   │   ├── database.js          # Local database service
│   │   ├── timezone.js          # Timezone utilities
│   │   └── scheduling.js        # Core scheduling logic
│   └── App.js                   # Main app component
├── database.json                 # Local database (from spreadsheet)
├── webpack.config.js            # Webpack config for web
├── package.json
└── README.md
```

## Installation

Make sure you have Node.js installed (version 16 or higher).

```bash
npm install
```

## Running the Application

### Web (Recommended for Testing)

```bash
npm run web
```

This will start the webpack dev server and open the app in your browser at `http://localhost:8080`.

### React Native

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## How It Works

### State Management

The app uses a simple state machine pattern for navigation. Main state includes:
- Current screen (weekly_availability, date_selection, confirmation, reschedule, empty_state)
- Booking data (when a slot is selected)
- Conflict data (when a conflict is detected)

All state updates are immutable - we always create new objects rather than mutating existing ones.

### Scheduling Logic

The core scheduling logic lives in `src/utils/scheduling.js`:

- **getAvailableSlotsForDate()**: Takes a mentor ID, date, and timezone, then returns all available slots for that date. It filters out:
  - Slots that don't match the day of week
  - Slots blocked by mentor availability overrides
  - Slots that conflict with existing CONFIRMED bookings (CANCELLED bookings are ignored)

- **checkSlotConflict()**: Validates if a selected slot conflicts with existing bookings or overrides. Returns detailed conflict information including the reason and conflicting booking/override.

- **getAvailableDates()**: Returns all dates in the next N weeks that have available slots.

### Conflict Detection

Conflicts are detected at two levels:

1. **Booking Conflicts**: Checks against all CONFIRMED bookings. Uses `slotsOverlap()` utility to detect any time overlap, including partial overlaps.

2. **Override Conflicts**: Checks against `mentor_availability_overrides` table. These are specific date/time blocks when the mentor is unavailable (e.g., "Emergency leave", "Travel conflict").

If either check finds a conflict, the user is shown the reschedule screen with details about why the slot isn't available.

### Timezone Handling

All date/time operations are timezone-aware. The system:
- Stores slots in the mentor's timezone
- Converts to UTC for conflict comparisons
- Displays times in the mentor's timezone for clarity

This ensures that a mentor in India and a mentee in Brazil can schedule correctly without timezone confusion.

### Edge Cases Handled

- **Duplicate Weekly Slots**: The database has some duplicate entries (e.g., mentor_01 has MONDAY 14:00-15:00 twice). These are automatically deduplicated when displaying and calculating availability.

- **Cancelled Bookings**: CANCELLED bookings are excluded from conflict checks but still stored for audit purposes.

- **Partial Overlaps**: The system detects partial time overlaps, not just exact matches. For example, 14:00-15:00 conflicts with 14:30-15:30.

- **No Availability**: Handles cases where mentors have no weekly availability set, or all slots for a date are booked/blocked.

## Database Schema

The application uses a local JSON database (converted from the provided Excel spreadsheet) with the following structure:

- **users**: Mentor and mentee information with timezones
- **mentor_weekly_availability**: Weekly recurring availability slots
- **bookings**: Existing confirmed and cancelled bookings
- **draft_booking**: Current booking being created
- **mentor_availability_overrides**: Temporary blocks on mentor availability

## Key Design Decisions

### Why Local JSON Instead of Backend?

The task explicitly requires no backend integration. This is intentional - they want to evaluate frontend logic and state management, not database skills. In a production app, these would be API calls.

### Why Simple State Management?

I chose React's built-in useState over Redux or Context API because:
- The state is relatively simple (3 main pieces)
- No need for complex state sharing across many components
- Easier to reason about and debug
- Fits the scope of the task

### Why This Conflict Detection Approach?

Two-level checking (bookings + overrides) ensures we catch all conflicts:
- Weekly availability defines recurring slots
- Overrides can block specific instances
- Both must be checked to prevent double-booking

### Tradeoffs Made

- **Fixed Date Range**: Only shows next week (Mon-Fri). Could be enhanced with a calendar picker, but this keeps it simple and focused.

- **Single Mentor Context**: App assumes one mentor is selected. In production, would have a mentor selection screen first.

- **Synchronous Operations**: All operations are synchronous since there's no backend. In production, would have loading states and error handling for API calls.

## Testing the Features

### Normal Flow
1. Start on Weekly Availability screen - see mentor's slots
2. Click to go to Booking screen
3. Select a date that has available slots
4. Select a time slot
5. Click Confirm Booking
6. See confirmation screen with booking details

### Conflict Detection
1. Try to book a slot that conflicts with an existing booking
2. System detects conflict and shows reschedule screen
3. Reschedule screen shows conflict details
4. Can select a different date or cancel

### Empty State
1. Select a date with no available slots
2. System shows empty state with helpful message
3. Can retry or go back

## Technologies Used

- React Native 0.72.17
- React 18.2.0
- date-fns 2.30.0 (date manipulation)
- date-fns-tz 2.0.0 (timezone handling)
- react-icons 5.5.0 (modern icons)
- React Native Web (for web testing)
- Webpack (for bundling web version)

## Notes

This implementation focuses on frontend logic and state management as specified in the task requirements. The UI matches the provided Figma designs, but the primary focus is on demonstrating:

- Clear frontend state modeling
- Calendar reasoning and edge-case awareness
- Predictable, immutable state updates
- Thoughtful tradeoffs and assumptions

The code is production-ready in terms of structure and logic, but uses local JSON instead of a backend as per task constraints.

## License

This project was created as part of a technical assessment for SparksDream.
