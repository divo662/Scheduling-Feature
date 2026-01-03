import { format, parseISO } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { isBefore, isAfter, isEqual } from 'date-fns';

export const createDateInTimezone = (dateStr, timeStr, timezone) => {
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  return zonedTimeToUtc(dateTimeStr, timezone);
};

export const convertToTimezone = (date, timezone) => {
  return utcToZonedTime(date, timezone);
};

export const formatInTimezone = (date, formatStr, timezone) => {
  const zonedDate = utcToZonedTime(date, timezone);
  return format(zonedDate, formatStr);
};

export const parseISODatetime = (isoString) => {
  return parseISO(isoString);
};

export const slotsOverlap = (start1, end1, start2, end2) => {
  return (
    (isBefore(start1, end2) || isEqual(start1, end2)) &&
    (isAfter(end1, start2) || isEqual(end1, start2))
  );
};

export const getDayOfWeek = (date) => {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[date.getDay()];
};

export const dayOfWeekToNumber = (dayOfWeek) => {
  const days = {
    'SUNDAY': 0,
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6
  };
  return days[dayOfWeek.toUpperCase()] ?? -1;
};
