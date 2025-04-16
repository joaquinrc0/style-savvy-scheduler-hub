
import { useState, useMemo, useRef } from "react";
import { useAppointments } from "@/contexts/AppointmentContext";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, addDays, isSameDay, addHours, isWithinInterval, parseISO, setHours, setMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Clock, MoveHorizontal } from "lucide-react";
import { AppointmentStatus, Appointment } from "@/types/appointment";
import { useToast } from "@/hooks/use-toast";

interface AppointmentCalendarProps {
  onAddAppointment: () => void;
  onViewAppointment: (id: string) => void;
}

const statusColors: Record<AppointmentStatus, string> = {
  'scheduled': 'bg-salon-500',
  'completed': 'bg-green-500',
  'cancelled': 'bg-red-500',
  'no-show': 'bg-yellow-500',
};

// Business hours
const START_HOUR = 9; // 9 AM
const END_HOUR = 18; // 6 PM
const HOUR_HEIGHT = 60; // Height in pixels for 1 hour

export function AppointmentCalendar({ onAddAppointment, onViewAppointment }: AppointmentCalendarProps) {
  const { appointments, updateAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const weekGridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleAddAppointment = () => {
    onAddAppointment();
  };

  const toggleView = () => {
    setView(view === 'day' ? 'week' : 'day');
  };

  const filteredAppointments = useMemo(() => {
    if (view === 'day') {
      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);
      return appointments.filter(
        (appointment) => appointment.start >= dayStart && appointment.start <= dayEnd
      );
    } else {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return appointments.filter(
        (appointment) => appointment.start >= weekStart && appointment.start <= weekEnd
      );
    }
  }, [appointments, selectedDate, view]);

  const weekDays = useMemo(() => {
    const days = [];
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      days.push(day);
    }
    
    return days;
  }, [selectedDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

  const handleDragStart = (appointment: Appointment, event: React.DragEvent) => {
    setDraggedAppointment(appointment);
    event.dataTransfer.setData('text/plain', appointment.id);
    
    // Create a ghost image for dragging
    const ghost = document.createElement('div');
    ghost.classList.add('bg-salon-500', 'opacity-70', 'text-white', 'p-2', 'rounded');
    ghost.textContent = appointment.title;
    ghost.style.width = '150px';
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 75, 20);
    
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  const handleDragOver = (event: React.DragEvent, day: Date, hour: number) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent, day: Date, hour: number) => {
    event.preventDefault();
    if (!draggedAppointment) return;
    
    const appointmentId = event.dataTransfer.getData('text/plain');
    
    const newStart = new Date(day);
    newStart.setHours(hour);
    newStart.setMinutes(0);
    newStart.setSeconds(0);
    
    const durationMs = draggedAppointment.end.getTime() - draggedAppointment.start.getTime();
    const newEnd = new Date(newStart.getTime() + durationMs);
    
    // Calculate the end time of the business day
    const endOfBusinessDay = new Date(day);
    endOfBusinessDay.setHours(END_HOUR);
    endOfBusinessDay.setMinutes(0);
    endOfBusinessDay.setSeconds(0);
    
    // Check if appointment would end after business hours
    if (newEnd > endOfBusinessDay) {
      toast({
        title: "Cannot move appointment",
        description: "The appointment would end after business hours.",
        variant: "destructive"
      });
      return;
    }
    
    // Update the appointment with new time
    updateAppointment(appointmentId, {
      date: newStart,
      time: `${newStart.getHours()}:${newStart.getMinutes().toString().padStart(2, '0')}`,
    });
    
    setDraggedAppointment(null);
    
    toast({
      title: "Appointment moved",
      description: `Moved to ${format(newStart, 'EEEE, MMMM d')} at ${format(newStart, 'h:mm a')}`,
    });
  };

  // Position appointment correctly in week grid
  const getAppointmentStyle = (appointment: Appointment) => {
    const startHour = appointment.start.getHours();
    const startMinutes = appointment.start.getMinutes();
    const endHour = appointment.end.getHours();
    const endMinutes = appointment.end.getMinutes();
    
    const startPosition = (startHour - START_HOUR) * HOUR_HEIGHT + (startMinutes / 60) * HOUR_HEIGHT;
    const duration = (endHour - startHour) * HOUR_HEIGHT + ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;
    
    return {
      top: `${startPosition}px`,
      height: `${duration}px`,
      width: 'calc(100% - 8px)',
      left: '4px',
      position: 'absolute' as const,
    };
  };

  // Check if an appointment is on a specific day and hour
  const isAppointmentAtTimeSlot = (appointment: Appointment, day: Date, hour: number) => {
    const dayStart = startOfDay(day);
    const timeSlotStart = addHours(dayStart, hour);
    const timeSlotEnd = addHours(dayStart, hour + 1);
    
    return isWithinInterval(appointment.start, {
      start: dayStart,
      end: endOfDay(day)
    }) && isWithinInterval(appointment.start, {
      start: timeSlotStart,
      end: timeSlotEnd
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold font-playfair">
            {view === 'day' 
              ? format(selectedDate, 'MMMM d, yyyy')
              : `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
            }
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleView}
          >
            {view === 'day' ? 'Week View' : 'Day View'}
          </Button>
          <Button
            size="sm"
            className="bg-salon-600 hover:bg-salon-700"
            onClick={handleAddAppointment}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border shadow-sm"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              {view === 'day' ? 'Day Schedule' : 'Week Schedule'}
              {view === 'week' && (
                <span className="ml-2 text-xs flex items-center text-muted-foreground">
                  <MoveHorizontal className="h-3 w-3 mr-1" /> Drag to reschedule
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {filteredAppointments.length} appointments {view === 'day' ? 'today' : 'this week'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === 'day' ? (
              <div className="space-y-3">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments
                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => onViewAppointment(appointment.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{appointment.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(appointment.start, 'h:mm a')} - {format(appointment.end, 'h:mm a')}
                            </p>
                          </div>
                          <Badge className={statusColors[appointment.status]}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No appointments scheduled
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                {/* Week view header */}
                <div className="grid grid-cols-8 border-b mb-2">
                  <div className="text-center p-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mx-auto" />
                  </div>
                  {weekDays.map((day, index) => (
                    <div 
                      key={index} 
                      className={`text-center p-2 ${isSameDay(day, new Date()) ? 'bg-salon-100 rounded-t-md' : ''}`}
                    >
                      <div className="text-xs uppercase font-medium">{format(day, 'EEE')}</div>
                      <div className={`text-base ${isSameDay(day, new Date()) ? 'text-salon-700 font-medium' : ''}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Time grid */}
                <div 
                  className="grid grid-cols-8 relative overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-salon-200"
                  ref={weekGridRef}
                  style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}
                >
                  {/* Time labels */}
                  <div className="col-span-1 border-r">
                    {timeSlots.map(hour => (
                      <div 
                        key={hour} 
                        className="border-b text-xs text-right pr-2 text-muted-foreground"
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
                      {/* Hour cells */}
                      {timeSlots.map(hour => (
                        <div 
                          key={hour}
                          className="border-b border-dashed hover:bg-salon-50/50 transition-colors"
                          style={{ height: `${HOUR_HEIGHT}px` }}
                          onDragOver={(e) => handleDragOver(e, day, hour)}
                          onDrop={(e) => handleDrop(e, day, hour)}
                        />
                      ))}
                      
                      {/* Appointments */}
                      {appointments
                        .filter(appt => 
                          isSameDay(appt.start, day) && 
                          appt.start.getHours() >= START_HOUR && 
                          appt.start.getHours() < END_HOUR
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
                            <div className="text-xs font-medium truncate">
                              {format(appointment.start, 'h:mm a')} 
                            </div>
                            <div className="text-xs truncate">
                              {appointment.title.split(' - ')[0]}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
