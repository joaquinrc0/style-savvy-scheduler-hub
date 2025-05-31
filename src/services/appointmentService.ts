// src/services/appointmentService.ts
import { Appointment, AppointmentFormData } from "@/types/appointment";
import stylistsApi, { Stylist } from "./stylistsApi";
import { API_BASE_URL } from "@/config";

// Use the centralized API configuration
const APPOINTMENTS_API_URL = `${API_BASE_URL}/api`;

// Helper to parse dates from API response and map fields
const parseAppointmentFromAPI = (
  apiAppointment: any,
  stylists: Stylist[]
): Appointment => {
  const stylist = stylists.find(
    s => s.id === apiAppointment.stylist_id?.toString()
  );

  return {
    id: apiAppointment.id.toString(),
    title: apiAppointment.title, 
    clientId: apiAppointment.user?.toString() || "", 
    client: { 
      id: apiAppointment.user?.toString() || "",
      name: `User ${apiAppointment.user?.toString()}`, 
      email: "", phone: "", createdAt: new Date()
    },
    serviceId: apiAppointment.service_id?.toString() || "", 
    service: { 
      id: apiAppointment.service_id?.toString() || "",
      name: "Service Name", 
      description: "",
      duration: differenceInMinutes(new Date(apiAppointment.end_time), new Date(apiAppointment.start_time)),
      price: 0,
    },
    stylistId: apiAppointment.stylist_id?.toString() || "",
    stylist,  // Include the fetched stylist data if available
    start: new Date(apiAppointment.start_time),
    end: new Date(apiAppointment.end_time),
    status: apiAppointment.status || 'scheduled',
    notes: apiAppointment.description, 
    createdAt: new Date(apiAppointment.created_at),
    updatedAt: new Date(apiAppointment.updated_at),
  };
};

// Prepare data for sending to API
const prepareAppointmentForAPI = (data: Partial<AppointmentFormData> | Partial<Appointment>): any => {
  const apiData: any = {};

  // Map fields from frontend types to backend model fields
  if (data.title) apiData.title = data.title;
  if (data.notes) apiData.description = data.notes; // Map notes to description
  
  // Handle status (only exists on Appointment, not AppointmentFormData)
  if ('status' in data && data.status) {
    apiData.status = data.status;
  }

  // Handle dates and times from form data or from direct appointment objects
  if ('date' in data && data.date) {
    // Form data case: we have separate date and time fields
    if ('time' in data && data.time) {
      // Set start time
      const [hours, minutes] = data.time.split(":").map(Number);
      const startDate = new Date(data.date);
      startDate.setHours(hours, minutes, 0, 0);
      apiData.start_time = startDate.toISOString();
      
      // Handle end time
      if ('endTime' in data && data.endTime) {
        // If explicit end time is provided, use it
        const [endHours, endMinutes] = data.endTime.split(":").map(Number);
        const endDate = new Date(data.date);
        endDate.setHours(endHours, endMinutes, 0, 0);
        
        // Ensure end time is after start time
        if (endDate <= startDate) {
          // If end time is before or equal to start time, default to duration-based end time
          const serviceDuration = getDurationForAppointment(data);
          endDate.setTime(startDate.getTime() + (serviceDuration * 60000));
        }
        
        apiData.end_time = endDate.toISOString();
      } else {
        // No explicit end time, calculate based on duration
        const serviceDuration = getDurationForAppointment(data);
        const endDate = new Date(startDate.getTime() + (serviceDuration * 60000));
        apiData.end_time = endDate.toISOString();
      }
    }
  } else { 
    // Direct appointment object case with start and end dates
    if ('start' in data && data.start) {
      const startValue = data.start as Date | string;
      const startDate = startValue instanceof Date ? startValue : new Date(startValue);
      apiData.start_time = startDate.toISOString();
      
      // When explicit duration is provided, it should take precedence over end date
      if ('duration' in data && data.duration) {
        // Calculate end time based on start time + explicit duration
        const durationMinutes = Number(data.duration);
        const endDate = new Date(startDate.getTime() + (durationMinutes * 60000));
        apiData.end_time = endDate.toISOString();
        console.log(`Using explicit duration of ${durationMinutes} minutes to calculate end time`);
      }
      // If no explicit duration but end date is provided
      else if ('end' in data && data.end) {
        const endValue = data.end as Date | string;
        apiData.end_time = endValue instanceof Date ? 
          endValue.toISOString() : new Date(endValue).toISOString();
      }
      // If neither duration nor end date provided, use default duration
      else {
        // Default duration of 60 minutes
        const endDate = new Date(startDate.getTime() + (60 * 60000));
        apiData.end_time = endDate.toISOString();
      }
    }
    // If only end date is provided without start (unusual case)
    else if ('end' in data && data.end) {
      const endValue = data.end as Date | string;
      apiData.end_time = endValue instanceof Date ? 
        endValue.toISOString() : new Date(endValue).toISOString();
    }
  }
  
  // Helper function to get duration from different sources
  function getDurationForAppointment(data: any): number {
    // First try explicit duration
    if ('duration' in data && data.duration) {
      return Number(data.duration);
    } 
    // Then try to get from service
    else if ('serviceId' in data && data.serviceId && 'service' in data) {
      const service = data.service as { duration?: number };
      return service?.duration || 60; // Default to 60 minutes if service has no duration
    } 
    // Default
    else {
      return 60; // Default to 60 minutes if no duration specified
    }
  }

  // For development, always use user ID 1 (admin) since we're not implementing real auth
  // In production, you'd use the authenticated user ID
  apiData.user = 1;
  
  console.log('Using user ID 1 for appointment');

  // Add serviceId and stylistId
  if ('serviceId' in data && data.serviceId) apiData.service_id = data.serviceId;
  if ('stylistId' in data && data.stylistId) apiData.stylist_id = data.stylistId;
  
  return apiData;
};

