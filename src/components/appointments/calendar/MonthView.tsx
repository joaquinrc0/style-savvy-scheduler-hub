import React from "react";
import { Appointment } from "@/types/appointment";
import { format, isSameDay } from "date-fns";
import { statusColors } from "./constants";

interface MonthViewProps {
  selectedDate: Date;
  monthDays: Date[];
  appointments: Appointment[];
  onViewAppointment: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  setView: (view: 'day' | 'week' | 'month') => void;
  handleDragStart: (appointment: Appointment, event: React.DragEvent, mode?: 'move' | 'resize-start' | 'resize-end') => void;
  handleDragOver: (event: React.DragEvent, day: Date, slot: { hour: number, minute: number }) => void;
  handleDrop: (event: React.DragEvent, day: Date, slot: { hour: number, minute: number }) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  selectedDate,
  monthDays,
  appointments,
  onViewAppointment,
  setSelectedDate,
  setView,
  handleDragStart,
  handleDragOver,
  handleDrop
}) => {
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, index) => (
        <div key={index} className="text-center py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {dayName}
        </div>
      ))}
      
      {/* Month days */}
      {monthDays.map((day, dayIndex) => {
        const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
        const isToday = isSameDay(day, new Date());
        // Filter appointments for this day and sort them by start time
        const dayAppointments = appointments
          .filter(appt => isSameDay(appt.start, day))
          .sort((a, b) => a.start.getTime() - b.start.getTime());
        
        return (
          <div 
            key={dayIndex}
            className={`min-h-[110px] border p-1 relative ${
              isCurrentMonth ? 'bg-background' : 'bg-muted/20 text-muted-foreground'
            } ${isToday ? 'border-salon-500 bg-salon-50' : 'border-border'}`}
            onClick={() => {
              setSelectedDate(day);
              setView('day');
            }}
            onDragOver={(e) => handleDragOver(e, day, { hour: 9, minute: 0 })} // Default to 9 AM
            onDrop={(e) => handleDrop(e, day, { hour: 9, minute: 0 })} // Default to 9 AM
          >
            <div className={`text-right text-sm p-1 ${isToday ? 'font-semibold text-salon-700' : 'font-medium'}`}>
              {format(day, 'd')}
            </div>
            
            <div className="mt-1 max-h-[80px] overflow-y-auto">
              {dayAppointments.slice(0, 3).map((appointment, index) => (
                <div
                  key={index}
                  className={`text-xs mb-1 p-1 rounded truncate text-white ${statusColors[appointment.status]} font-medium`}
                  draggable
                  onDragStart={(e) => handleDragStart(appointment, e)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewAppointment(appointment.id);
                  }}
                >
                  {format(appointment.start, 'h:mm')} {appointment.title.split(' - ')[0]}
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-muted-foreground text-center font-medium">
                  +{dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
