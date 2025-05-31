import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Appointment, AppointmentFormData } from "@/types/appointment";
// import { appointments as mockAppointments } from "@/data/mockData"; // No longer using mock data
import {
  fetchAppointments,
  createAppointment as createAppointmentAPI,
  updateAppointmentAPI,
  deleteAppointmentAPI
} from "@/services/appointmentService"; // Adjusted path
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { useStylists } from "@/contexts/StylistContext";

type AppointmentContextType = {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  addAppointment: (data: AppointmentFormData) => Promise<void>;
  updateAppointment: (id: string, data: Partial<AppointmentFormData> | Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getAppointmentById: (id: string) => Appointment | undefined;
  updateAppointmentDuration: (id: string, newEnd: Date) => Promise<void>; // Make async
  refetchAppointments: () => Promise<void>; // Added for manual refresh
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { stylists } = useStylists();

  const loadAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAppointments = await fetchAppointments(stylists);
      setAppointments(fetchedAppointments);
    } catch (err: any) {
      console.error("Failed to fetch appointments:", err);
      setError(err.message || "Failed to load appointments.");
      toast({
        title: "Error Loading Appointments",
        description: err.message || "Could not fetch appointments from the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stylists]);

  const addAppointment = async (data: AppointmentFormData) => {
    try {
      const newAppointment = await createAppointmentAPI(data, stylists);
      setAppointments(prev => [...prev, newAppointment]);
      toast({
        title: "Appointment Created",
        description: `Successfully created appointment: ${newAppointment.title}`,
      });
    } catch (err: any) {
      console.error("Failed to create appointment:", err);
      setError(err.message || "Failed to create appointment.");
      toast({
        title: "Error Creating Appointment",
        description: err.message || "Could not create the appointment.",
        variant: "destructive",
      });
      throw err; // Re-throw to allow components to handle if needed
    }
  };

  const updateAppointment = async (id: string, data: Partial<AppointmentFormData> | Partial<Appointment>) => {
    try {
      const updatedAppointmentData = await updateAppointmentAPI(id, data, stylists);
      setAppointments(prev => 
        prev.map(app => app.id === id ? updatedAppointmentData : app)
      );
      toast({
        title: "Appointment Updated",
        description: `Successfully updated appointment: ${updatedAppointmentData.title}`,
      });
    } catch (err: any) {
      console.error("Failed to update appointment:", err);
      setError(err.message || "Failed to update appointment.");
      toast({
        title: "Error Updating Appointment",
        description: err.message || "Could not update the appointment.",
        variant: "destructive",
      });
      throw err; // Re-throw
    }
  };

  const updateAppointmentDuration = async (id: string, newEnd: Date) => {
    const appointmentToUpdate = appointments.find(app => app.id === id);
    if (!appointmentToUpdate) {
      console.error(`Appointment with id ${id} not found for duration update.`);
      toast({
        title: "Error Updating Duration",
        description: `Appointment not found.`, 
        variant: "destructive"
      });
      return;
    }
    // Create a partial update object for the API
    const updateData: Partial<Appointment> = {
      start: appointmentToUpdate.start, // Keep original start time
      end: newEnd, // Set new end time
    };
    // Note: The API service's prepareAppointmentForAPI needs to correctly handle Partial<Appointment>
    // and convert 'start' and 'end' Date objects to 'start_time' and 'end_time' ISO strings.
    await updateAppointment(id, updateData); // Reuse the main update logic
  };

  const deleteAppointment = async (id: string) => {
    try {
      await deleteAppointmentAPI(id);
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      toast({
        title: "Appointment Deleted",
        description: "Successfully deleted the appointment.",
      });
    } catch (err: any) {
      console.error("Failed to delete appointment:", err);
      setError(err.message || "Failed to delete appointment.");
      toast({
        title: "Error Deleting Appointment",
        description: err.message || "Could not delete the appointment.",
        variant: "destructive",
      });
      throw err; // Re-throw
    }
  };

  const getAppointmentById = (id: string) => {
    return appointments.find(appointment => appointment.id === id);
  };

  const value = {
    appointments,
    isLoading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentById,
    updateAppointmentDuration,
    refetchAppointments: loadAppointments, // Expose refetch function
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};
