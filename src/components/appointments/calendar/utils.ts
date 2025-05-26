import { Appointment } from "@/types/appointment";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, addDays, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { START_HOUR, END_HOUR, HOUR_HEIGHT } from "./constants";

// Calculate position and height for appointment display
export const getAppointmentStyle = (appointment: Appointment) => {
  const startHour = appointment.start.getHours();
  const startMinute = appointment.start.getMinutes();
  const endHour = appointment.end.getHours();
  const endMinute = appointment.end.getMinutes();
  
  const startPosition = (startHour - START_HOUR) * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;
  const duration = (endHour - startHour) * HOUR_HEIGHT + ((endMinute - startMinute) / 60) * HOUR_HEIGHT;
  
  return {
    top: `${startPosition}px`,
    height: `${Math.max(duration, 30)}px`, // Minimum height of 30px
    width: 'calc(100% - 8px)',
    left: '4px',
    position: 'absolute' as const,
  };
};

// Generate the week days for the week view
export const generateWeekDays = (selectedDate: Date) => {
  const days = [];
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    days.push(day);
  }
  
  return days;
};

// Generate the month days for the month view
export const generateMonthDays = (selectedDate: Date) => {
  const days = [];
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  let currentDate = startDate;
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return days;
};

// Filter appointments based on the calendar view
export const filterAppointments = (appointments: Appointment[], selectedDate: Date, view: 'day' | 'week' | 'month') => {
  if (view === 'day') {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    return appointments.filter(
      (appointment) => appointment.start >= dayStart && appointment.start <= dayEnd
    );
  } else if (view === 'week') {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return appointments.filter(
      (appointment) => appointment.start >= weekStart && appointment.start <= weekEnd
    );
  } else {
    // Month view
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    return appointments.filter(
      (appointment) => appointment.start >= monthStart && appointment.start <= monthEnd
    );
  }
};

// Generate time slots with 15-minute intervals
export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push({ hour, minute });
    }
  }
  return slots;
};

// Generate hour slots for labels
export const generateHourSlots = () => {
  const slots = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    slots.push(hour);
  }
  return slots;
};

// Format time slot for display
export const formatTimeSlot = (slot: { hour: number, minute: number }) => {
  const hour12 = slot.hour % 12 || 12;
  const ampm = slot.hour < 12 ? 'AM' : 'PM';
  return `${hour12}:${slot.minute.toString().padStart(2, '0')} ${ampm}`;
};
