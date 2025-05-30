/**
 * Centralized Working Hours Definition
 * -----------------------------------
 * Use WORKING_HOURS_START and WORKING_HOURS_END for all appointment logic, validation,
 * time slot generation, and error messages. This is the single source of truth for
 * working hours across the application.
 */
export const WORKING_HOURS_START = { hour: 8, minute: 0 };    // 8:00 AM
export const WORKING_HOURS_END = { hour: 17, minute: 30 };    // 5:30 PM

/**
 * Returns true if the given hour/minute is within working hours (inclusive start, exclusive end)
 */
export function isWithinWorkingHours(hour: number, minute: number) {
  const startMinutes = WORKING_HOURS_START.hour * 60 + WORKING_HOURS_START.minute;
  const endMinutes = WORKING_HOURS_END.hour * 60 + WORKING_HOURS_END.minute;
  const value = hour * 60 + minute;
  return value >= startMinutes && value < endMinutes;
}
