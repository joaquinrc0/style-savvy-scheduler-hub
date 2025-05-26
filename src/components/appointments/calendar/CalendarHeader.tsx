import React from "react";
import { MoveHorizontal } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CalendarHeaderProps {
  view: 'day' | 'week' | 'month';
  appointmentCount: number;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ view, appointmentCount }) => {
  return (
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
        {appointmentCount} appointments {view === 'day' ? 'today' : view === 'week' ? 'this week' : 'this month'}
      </CardDescription>
    </CardHeader>
  );
};
