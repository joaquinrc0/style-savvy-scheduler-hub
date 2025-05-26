import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addMinutes } from "date-fns";
import { useAppointments } from "@/contexts/AppointmentContext";
import { clients, services, stylists } from "@/data/mockData";
import { AppointmentFormData } from "@/types/appointment";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

// Import new components
import { AppointmentClientField } from "./AppointmentClientField.tsx";
import { AppointmentServiceField } from "./AppointmentServiceField.tsx";
import { AppointmentStylistField } from "./AppointmentStylistField.tsx";
import { AppointmentScheduleFields } from "./AppointmentScheduleFields.tsx";
import { AppointmentNotesField } from "./AppointmentNotesField.tsx";
import { validateAppointmentTime, generateAppointmentTitle } from "./AppointmentValidation.ts";
import { formSchema, getDefaultFormValues, AppointmentFormType } from "./AppointmentFormConfig.tsx";

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string;
}

export function AppointmentForm({
  isOpen,
  onClose,
  appointmentId,
}: AppointmentFormProps) {
  const { addAppointment, updateAppointment, deleteAppointment, getAppointmentById, appointments } = useAppointments();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [serviceDuration, setServiceDuration] = useState(60); // Default 60 minutes
  const [shouldUpdateEndTime, setShouldUpdateEndTime] = useState(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");

  // Initialize form with schema validation
  const form = useForm<AppointmentFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...getDefaultFormValues(),
      date: new Date(),
    },
  });

  // Load appointment data when editing an existing appointment
  useEffect(() => {
    if (appointmentId && clients.length > 0 && services.length > 0 && stylists.length > 0) {
      const appointment = getAppointmentById(appointmentId);
      // 'Editing appointment:', appointment);
      // 'Complete appointment object:', JSON.stringify(appointment, null, 2));
      
      if (appointment) {
        // Calculate duration between start and end times
        const durationInMinutes = Math.round(
          (appointment.end.getTime() - appointment.start.getTime()) / 60000
        );
        
        // `Setting duration to ${durationInMinutes} minutes`);
        setServiceDuration(durationInMinutes);
        setShouldUpdateEndTime(false); // Don't auto-update when editing
        
        // Get client ID from either clientId property or client object
        let actualClientId = appointment.clientId;
        
        // Deep debugging of client object
        // 'Client object:', appointment.client);
        if (appointment.client) {
          // 'Client object keys:', Object.keys(appointment.client));
          for (const key in appointment.client) {
            // `Client property ${key}:`, appointment.client[key]);
          }
        }
        
        // Try multiple approaches to get the client ID
        if (!actualClientId && appointment.client) {
          if (appointment.client.id) {
            actualClientId = appointment.client.id;
            // `Extracted client ID from client.id: ${actualClientId}`);
          } else if (typeof appointment.client === 'string') {
            actualClientId = appointment.client;
            // `Client appears to be a string ID: ${actualClientId}`);
          } else if (appointment.client && 'id' in appointment.client) {
            actualClientId = appointment.client.id;
            // `Extracted client ID from client.id: ${actualClientId}`);
          }
        }
        
        // Try to extract from title as last resort
        if (!actualClientId && appointment.title) {
          // Parse title like "Robert Brown - Hair Coloring" to get client name
          const clientName = appointment.title.split(' - ')[0];
          // `Extracted client name from title: ${clientName}`);
          
          // Try to find a matching client by name
          // Find client by matching name in a type-safe way
          const matchingClient = clients.find(client => {
            // Get client name using a safe approach
            let fullName = '';
            
            // Check if client has the necessary properties
            if (client && typeof client === 'object') {
              if ('name' in client && typeof client.name === 'string') {
                fullName = client.name;
              } else if ('firstName' in client && 'lastName' in client) {
                // Safely access firstName and lastName if they exist
                const firstName = String(client['firstName'] || '');
                const lastName = String(client['lastName'] || '');
                fullName = `${firstName} ${lastName}`.trim();
              }
            }
            
            return fullName === clientName;
          });
          
          if (matchingClient) {
            actualClientId = matchingClient.id;
            // `Found matching client by name: ${actualClientId}`);
          }
        }
        
        // Check if client exists - important for debugging
        if (actualClientId) {
          const clientExists = clients.some(c => c.id === actualClientId);
          // `Client ${actualClientId} exists in client list: ${clientExists}`);
          
          if (!clientExists) {
            console.error(`Client with ID ${actualClientId} not found in client list`);
          }
        } else {
          console.warn("Appointment has no client ID");
        }
        
        // Save the extracted client ID in state
        setSelectedClient(actualClientId || "");
        
        // If we couldn't get the client ID directly, try one more extraction from the title
        if (!actualClientId && appointment.title) {
          // Explicitly parse the client's name from the title and look it up in clients array
          const titleParts = appointment.title.split(' - ');
          if (titleParts.length > 0) {
            const clientName = titleParts[0];
            // `Last attempt: Extracted client name from title: ${clientName}`);
            
            // Find client by matching name in a type-safe way
            for (const client of clients) {
              // Get client name using a safe approach
              let fullName = '';
              
              // Check if client has the necessary properties
              if (client && typeof client === 'object') {
                if ('name' in client && typeof client.name === 'string') {
                  fullName = client.name;
                } else if ('firstName' in client && 'lastName' in client) {
                  // Safely access firstName and lastName if they exist
                  const firstName = String(client.firstName || '');
                  const lastName = String(client.lastName || '');
                  fullName = `${firstName} ${lastName}`.trim();
                }
              }
              
              if (fullName === clientName && client.id) {
                actualClientId = client.id;
                // `Found client by name match: ${actualClientId}`);
                break;
              }
            }
          }
        }
        
        // Store the found client ID for later use
        if (actualClientId) {
          setSelectedClient(actualClientId);
          // `Saved client ID to state: ${actualClientId}`);
        }
        
        // Create complete form values object
        const formValues = {
          clientId: actualClientId || "",
          serviceId: appointment.serviceId || "",
          stylistId: appointment.stylistId || "",
          date: appointment.start,
          time: format(appointment.start, "HH:mm"),
          endTime: format(appointment.end, "HH:mm"),
          notes: appointment.notes || "",
        };
        
        // 'Creating form values with client ID:', actualClientId);
        // 'Setting form values with form.reset:', formValues);
        
        // Reset form with all values at once
        form.reset(formValues);
        
        // Set title after form values
        setTitle(generateAppointmentTitle(
          appointment.clientId || "", 
          appointment.serviceId || "",
          clients,
          services
        ));
        
        setInitialDataLoaded(true);
      }
    } else if (!appointmentId) {
      // New appointment defaults
      setServiceDuration(60);
      setShouldUpdateEndTime(true);
      form.reset({
        ...getDefaultFormValues(),
        date: new Date(),
      });
      setTitle("");
      setInitialDataLoaded(true);
    }
  }, [appointmentId, clients, services, stylists, getAppointmentById, form]);

  // Handle client selection changes
  const handleClientChange = (clientId: string) => {
    // Store the selected client ID in state for reliable access during form submission
    setSelectedClient(clientId);
    
    // Ensure the form value is set directly as well
    form.setValue('clientId', clientId, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    
    // Update title with the selected client and service
    const serviceId = form.getValues().serviceId;
    setTitle(generateAppointmentTitle(clientId, serviceId, clients, services));
  };

  // Handle service selection changes
  const handleServiceChange = (serviceId: string) => {
    // Update title
    const clientId = form.getValues().clientId;
    setTitle(generateAppointmentTitle(clientId, serviceId, clients, services));
    
    // Find the selected service to get its duration
    const service = services.find(s => s.id === serviceId);
    
    if (service) {
      // Important: Make sure to parse service duration as a number
      const duration = parseInt(service.duration.toString(), 10);
      setServiceDuration(duration);
      
      // Update end time based on start time + duration
      if (shouldUpdateEndTime) {
        const startTime = form.getValues().time;
        const date = form.getValues().date;
        
        if (startTime && date) {
          const [hours, minutes] = startTime.split(":").map(Number);
          const startDate = new Date(date);
          startDate.setHours(hours, minutes, 0, 0);
          const endDate = addMinutes(startDate, duration);
          const newEndTime = format(endDate, "HH:mm");
          form.setValue("endTime", newEndTime);
        }
      }
    }
  };

  // Handle time selection changes
  const handleStartTimeChange = (time: string) => {
    // Always update end time when start time changes, maintaining the duration
    const date = form.getValues().date;
    if (date) {
      const [hours, minutes] = time.split(":").map(Number);
      const startDate = new Date(date);
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = addMinutes(startDate, serviceDuration);
      const newEndTime = format(endDate, "HH:mm");
      form.setValue("endTime", newEndTime);
    }
  };
  
  const handleEndTimeChange = (time: string) => {
    // When end time is changed manually, don't auto-update from start time
    setShouldUpdateEndTime(false);
    
    // Update duration based on start and end time
    const startTime = form.getValues().time;
    const date = form.getValues().date;
    
    if (startTime && date) {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = time.split(":").map(Number);
      
      const startDate = new Date(date);
      startDate.setHours(startHours, startMinutes, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(endHours, endMinutes, 0, 0);
      
      // Handle case where end time is on the next day
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      const newDuration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
      setServiceDuration(newDuration);
    }
  };

  // Delete appointment handler
  const handleDeleteAppointment = () => {
    if (!appointmentId) return;
    
    // Confirm with the user before deletion
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        deleteAppointment(appointmentId);
        toast({
          title: "Appointment Deleted",
          description: "The appointment has been successfully deleted.",
        });
        onClose();
      } catch (error) {
        console.error("Error deleting appointment:", error);
        toast({
          title: "Error",
          description: "Failed to delete the appointment. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Form submission handler
  const onSubmit = (data: any) => {
    // Ensure we get the current form values for all fields
    const currentFormValues = form.getValues();
    
    // Get the final client ID, with multiple fallbacks to ensure we capture it
    let finalClientId = data.clientId || currentFormValues.clientId || selectedClient;
    
    // Basic validation for required fields
    if (!finalClientId || finalClientId.trim() === '') {
      toast({
        title: "Missing Client",
        description: "Please select a client for this appointment",
        variant: "destructive"
      });
      return;
    }
    
    if (!data.serviceId || data.serviceId.trim() === '') {
      toast({
        title: "Missing Service",
        description: "Please select a service for this appointment",
        variant: "destructive"
      });
      return;
    }
    
    if (!data.stylistId || data.stylistId.trim() === '') {
      toast({
        title: "Missing Stylist",
        description: "Please select a stylist for this appointment",
        variant: "destructive"
      });
      return;
    }
    
    // Check for overlapping appointments
    const validation = validateAppointmentTime(
      data.date, 
      data.time, 
      data.endTime, 
      appointments,
      appointmentId
    );
    
    if (!validation.isValid) {
      toast({
        title: "Invalid Appointment Time",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    const formData: AppointmentFormData = {
      title,
      clientId: finalClientId,
      serviceId: data.serviceId,
      stylistId: data.stylistId,
      date: data.date,
      time: data.time,
      endTime: data.endTime,
      duration: serviceDuration,
      notes: data.notes,
    };

    if (appointmentId) {
      updateAppointment(appointmentId, formData);
    } else {
      addAppointment(formData);
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {appointmentId ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
          <DialogDescription>
            {appointmentId
              ? "Update the appointment details below"
              : "Fill in the details to schedule a new appointment"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AppointmentClientField
              form={form}
              clients={clients}
              disabled={!initialDataLoaded}
              onClientChange={handleClientChange}
            />
            
            <AppointmentServiceField
              form={form}
              services={services}
              disabled={!initialDataLoaded}
              onServiceChange={handleServiceChange}
            />
            
            <AppointmentStylistField
              form={form}
              stylists={stylists}
              disabled={!initialDataLoaded}
            />
            
            <AppointmentScheduleFields
              form={form}
              serviceDuration={serviceDuration}
              shouldUpdateEndTime={shouldUpdateEndTime}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
            />
            
            <AppointmentNotesField form={form} />
            
            <DialogFooter>
              <div className="flex justify-between w-full">
                {appointmentId && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDeleteAppointment}
                  >
                    Delete
                  </Button>
                )}
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-salon-600 hover:bg-salon-700">
                    {appointmentId ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
