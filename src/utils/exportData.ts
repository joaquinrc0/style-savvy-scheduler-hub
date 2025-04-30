import { format } from "date-fns";
import { Appointment } from "@/types/appointment";

export const exportCalendarData = (appointments: Appointment[]) => {
  // Prepare the data in the same format as mockData
  const exportData = {
    appointments: appointments.map(apt => ({
      id: apt.id,
      title: apt.title,
      clientId: apt.clientId,
      client: {
        id: apt.client.id,
        name: apt.client.name,
        email: apt.client.email,
        phone: apt.client.phone,
        notes: apt.client.notes,
        createdAt: apt.client.createdAt
      },
      serviceId: apt.serviceId,
      service: {
        id: apt.service.id,
        name: apt.service.name,
        description: apt.service.description,
        duration: apt.service.duration,
        price: apt.service.price
      },
      stylistId: apt.stylistId,
      start: apt.start.toISOString(),
      end: apt.end.toISOString(),
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.createdAt.toISOString(),
      updatedAt: apt.updatedAt.toISOString()
    }))
  };

  // Create the file
  const fileName = `salon-appointments-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};