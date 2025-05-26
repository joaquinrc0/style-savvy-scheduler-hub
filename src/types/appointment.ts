
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: Date;
  appointments?: Appointment[];
};

export type Appointment = {
  id: string;
  title: string;
  clientId: string;
  client: Client;
  serviceId: string;
  service: Service;
  stylistId: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AppointmentFormData = {
  title: string;
  clientId: string;
  serviceId: string;
  stylistId: string;
  date: Date;
  time: string;
  endTime?: string; // Optional end time in HH:MM format
  duration?: number; // Duration in minutes - calculated from service or custom
  notes?: string;
};