// Helper for calculating duration
const differenceInMinutes = (dateLeft: Date, dateRight: Date): number => {
  return Math.round((dateLeft.getTime() - dateRight.getTime()) / 60000);
};

// Fetch all appointments
export const fetchAppointments = async (stylists: Stylist[]): Promise<Appointment[]> => {
  try {
    // Log the URL we're fetching from for debugging
    console.log(`Fetching appointments from: ${APPOINTMENTS_API_URL}/appointments/`);
    
    const response = await fetch(`${APPOINTMENTS_API_URL}/appointments/`, {
      method: 'GET',
      credentials: 'include', // Include cookies for session authentication
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });
    
    // Check response content type to make sure we're getting JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response:', await response.text());
      throw new Error('Server returned non-JSON response. Check authentication and API endpoint.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to fetch appointments" }));
      throw new Error(errorData.detail || "Failed to fetch appointments");
    }
    
    const data = await response.json();
    // If data is empty array, that's fine, just return empty list
    
    // Process each appointment sequentially to include stylist data
    const appointments: Appointment[] = [];
    for (const appointmentData of data || []) {
      const appointment = parseAppointmentFromAPI(appointmentData, stylists);
      appointments.push(appointment);
    }
    
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

// Create a new appointment
export const createAppointment = async (appointmentData: AppointmentFormData, stylists: Stylist[]): Promise<Appointment> => {
  const apiData = prepareAppointmentForAPI(appointmentData);

  try {
    console.log(`Creating appointment at: ${APPOINTMENTS_API_URL}/appointments/`, apiData);
    
    const response = await fetch(`${APPOINTMENTS_API_URL}/appointments/`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response:', await response.text());
      throw new Error('Server returned non-JSON response. Check authentication and API endpoint.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to create appointment" }));
      console.error("Create appointment error:", errorData);
      throw new Error(errorData.detail || JSON.stringify(errorData) || "Failed to create appointment");
    }
    
    const data = await response.json();
    return parseAppointmentFromAPI(data, stylists);
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

// Update an existing appointment
export const updateAppointmentAPI = async (id: string, appointmentData: Partial<AppointmentFormData> | Partial<Appointment>, stylists: Stylist[]): Promise<Appointment> => {
  const apiData = prepareAppointmentForAPI(appointmentData);

  try {
    console.log(`Updating appointment at: ${APPOINTMENTS_API_URL}/appointments/${id}/`, apiData);
    
    const response = await fetch(`${APPOINTMENTS_API_URL}/appointments/${id}/`, {
      method: "PUT",
      credentials: 'include',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response:', await response.text());
      throw new Error('Server returned non-JSON response. Check authentication and API endpoint.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to update appointment" }));
      console.error("Update appointment error:", errorData);
      throw new Error(errorData.detail || JSON.stringify(errorData) || "Failed to update appointment");
    }
    
    const data = await response.json();
    return parseAppointmentFromAPI(data, stylists);
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

// Delete an appointment
export const deleteAppointmentAPI = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting appointment at: ${APPOINTMENTS_API_URL}/appointments/${id}/`);
    
    const response = await fetch(`${APPOINTMENTS_API_URL}/appointments/${id}/`, {
      method: "DELETE",
      credentials: 'include',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok && response.status !== 204) { // 204 No Content is a success
      // Try to parse error response if it's JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to delete appointment" }));
        throw new Error(errorData.detail || "Failed to delete appointment");
      } else {
        // If not JSON, get text
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(errorText || "Failed to delete appointment");
      }
    }
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
};