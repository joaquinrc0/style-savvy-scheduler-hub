import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, addMinutes } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AppointmentFormType } from "./AppointmentFormConfig.tsx";

// Time slots from 8:00 AM to 5:30 PM with 15-minute intervals
export const timeSlots = Array.from({ length: 39 }, (_, i) => {
  const hour = Math.floor((i * 15 + 480) / 60) % 12 || 12; // 480 minutes = 8:00 AM
  const minute = (i * 15) % 60;
  const ampm = Math.floor((i * 15 + 480) / 60) < 12 ? "AM" : "PM";
  const hourValue = Math.floor((i * 15 + 480) / 60);
  return {
    value: `${String(hourValue % 24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    label: `${hour}:${String(minute).padStart(2, "0")} ${ampm}`,
  };
});

interface AppointmentScheduleFieldsProps {
  form: UseFormReturn<AppointmentFormType>;
  serviceDuration: number;
  shouldUpdateEndTime: boolean;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  appointments: any[];
  appointmentId?: string;
}

export const AppointmentScheduleFields = ({
  form,
  serviceDuration,
  shouldUpdateEndTime,
  onStartTimeChange,
  onEndTimeChange,
  appointments,
  appointmentId,
}: AppointmentScheduleFieldsProps) => {
  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-sm">Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal w-full h-9 text-sm",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                  className="p-2 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => {
            // Get selected date
            const selectedDate = form.getValues("date");
            // Exclude current appointment
            const filteredAppointments = appointments.filter(appt => {
              if (appointmentId && (appt.id === appointmentId)) return false;
              // Compare by date (ignore time)
              return appt.start && selectedDate &&
                appt.start.getFullYear() === selectedDate.getFullYear() &&
                appt.start.getMonth() === selectedDate.getMonth() &&
                appt.start.getDate() === selectedDate.getDate();
            });
            // For each slot, check if it overlaps with any appointment
            function isSlotDisabled(slotValue: string) {
              const [slotHour, slotMinute] = slotValue.split(":").map(Number);
              const slotStart = slotHour * 60 + slotMinute;
              // Check overlap with any appointment
              return filteredAppointments.some(appt => {
                const apptStart = appt.start.getHours() * 60 + appt.start.getMinutes();
                const apptEnd = appt.end.getHours() * 60 + appt.end.getMinutes();
                // Slot start must not be within any appointment
                return slotStart >= apptStart && slotStart < apptEnd;
              });
            }
            return (
              <FormItem>
                <FormLabel className="text-sm">Start Time</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onStartTimeChange(value);
                  }}
                  value={field.value || "09:00"}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Start time" className="text-sm" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {timeSlots.filter(slot => !isSlotDisabled(slot.value)).map((slot) => (
                      <SelectItem
                        key={slot.value}
                        value={slot.value}
                        className="text-sm"
                      >
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => {
            const selectedDate = form.getValues("date");
            const startTime = form.getValues("time") || "00:00";
            const [startHour, startMinute] = startTime.split(":").map(Number);
            const startTotalMinutes = startHour * 60 + startMinute;
            // Exclude current appointment
            const filteredAppointments = appointments.filter(appt => {
              if (appointmentId && (appt.id === appointmentId)) return false;
              return appt.start && selectedDate &&
                appt.start.getFullYear() === selectedDate.getFullYear() &&
                appt.start.getMonth() === selectedDate.getMonth() &&
                appt.start.getDate() === selectedDate.getDate();
            });
            // Find the next appointment after the selected start time
            const nextAppt = filteredAppointments
              .map(appt => ({
                start: appt.start.getHours() * 60 + appt.start.getMinutes(),
                end: appt.end.getHours() * 60 + appt.end.getMinutes()
              }))
              .filter(appt => appt.start > startTotalMinutes)
              .sort((a, b) => a.start - b.start)[0];
            // For each slot, check if it should be disabled
            function isEndSlotDisabled(slotValue: string) {
              const [slotHour, slotMinute] = slotValue.split(":").map(Number);
              const slotMinutes = slotHour * 60 + slotMinute;
              // End time must be strictly after start time
              if (slotMinutes <= startTotalMinutes) return true;
              // If next appointment exists, disable slots after its start (open interval logic)
              if (nextAppt && slotMinutes > nextAppt.start) return true;
              // Also, do not allow overlap with any existing appointment
              return filteredAppointments.some(appt => {
                const apptStart = appt.start.getHours() * 60 + appt.start.getMinutes();
                const apptEnd = appt.end.getHours() * 60 + appt.end.getMinutes();
                return slotMinutes > apptStart && slotMinutes <= apptEnd;
              });
            }
            const filteredSlots = timeSlots.filter(slot => !isEndSlotDisabled(slot.value));
            // If current end time is not valid, reset to next available
            if (field.value) {
              const [endHour, endMinute] = field.value.split(":").map(Number);
              const endTotalMinutes = endHour * 60 + endMinute;
              if (isEndSlotDisabled(field.value) && filteredSlots.length > 0) {
                setTimeout(() => field.onChange(filteredSlots[0].value), 0);
              }
            }
            return (
              <FormItem>
                <FormLabel className="text-sm">End Time</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onEndTimeChange(value);
                  }}
                  value={field.value || (filteredSlots[0] && filteredSlots[0].value) || ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="End time" className="text-sm" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {(() => {
                      const availableSlots = timeSlots.filter(slot => !isEndSlotDisabled(slot.value));
                      return (
                        <>
                          {availableSlots.map((slot) => (
                            <SelectItem
                              key={slot.value}
                              value={slot.value}
                              className="text-sm"
                            >
                              {slot.label}
                            </SelectItem>
                          ))}
                          {nextAppt && availableSlots.length > 0 && (
                            <SelectItem disabled value="next-appointment" className="text-muted-foreground text-xs cursor-not-allowed opacity-50">
                              Next appointment
                            </SelectItem>
                          )}
                        </>
                      );
                    })()}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            );
          }}
        />
      </div>

      <FormItem>
        <FormLabel className="text-sm">Duration</FormLabel>
        <div className="h-9 px-3 py-1 border rounded-md flex items-center text-sm">
          <span>{serviceDuration} minutes</span>
        </div>
      </FormItem>
    </div>
  );
};
