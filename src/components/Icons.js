import React from 'react';
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiAlertTriangle, 
  FiCheck, 
  FiX, 
  FiBell,
  FiChevronLeft
} from 'react-icons/fi';

export const CalendarIcon = ({ size = 20, color = '#333', style }) => (
  <FiCalendar size={size} color={color} style={style} />
);

export const ClockIcon = ({ size = 20, color = '#333', style }) => (
  <FiClock size={size} color={color} style={style} />
);

export const LocationIcon = ({ size = 20, color = '#333', style }) => (
  <FiMapPin size={size} color={color} style={style} />
);

export const AlertIcon = ({ size = 20, color = '#fff', style }) => (
  <FiAlertTriangle size={size} color={color} style={style} />
);

export const CheckIcon = ({ size = 48, color = '#fff', style }) => (
  <FiCheck size={size} color={color} style={style} />
);

export const CloseIcon = ({ size = 24, color = '#666', style }) => (
  <FiX size={size} color={color} style={style} />
);

export const BellIcon = ({ size = 18, color = '#fff', style }) => (
  <FiBell size={size} color={color} style={style} />
);

export const BackArrowIcon = ({ size = 24, color = '#333', style }) => (
  <FiChevronLeft size={size} color={color} style={style} />
);
