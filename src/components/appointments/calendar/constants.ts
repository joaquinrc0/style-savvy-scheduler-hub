import { AppointmentStatus } from "@/types/appointment";

// Business hours
export const START_HOUR = 9; // 9 AM
export const END_HOUR = 18; // 6 PM
export const HOUR_HEIGHT = 60; // Height in pixels for 1 hour
export const INTERVAL_HEIGHT = HOUR_HEIGHT / 4; // Height for 15-minute intervals

export const statusColors: Record<AppointmentStatus, string> = {
  'scheduled': 'bg-salon-500',
  'completed': 'bg-green-500',
  'cancelled': 'bg-red-500',
  'no-show': 'bg-yellow-500',
};
