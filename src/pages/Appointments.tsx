
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { AppointmentProvider } from "@/contexts/AppointmentContext";

export default function AppointmentsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | undefined>(undefined);

  const handleAddAppointment = () => {
    setSelectedAppointmentId(undefined);
    setIsFormOpen(true);
  };

  const handleViewAppointment = (id: string) => {
    setSelectedAppointmentId(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAppointmentId(undefined);
  };

  return (
    <AppointmentProvider>
      <PageLayout>
        <div className="space-y-6">
          <h1 className="section-heading">Appointment Scheduler</h1>
          <AppointmentCalendar 
            onAddAppointment={handleAddAppointment} 
            onViewAppointment={handleViewAppointment}
          />
          <AppointmentForm 
            isOpen={isFormOpen} 
            onClose={handleCloseForm} 
            appointmentId={selectedAppointmentId}
          />
        </div>
      </PageLayout>
    </AppointmentProvider>
  );
}
