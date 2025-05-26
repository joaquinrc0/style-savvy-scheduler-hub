import { useState, useMemo, useRef } from "react";
import { useAppointments } from "@/contexts/AppointmentContext";
import { addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { exportCalendarData } from "@/utils/exportData";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DayView, 
  WeekView, 
  MonthView, 
  CalendarToolbar, 
  CalendarHeader,
  useDragDropHandlers,
  filterAppointments,
  generateWeekDays,
  generateMonthDays,
  generateTimeSlots,
  generateHourSlots
} from "./calendar";
import { Appointment } from "@/types/appointment";

interface AppointmentCalendarProps {
  onAddAppointment: () => void;
  onViewAppointment: (id: string) => void;
}

export function AppointmentCalendar({ onAddAppointment, onViewAppointment }: AppointmentCalendarProps) {
  const { appointments, updateAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [dragState, setDragState] = useState<{
    draggedAppointment: Appointment | null;
    resizeMode: 'start' | 'end' | null;
  }>({
    draggedAppointment: null,
    resizeMode: null
  });
  
  const weekGridRef = useRef<HTMLDivElement>(null);
  const dayGridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Memoized values
  const weekDays = useMemo(() => generateWeekDays(selectedDate), [selectedDate]);
  const monthDays = useMemo(() => generateMonthDays(selectedDate), [selectedDate, view]);
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const hourSlots = useMemo(() => generateHourSlots(), []);
  const filteredAppointments = useMemo(
    () => filterAppointments(appointments, selectedDate, view), 
    [appointments, selectedDate, view]
  );

  // Handler functions
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

  // Drag and drop handlers
  const { handleDragStart, handleDragOver, handleDrop } = useDragDropHandlers({
    appointments,
    updateAppointment,
    toast,
    setDragState: (state) => setDragState(prev => ({ ...prev, ...state })),
    dragState
  });

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
      <CalendarToolbar
        selectedDate={selectedDate}
        view={view}
        setView={setView}
        appointmentCount={filteredAppointments.length}
        goToPrevious={goToPrevious}
        goToNext={goToNext}
        goToToday={goToToday}
        handleAddAppointment={handleAddAppointment}
        handleExport={handleExport}
      />

      <Card>
        <CalendarHeader 
          view={view}
          appointmentCount={filteredAppointments.length}
        />
        
        <CardContent>
          {view === 'day' && (
            <DayView
              selectedDate={selectedDate}
              dayGridRef={dayGridRef}
              timeSlots={timeSlots}
              hourSlots={hourSlots}
              filteredAppointments={filteredAppointments}
              onViewAppointment={onViewAppointment}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
            />
          )}

          {view === 'week' && (
            <WeekView
              selectedDate={selectedDate}
              weekDays={weekDays}
              weekGridRef={weekGridRef}
              timeSlots={timeSlots}
              hourSlots={hourSlots}
              appointments={appointments}
              onViewAppointment={onViewAppointment}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
            />
          )}

          {view === 'month' && (
            <MonthView
              selectedDate={selectedDate}
              monthDays={monthDays}
              appointments={appointments}
              onViewAppointment={onViewAppointment}
              setSelectedDate={setSelectedDate}
              setView={setView}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}