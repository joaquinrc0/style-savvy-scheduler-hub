
import { useState, useMemo } from "react";
import { useAppointments } from "@/contexts/AppointmentContext";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, addDays, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppointmentStatus } from "@/types/appointment";
import { useNavigate } from "react-router-dom";

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

export function AppointmentCalendar({ onAddAppointment, onViewAppointment }: AppointmentCalendarProps) {
  const { appointments } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const navigate = useNavigate();

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

  const appointmentsByDay = useMemo(() => {
    if (view === 'week') {
      return weekDays.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        return appointments.filter(
          (appointment) => appointment.start >= dayStart && appointment.start <= dayEnd
        );
      });
    }
    return [];
  }, [appointments, weekDays, view]);

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
            <CardTitle>
              {view === 'day' ? 'Day Schedule' : 'Week Schedule'}
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
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, index) => (
                  <div key={index} className="space-y-1">
                    <div className={`text-center p-1 mb-2 rounded-md ${isSameDay(day, new Date()) ? 'bg-salon-100 font-medium' : ''}`}>
                      <div className="text-xs uppercase">{format(day, 'EEE')}</div>
                      <div className={`text-sm ${isSameDay(day, new Date()) ? 'text-salon-700' : ''}`}>{format(day, 'd')}</div>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {appointmentsByDay[index].length > 0 ? (
                        appointmentsByDay[index]
                          .sort((a, b) => a.start.getTime() - b.start.getTime())
                          .map((appointment) => (
                            <div
                              key={appointment.id}
                              className="p-1 text-xs border rounded-sm hover:bg-accent cursor-pointer transition-colors"
                              onClick={() => onViewAppointment(appointment.id)}
                            >
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${statusColors[appointment.status]}`} />
                                <span className="truncate">{format(appointment.start, 'h:mm')}</span>
                              </div>
                              <div className="truncate font-medium">{appointment.title.split(' - ')[0]}</div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center text-xs text-muted-foreground py-2">
                          No appointments
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
