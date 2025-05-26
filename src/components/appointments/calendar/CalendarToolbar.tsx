import React from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus, Download } from "lucide-react";

interface CalendarToolbarProps {
  selectedDate: Date;
  view: 'day' | 'week' | 'month';
  setView: (view: 'day' | 'week' | 'month') => void;
  appointmentCount: number;
  goToPrevious: () => void;
  goToNext: () => void;
  goToToday: () => void;
  handleAddAppointment: () => void;
  handleExport: () => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  selectedDate,
  view,
  setView,
  appointmentCount,
  goToPrevious,
  goToNext,
  goToToday,
  handleAddAppointment,
  handleExport
}) => {
  // Format title based on view
  const getFormattedTitle = () => {
    if (view === 'day') {
      return format(selectedDate, 'MMMM d, yyyy');
    } else if (view === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return format(selectedDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold font-playfair tracking-tight">
          {getFormattedTitle()}
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
  );
};
