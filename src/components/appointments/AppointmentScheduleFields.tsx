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
}

export const AppointmentScheduleFields = ({
  form,
  serviceDuration,
  shouldUpdateEndTime,
  onStartTimeChange,
  onEndTimeChange,
}: AppointmentScheduleFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
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
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start Time</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onStartTimeChange(value);
              }}
              value={field.value || "09:00"} // Provide a default value if field.value is empty
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a start time" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="endTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>End Time</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onEndTimeChange(value);
              }}
              value={field.value || "10:00"} // Provide a default value if field.value is empty
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an end time" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <FormLabel>Duration</FormLabel>
        <div className="h-10 px-4 py-2 border rounded-md flex items-center">
          <span>{serviceDuration} minutes</span>
        </div>
      </FormItem>
    </div>
  );
};
