
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Appointment, AppointmentFormData } from "@/types/appointment";
import { appointments as mockAppointments } from "@/data/mockData";
import { addMinutes, differenceInMinutes } from "date-fns";

type AppointmentContextType = {
  appointments: Appointment[];
  addAppointment: (data: AppointmentFormData) => void;
  updateAppointment: (id: string, data: Partial<AppointmentFormData>) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentById: (id: string) => Appointment | undefined;
  updateAppointmentDuration: (id: string, newEnd: Date) => void;
};

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error("useAppointments must be used within an AppointmentProvider");
  }
  return context;
};

export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  const addAppointment = (data: AppointmentFormData) => {
    // Find the client, service from the data
    const { clientId, serviceId, stylistId, date, time, notes } = data;
    
    // Parse time (format: "HH:MM")
    const [hours, minutes] = time.split(":").map(Number);
    
    const start = new Date(date);
    start.setHours(hours, minutes, 0, 0);
    
    // Assuming we have access to the service duration
    const duration = 60; // Default to 60 minutes if not found
    const end = addMinutes(start, duration);
    
    const newAppointment: Appointment = {
      id: `appointment-${Date.now()}`,
      title: data.title,
      clientId,
      // @ts-ignore - In a real app, we would fetch the client
      client: { id: clientId, name: data.title.split(' - ')[0] },
      serviceId,
      // @ts-ignore - In a real app, we would fetch the service
      service: { id: serviceId, name: data.title.split(' - ')[1], duration, price: 0 },
      stylistId,
      start,
      end,
      status: 'scheduled',
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setAppointments([...appointments, newAppointment]);
  };

  const updateAppointment = (id: string, data: Partial<AppointmentFormData>) => {
    setAppointments(prev => 
      prev.map(appointment => {
        if (appointment.id === id) {
          const updatedAppointment = { ...appointment };
          
          if (data.title) {
            updatedAppointment.title = data.title;
          }
          
          if (data.clientId) {
            updatedAppointment.clientId = data.clientId;
            // Preserve client name in the title
            const servicePart = updatedAppointment.title.split(' - ')[1] || '';
            updatedAppointment.title = `${appointment.client.name} - ${servicePart}`;
          }
          
          if (data.serviceId) {
            updatedAppointment.serviceId = data.serviceId;
            // Preserve service name in the title
            const clientPart = updatedAppointment.title.split(' - ')[0] || '';
            updatedAppointment.title = `${clientPart} - ${appointment.service.name}`;
          }
          
          if (data.stylistId) {
            updatedAppointment.stylistId = data.stylistId;
          }
          
          if (data.date) {
            let newStart;
            
            if (data.time) {
              // Handle time as string (HH:MM)
              const [hours, minutes] = data.time.split(":").map(Number);
              newStart = new Date(data.date);
              newStart.setHours(hours, minutes, 0, 0);
            } else {
              // Handle when date is already a Date object with time
              newStart = new Date(data.date);
            }
            
            // Calculate duration from current start/end
            const currentDuration = differenceInMinutes(appointment.end, appointment.start);
            
            updatedAppointment.start = newStart;
            updatedAppointment.end = addMinutes(newStart, currentDuration);
          }
          
          if (data.notes !== undefined) {
            updatedAppointment.notes = data.notes;
          }
          
          updatedAppointment.updatedAt = new Date();
          
          return updatedAppointment;
        }
        return appointment;
      })
    );
  };

  const updateAppointmentDuration = (id: string, newEnd: Date) => {
    setAppointments(prev => 
      prev.map(appointment => {
        if (appointment.id === id) {
          const updatedAppointment = { ...appointment };
          updatedAppointment.end = newEnd;
          
          // Update the service duration
          const newDuration = differenceInMinutes(newEnd, appointment.start);
          updatedAppointment.service = {
            ...appointment.service,
            duration: newDuration
          };
          
          updatedAppointment.updatedAt = new Date();
          return updatedAppointment;
        }
        return appointment;
      })
    );
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter(appointment => appointment.id !== id));
  };

  const getAppointmentById = (id: string) => {
    return appointments.find(appointment => appointment.id === id);
  };

  const value = {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentById,
    updateAppointmentDuration,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};
