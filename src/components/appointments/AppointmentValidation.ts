import { format } from 'date-fns';
import { Appointment } from '@/types/appointment';
import { WORKING_HOURS_START, WORKING_HOURS_END } from "./workingHours";
import { formatTimeSlot } from "./calendar/utils";

/**
 * Validates if an appointment time is valid and doesn't overlap with existing appointments
 */
export const validateAppointmentTime = (
  date: Date, 
  startTime: string, 
  endTime: string, 
  appointments: Appointment[],
  currentAppointmentId?: string
): { isValid: boolean; message: string } => {
  try {
    // Parse the start and end times
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startDate = new Date(date);
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    // If end time is earlier than or equal to start time, assume it's the next day
    if (endDate.getTime() <= startDate.getTime()) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    // Ensure the appointment is at least 15 minutes long
    const minDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
    if (endDate.getTime() - startDate.getTime() < minDuration) {
      return { 
        isValid: false, 
        message: "Appointment must be at least 15 minutes long" 
      };
    }
    
    
// Check if the appointment falls within business hours
    const businessStartDate = new Date(date);
    businessStartDate.setHours(WORKING_HOURS_START.hour, WORKING_HOURS_START.minute, 0, 0);
    
    const businessEndDate = new Date(date);
    businessEndDate.setHours(18, 0, 0, 0); // 6 PM
    
    if (startDate < businessStartDate) {
      return { isValid: false, message: `Appointment cannot start before business hours (${formatTimeSlot(WORKING_HOURS_START)})` };
    }
    
    if (endDate > businessEndDate) {
      return { isValid: false, message: `Appointment cannot end after business hours (${formatTimeSlot(WORKING_HOURS_END)})` };
    }
    
    // Check for overlaps with other appointments
    console.log('Checking for overlaps among', appointments.length, 'appointments');
    
    // Convert startDate and endDate to timestamps for easier comparison
    const newStartTime = startDate.getTime();
    const newEndTime = endDate.getTime();
    console.log('New appointment time range:', {
      start: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
      end: format(endDate, 'yyyy-MM-dd HH:mm:ss'),
      startTimestamp: newStartTime,
      endTimestamp: newEndTime
    });
    
    // Loop through each appointment manually instead of using find
    for (const app of appointments) {
      try {
        // Skip comparing with the current appointment (when editing)
        if (currentAppointmentId && app.id === currentAppointmentId) {
          console.log('Skipping current appointment:', app.id);
          continue;
        }
        
        // Make sure appointment dates are valid
        if (!app.start || !app.end) {
          console.error('Invalid appointment data (missing dates):', app);
          continue;
        }
        
        // Handle both Date objects and string dates
        const appStart = app.start instanceof Date ? app.start : new Date(app.start);
        const appEnd = app.end instanceof Date ? app.end : new Date(app.end);
        
        // Check if the appointment has valid dates
        if (isNaN(appStart.getTime()) || isNaN(appEnd.getTime())) {
          console.error('Invalid date values in appointment:', app);
          continue;
        }
        
        // Check if dates are the same day - only compare date portion
        const appStartDate = new Date(appStart);
        appStartDate.setHours(0, 0, 0, 0);
        const newStartDate = new Date(startDate);
        newStartDate.setHours(0, 0, 0, 0);
        
        if (appStartDate.getTime() !== newStartDate.getTime()) {
          console.log('Different day, skipping:', app.title);
          continue;
        }
        
        // Convert to timestamps for comparison
        const existingStartTime = appStart.getTime();
        const existingEndTime = appEnd.getTime();
        
        console.log('Comparing with existing appointment:', {
          id: app.id,
          title: app.title,
          start: format(appStart, 'yyyy-MM-dd HH:mm:ss'),
          end: format(appEnd, 'yyyy-MM-dd HH:mm:ss'),
          startTimestamp: existingStartTime,
          endTimestamp: existingEndTime
        });
        
        // Proper overlap detection logic:
        // Two time ranges [a,b] and [c,d] overlap if: a < d AND c < b
        // Back-to-back appointments are NOT considered overlapping
        const hasOverlap = (
          // New appointment starts before existing ends AND
          (newStartTime < existingEndTime) && 
          // Existing appointment starts before new ends
          (existingStartTime < newEndTime)
        );
        
        // Check specifically for back-to-back appointments (not overlapping)
        const isBackToBack = (
          (newStartTime === existingEndTime) || 
          (existingStartTime === newEndTime)
        );
        
        if (hasOverlap && !isBackToBack) {
          console.log('OVERLAP DETECTED with appointment:', app.title);
          return { 
            isValid: false, 
            message: `Appointment overlaps with "${app.title}" from ${format(appStart, 'h:mm a')} to ${format(appEnd, 'h:mm a')}` 
          };
        }
      } catch (err) {
        console.error('Error checking appointment overlap:', err);
        continue;
      }
    }
    
    return { isValid: true, message: "" };
  } catch (err) {
    console.error('Error in validateAppointmentTime:', err);
    return { isValid: false, message: "Error validating appointment time. Please try again." };
  }
};

/**
 * Calculate duration in minutes between two time strings
 */
export const calculateDuration = (date: Date, startTime: string, endTime: string): number => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startDate = new Date(date);
  startDate.setHours(startHours, startMinutes, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(endHours, endMinutes, 0, 0);
  
  // If end time is earlier than start time, assume it's the next day
  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }
  
  // Calculate duration in minutes
  return Math.round((endDate.getTime() - startDate.getTime()) / 60000);
};

/**
 * Update title based on client and service
 */
export const generateAppointmentTitle = (
  clientId: string, 
  serviceId: string,
  clients: any[],
  services: any[]
): string => {
  const client = clients.find((c) => c.id === clientId);
  const service = services.find((s) => s.id === serviceId);
  
  if (client && service) {
    return `${client.name} - ${service.name}`;
  } else if (client) {
    return `${client.name} - Service`;
  } else if (service) {
    return `Client - ${service.name}`;
  } else {
    return "";
  }
};
