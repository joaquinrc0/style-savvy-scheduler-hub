import { useState, useMemo, useRef, useEffect } from "react";
import { useAppointments } from "@/contexts/AppointmentContext";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, addDays, isSameDay, addHours, addMinutes, isWithinInterval, parseISO, setHours, setMinutes, startOfMonth, endOfMonth, getDaysInMonth, getDay, getDate } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus, Clock, MoveHorizontal, Calendar as CalendarIcon, Maximize, Minimize, Download } from "lucide-react";
import { AppointmentStatus, Appointment } from "@/types/appointment";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { exportCalendarData } from "@/utils/exportData";

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
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [resizeMode, setResizeMode] = useState<'start' | 'end' | null>(null);
  const weekGridRef = useRef<HTMLDivElement>(null);
  const dayGridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleAddAppointment = () => {
    onAddAppointment();
  };

  const handleExport = () => {
    try {
      exportCalendarData(appointments);
      toast({
        title: "Export successful",
        description: "Calendar data has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export calendar data",
        variant: "destructive"
      });
    }
  };

  const filteredAppointments = useMemo(() => {
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

  const handleDragStart = (appointment: Appointment, event: React.DragEvent, mode: 'move' | 'resize-start' | 'resize-end' = 'move') => {
    event.stopPropagation();
    setDraggedAppointment(appointment);
    
    if (mode === 'resize-start') {
      setResizeMode('start');
    } else if (mode === 'resize-end') {
      setResizeMode('end');
    } else {
      setResizeMode(null);
    }
    
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

  const handleDragOver = (event: React.DragEvent, day: Date, hour: number, minute: number = 0) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent, day: Date, hour: number, minute: number = 0) => {
    event.preventDefault();
    if (!draggedAppointment) return;
    
    const appointmentId = event.dataTransfer.getData('text/plain');
    
    const newStart = new Date(day);
    newStart.setHours(hour);
    newStart.setMinutes(minute);
    newStart.setSeconds(0);
    
    // Calculate end time based on whether we're resizing or moving
    let newEnd: Date;
    
    if (resizeMode === 'start') {
      // Resizing the start time - end time stays fixed
      newEnd = new Date(draggedAppointment.end);
      
      // Ensure start isn't after end
      if (newStart >= newEnd) {
        toast({
          title: "Invalid resize",
          description: "Start time cannot be after end time",
          variant: "destructive"
        });
        setResizeMode(null);
        setDraggedAppointment(null);
        return;
      }
      
      // Update the appointment with new start time
      updateAppointment(appointmentId, {
        date: newStart,
        time: `${newStart.getHours()}:${newStart.getMinutes().toString().padStart(2, '0')}`,
      });
      
      toast({
        title: "Appointment resized",
        description: `Start time changed to ${format(newStart, 'h:mm a')}`,
      });
      
    } else if (resizeMode === 'end') {
      // Resizing the end time - start time stays fixed
      const start = new Date(draggedAppointment.start);
      newEnd = new Date(day);
      newEnd.setHours(hour);
      newEnd.setMinutes(minute);
      
      // Ensure end isn't before start
      if (newEnd <= start) {
        toast({
          title: "Invalid resize",
          description: "End time cannot be before start time",
          variant: "destructive"
        });
        setResizeMode(null);
        setDraggedAppointment(null);
        return;
      }
      
      // Calculate the new duration in minutes
      const durationMs = newEnd.getTime() - start.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      
      // Calculate end of business day
      const endOfBusinessDay = new Date(day);
      endOfBusinessDay.setHours(END_HOUR);
      endOfBusinessDay.setMinutes(0);
      
      // Check if appointment would end after business hours
      if (newEnd > endOfBusinessDay) {
        toast({
          title: "Cannot resize appointment",
          description: "The appointment would end after business hours.",
          variant: "destructive"
        });
        setResizeMode(null);
        setDraggedAppointment(null);
        return;
      }
      
      // Update the service duration in the appointment context
      updateAppointment(appointmentId, {
        // Keeping the existing date and time, just modifying the end time
        date: start,
        time: `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')}`,
      });
      
      toast({
        title: "Appointment duration changed",
        description: `Duration set to ${durationMinutes} minutes`,
      });
      
    } else {
      // Moving the whole appointment
      const durationMs = draggedAppointment.end.getTime() - draggedAppointment.start.getTime();
      newEnd = new Date(newStart.getTime() + durationMs);
      
      // Calculate the end time of the business day
      const endOfBusinessDay = new Date(day);
      endOfBusinessDay.setHours(END_HOUR);
      endOfBusinessDay.setMinutes(0);
      
      // Check if appointment would end after business hours
      if (newEnd > endOfBusinessDay) {
        toast({
          title: "Cannot move appointment",
          description: "The appointment would end after business hours.",
          variant: "destructive"
        });
        setResizeMode(null);
        setDraggedAppointment(null);
        return;
      }
      
      // Update the appointment with new time but preserve other data
      updateAppointment(appointmentId, {
        date: newStart,
        time: `${newStart.getHours()}:${newStart.getMinutes().toString().padStart(2, '0')}`,
      });
      
      toast({
        title: "Appointment moved",
        description: `Moved to ${format(newStart, 'EEEE, MMMM d')} at ${format(newStart, 'h:mm a')}`,
      });
    }
    
    setResizeMode(null);
    setDraggedAppointment(null);
  };

  // Position appointment correctly in week/day grid
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

  // Generate month grid days
  const monthDays = useMemo(() => {
    if (view !== 'month') return [];
    
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
  }, [selectedDate, view]);

  // Navigation functions
  const goToPrevious = () => {
    if (view === 'day') {
      setSelectedDate(prev => addDays(prev, -1));
    } else if (view === 'week') {
      setSelectedDate(prev => addDays(prev, -7));
    } else {
      // Month view
      setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const goToNext = () => {
    if (view === 'day') {
      setSelectedDate(prev => addDays(prev, 1));
    } else if (view === 'week') {
      setSelectedDate(prev => addDays(prev, 7));
    } else {
      // Month view
      setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-playfair tracking-tight">
            {view === 'day' 
              ? format(selectedDate, 'MMMM d, yyyy')
              : view === 'week'
                ? `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
                : format(selectedDate, 'MMMM yyyy')
            }
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            className="font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="font-medium"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="font-medium"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Tabs defaultValue={view} onValueChange={(value) => setView(value as 'day' | 'week' | 'month')}>
            <TabsList>
              <TabsTrigger value="day" className="font-medium">Day</TabsTrigger>
              <TabsTrigger value="week" className="font-medium">Week</TabsTrigger>
              <TabsTrigger value="month" className="font-medium">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            size="sm"
            className="bg-salon-600 hover:bg-salon-700 font-medium"
            onClick={handleAddAppointment}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Appointment
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 font-medium"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-1" /> Export Calendar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-xl tracking-tight">
            {view === 'day' ? 'Day Schedule' : view === 'week' ? 'Week Schedule' : 'Month View'}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-2 text-xs flex items-center text-muted-foreground">
                    <MoveHorizontal className="h-3 w-3 mr-1" /> Drag to reschedule
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Drag appointment to reschedule</p>
                  <p>Drag top/bottom edges to resize</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription className="font-medium">
            {filteredAppointments.length} appointments {view === 'day' ? 'today' : view === 'week' ? 'this week' : 'this month'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view === 'day' && (
            <div className="relative">
              {/* Day view header */}
              <div className="grid grid-cols-2 border-b mb-2">
                <div className="text-center p-2 text-xs text-muted-foreground font-medium">
                  <Clock className="h-3 w-3 mx-auto" />
                </div>
                <div className="text-center p-2 bg-salon-100 rounded-t-md">
                  <div className="text-xs uppercase font-medium tracking-wide">{format(selectedDate, 'EEEE')}</div>
                  <div className="text-base text-salon-700 font-semibold">{format(selectedDate, 'd')}</div>
                </div>
              </div>
              
              {/* Time grid */}
              <div 
                className="grid grid-cols-2 relative overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-salon-200"
                ref={dayGridRef}
                style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}
              >
                {/* Time labels */}
                <div className="col-span-1 border-r">
                  {timeSlots.map(hour => (
                    <div 
                      key={hour} 
                      className="border-b text-xs text-right pr-2 text-muted-foreground font-medium"
                      style={{ height: `${HOUR_HEIGHT}px`, lineHeight: `${HOUR_HEIGHT}px` }}
                    >
                      {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour-12} PM`}
                    </div>
                  ))}
                </div>
                
                {/* Day column */}
                <div className="col-span-1 relative bg-salon-50">
                  {/* Hour cells */}
                  {timeSlots.map(hour => (
                    <div 
                      key={hour}
                      className="border-b border-dashed hover:bg-salon-50/80 transition-colors"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      onDragOver={(e) => handleDragOver(e, selectedDate, hour)}
                      onDrop={(e) => handleDrop(e, selectedDate, hour)}
                    />
                  ))}
                  
                  {/* Appointments */}
                  {filteredAppointments.map(appointment => (
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
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'week' && (
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
                style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}
              >
                {/* Time labels */}
                <div className="col-span-1 border-r">
                  {timeSlots.map(hour => (
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
          )}

          {view === 'month' && (
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
                const dayAppointments = appointments.filter(appt => isSameDay(appt.start, day));
                
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
                    onDragOver={(e) => handleDragOver(e, day, 9)} // Default to 9 AM
                    onDrop={(e) => handleDrop(e, day, 9)} // Default to 9 AM
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
