import React from "react";
import { Appointment } from "@/types/appointment";
import { format, isSameDay } from "date-fns";
import { Clock, Maximize, Minimize } from "lucide-react";
import { getAppointmentStyle } from "./utils";
import { HOUR_HEIGHT, INTERVAL_HEIGHT, statusColors } from "./constants";

interface WeekViewProps {
  selectedDate: Date;
  weekDays: Date[];
  weekGridRef: React.RefObject<HTMLDivElement>;
  timeSlots: { hour: number, minute: number }[];
  hourSlots: number[];
  appointments: Appointment[];
  onViewAppointment: (id: string) => void;
  handleDragStart: (appointment: Appointment, event: React.DragEvent, mode?: 'move' | 'resize-start' | 'resize-end') => void;
  handleDragOver: (event: React.DragEvent, day: Date, slot: { hour: number, minute: number }) => void;
  handleDrop: (event: React.DragEvent, day: Date, slot: { hour: number, minute: number }) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  selectedDate,
  weekDays,
  weekGridRef,
  timeSlots,
  hourSlots,
  appointments,
  onViewAppointment,
  handleDragStart,
  handleDragOver,
  handleDrop
}) => {
  return (
    <div className="relative">
      {/* Week view header */}
      <div className="grid grid-cols-8 border-b mb-2">
        <div className="text-center p-2 text-xs text-muted-foreground font-medium">
          <Clock className="h-3 w-3 mx-auto" />
        </div>
        {weekDays.map((day, index) => (
          <div 
            key={index} 
            className={`text-center p-2 ${isSameDay(day, new Date()) ? 'bg-salon-100 rounded-t-md' : ''}`}
          >
            <div className="text-xs uppercase font-medium tracking-wide">{format(day, 'EEE')}</div>
            <div className={`text-base ${isSameDay(day, new Date()) ? 'text-salon-700 font-semibold' : 'font-medium'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Time grid */}
      <div 
        className="grid grid-cols-8 relative overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-salon-200"
        ref={weekGridRef}
        style={{ height: `${hourSlots.length * HOUR_HEIGHT}px` }}
      >
        {/* Time labels */}
        <div className="col-span-1 border-r">
          {hourSlots.map((hour) => (
            <div 
              key={hour} 
              className="border-b text-xs text-right pr-2 text-muted-foreground font-medium"
              style={{ height: `${HOUR_HEIGHT}px`, lineHeight: `${HOUR_HEIGHT}px` }}
            >
              {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour-12} PM`}
            </div>
          ))}
        </div>
        
        {/* Days columns */}
        {weekDays.map((day, dayIndex) => (
          <div 
            key={dayIndex} 
            className={`col-span-1 relative border-r ${isSameDay(day, new Date()) ? 'bg-salon-50' : ''}`}
          >
            {/* Time slot cells - 15 min intervals */}
            {timeSlots.map((slot) => (
              <div 
                key={`${day.getTime()}-${slot.hour}-${slot.minute}`}
                className={`hover:bg-salon-50/50 transition-colors ${
                  slot.minute === 0 ? 'border-t' : 'border-t border-dashed border-opacity-30'
                }`}
                style={{ 
                  height: `${INTERVAL_HEIGHT}px`
                }}
                onDragOver={(e) => handleDragOver(e, day, slot)}
                onDrop={(e) => handleDrop(e, day, slot)}
              />
            ))}
            
            {/* Appointments */}
            {appointments
              .filter(appt => 
                isSameDay(appt.start, day)
              )
              .map(appointment => (
                <div 
                  key={appointment.id}
                  className={`absolute rounded-md px-1 py-1 text-white overflow-hidden cursor-pointer transition-opacity ${
                    statusColors[appointment.status] || 'bg-salon-600'
                  } hover:opacity-90`}
                  style={getAppointmentStyle(appointment)}
                  onClick={() => onViewAppointment(appointment.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(appointment, e)}
                >
                  <div className="text-xs font-medium truncate flex justify-between items-center">
                    <span>{format(appointment.start, 'h:mm a')}</span>
                    <div className="flex space-x-1">
                      <div 
                        className="h-3 w-3 rounded-full bg-white/30 cursor-ns-resize"
                        draggable
                        onDragStart={(e) => handleDragStart(appointment, e, 'resize-start')}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Minimize className="h-3 w-3" />
                      </div>
                      <div 
                        className="h-3 w-3 rounded-full bg-white/30 cursor-ns-resize"
                        draggable
                        onDragStart={(e) => handleDragStart(appointment, e, 'resize-end')}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Maximize className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs truncate font-medium">
                    {appointment.title.split(' - ')[0]}
                  </div>
                  <div className="text-xs truncate opacity-90 font-medium">
                    {appointment.title.split(' - ')[1]}
                  </div>
                </div>
              ))
            }
          </div>
        ))}
      </div>
    </div>
  );
};
