import { Appointment } from "@/types/appointment";
import { format } from "date-fns";
import { useState } from "react";
import { validateAppointmentTime } from "../AppointmentValidation";
import { END_HOUR } from "./constants";

export interface DragDropState {
  draggedAppointment: Appointment | null;
  resizeMode: 'start' | 'end' | null;
}

export interface DragDropHandlersProps {
  appointments: Appointment[];
  updateAppointment: (id: string, data: any) => void;
  toast: any;
  setDragState: (state: Partial<DragDropState>) => void;
  dragState: DragDropState;
}

export const useDragDropHandlers = ({
  appointments,
  updateAppointment,
  toast,
  setDragState,
  dragState
}: DragDropHandlersProps) => {
  
  const handleDragStart = (appointment: Appointment, event: React.DragEvent, mode: 'move' | 'resize-start' | 'resize-end' = 'move') => {
    event.stopPropagation();
    setDragState({ 
      draggedAppointment: appointment,
      resizeMode: mode === 'resize-start' ? 'start' : mode === 'resize-end' ? 'end' : null
    });
    
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

  const handleDragOver = (event: React.DragEvent, day: Date, slot: { hour: number, minute: number }) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent, day: Date, slot: { hour: number, minute: number }) => {
    event.preventDefault();
    const { draggedAppointment, resizeMode } = dragState;
    
    if (!draggedAppointment) return;
    
    const appointmentId = event.dataTransfer.getData('text/plain');
    
    // Check if we're in MonthView - in MonthView we want to preserve the time of day
    // We can detect MonthView by checking if the default hour is 9 and minute is 0
    const isMonthView = slot.hour === 9 && slot.minute === 0;
    
    const newStart = new Date(day);
    
    // If MonthView, preserve the original hour and minute
    if (isMonthView) {
      // Only change the date, preserve the original time
      newStart.setHours(draggedAppointment.start.getHours());
      newStart.setMinutes(draggedAppointment.start.getMinutes());
    } else {
      // In Day or Week view, use the time from the slot
      newStart.setHours(slot.hour);
      newStart.setMinutes(slot.minute);
    }
    newStart.setSeconds(0);
    
    // Calculate end time based on whether we're resizing or moving
    let newEnd: Date;
    
    if (resizeMode === 'start') {
      // When resizing the start time, maintain the appointment's actual duration
      const actualDurationMs = draggedAppointment.end.getTime() - draggedAppointment.start.getTime();
      
      // Calculate new end time based on the actual appointment duration
      newEnd = new Date(newStart.getTime() + actualDurationMs);
      
      // Calculate the end time of the business day
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
        setDragState({ resizeMode: null, draggedAppointment: null });
        return;
      }
      
      // Check for overlaps with other appointments
      const validation = validateAppointmentTime(
        day,
        format(newStart, 'HH:mm'),
        format(newEnd, 'HH:mm'),
        appointments,
        appointmentId
      );

      if (!validation.isValid) {
        toast({
          title: "Cannot resize appointment",
          description: validation.message,
          variant: "destructive"
        });
        setDragState({ resizeMode: null, draggedAppointment: null });
        return;
      }
      
      // Update the appointment with new start time and calculated end time
      // Calculate duration in minutes for consistency
      const durationInMinutes = Math.round(actualDurationMs / 60000);
      
      updateAppointment(appointmentId, {
        date: newStart,
        time: `${newStart.getHours().toString().padStart(2, '0')}:${newStart.getMinutes().toString().padStart(2, '0')}`,
        start: newStart,
        end: newEnd,
        // Explicitly include duration to ensure it's preserved
        duration: durationInMinutes
      });
      
      toast({
        title: "Appointment resized",
        description: `Start time changed to ${format(newStart, 'h:mm a')}`,
      });
      
    } else if (resizeMode === 'end') {
      // For end resizing, we should also respect the service type's duration
      // But since the user specifically wants to modify the end time in this case,
      // we'll retrieve the service duration but keep it as a reference only
      
      const start = new Date(draggedAppointment.start);
      newEnd = new Date(day);
      newEnd.setHours(slot.hour);
      newEnd.setMinutes(slot.minute);
      
      // Ensure end isn't before start
      if (newEnd <= start) {
        toast({
          title: "Invalid resize",
          description: "End time cannot be before start time",
          variant: "destructive"
        });
        setDragState({ resizeMode: null, draggedAppointment: null });
        return;
      }
      
      // Get the standard duration for this service type (for informational purposes)
      const appointmentService = draggedAppointment.service;
      let standardDuration = 60; // Default duration
      if (appointmentService && appointmentService.duration) {
        standardDuration = appointmentService.duration;
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
        setDragState({ resizeMode: null, draggedAppointment: null });
        return;
      }
      
      // Check for overlaps with other appointments
      const validation = validateAppointmentTime(
        day,
        format(start, 'HH:mm'),
        format(newEnd, 'HH:mm'),
        appointments,
        appointmentId
      );

      if (!validation.isValid) {
        toast({
          title: "Cannot resize appointment",
          description: validation.message,
          variant: "destructive"
        });
        setDragState({ resizeMode: null, draggedAppointment: null });
        return;
      }
      
      // Make sure we send a complete update to maintain consistency
      updateAppointment(appointmentId, {
        start: start,  // Keep the original start time
        end: newEnd,   // Use the new end time
        // Also include the date/time format for consistency
        date: start,
        time: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`,
        // Include a direct duration value to ensure it's preserved
        duration: durationMinutes
      });
      
      let durationMessage = `Duration set to ${durationMinutes} minutes`;
      if (durationMinutes !== standardDuration) {
        durationMessage += ` (standard for this service: ${standardDuration} minutes)`;
      }
      
      toast({
        title: "Appointment duration changed",
        description: durationMessage,
      });
      
    } else {
      // Moving the whole appointment
      // IMPORTANT: Preserve the actual appointment duration rather than using service default
      // Calculate the actual duration from the appointment's current start and end times
      const actualDurationMs = draggedAppointment.end.getTime() - draggedAppointment.start.getTime();
      
      // Calculate new end time based on the actual appointment duration
      newEnd = new Date(newStart.getTime() + actualDurationMs);
      
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
        setDragState({ resizeMode: null, draggedAppointment: null });
        return;
      }
      
      // Check for overlaps with other appointments
      const validation = validateAppointmentTime(
        day,
        format(newStart, 'HH:mm'),
        format(newEnd, 'HH:mm'),
        appointments,
        appointmentId
      );

      if (!validation.isValid) {
        toast({
          title: "Cannot move appointment",
          description: validation.message,
          variant: "destructive"
        });
        setDragState({ resizeMode: null, draggedAppointment: null });
        return;
      }
      
      // Update the appointment with new time but preserve other data
      // Calculate duration in minutes for consistency
      const durationInMinutes = Math.round(actualDurationMs / 60000);
      
      // We use both date/time and start/end to ensure consistent behavior
      updateAppointment(appointmentId, {
        date: newStart,
        time: `${newStart.getHours().toString().padStart(2, '0')}:${newStart.getMinutes().toString().padStart(2, '0')}`,
        start: newStart,
        end: newEnd,
        // Explicitly include duration to ensure it's preserved
        duration: durationInMinutes
      });
      
      toast({
        title: "Appointment moved",
        description: `Moved to ${format(newStart, 'EEEE, MMMM d')} at ${format(newStart, 'h:mm a')}`,
      });
    }
    
    setDragState({ resizeMode: null, draggedAppointment: null });
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDrop
  };
};
