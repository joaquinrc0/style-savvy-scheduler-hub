
import { Client, Appointment, Service, AppointmentStatus } from "@/types/appointment";

// Stylists
export const stylists = [
  { id: "stylist-1", name: "Emma Johnson", specialties: ["Haircut", "Color"] },
  { id: "stylist-2", name: "Michael Smith", specialties: ["Styling", "Extensions"] },
  { id: "stylist-3", name: "Sophia Garcia", specialties: ["Color", "Treatment"] },
  { id: "stylist-4", name: "David Wilson", specialties: ["Haircut", "Beard"] },
];

// Services
export const services: Service[] = [
  {
    id: "service-1",
    name: "Women's Haircut",
    description: "Professional haircut service for women",
    duration: 60,
    price: 60,
  },
  {
    id: "service-2",
    name: "Men's Haircut",
    description: "Professional haircut service for men",
    duration: 30,
    price: 30,
  },
  {
    id: "service-3",
    name: "Hair Coloring",
    description: "Full hair coloring service",
    duration: 120,
    price: 120,
  },
  {
    id: "service-4",
    name: "Blowout & Styling",
    description: "Hair blowout and styling service",
    duration: 45,
    price: 45,
  },
  {
    id: "service-5",
    name: "Hair Treatment",
    description: "Specialized hair treatment for damaged hair",
    duration: 60,
    price: 80,
  },
];

// Clients
export const clients: Client[] = [
  {
    id: "client-1",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "555-123-4567",
    notes: "Prefers afternoon appointments",
    createdAt: new Date(2023, 1, 15),
  },
  {
    id: "client-2",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "555-987-6543",
    notes: "Allergic to certain hair products",
    createdAt: new Date(2023, 2, 20),
  },
  {
    id: "client-3",
    name: "Emily Johnson",
    email: "emily.johnson@example.com",
    phone: "555-456-7890",
    createdAt: new Date(2023, 3, 10),
  },
  {
    id: "client-4",
    name: "Robert Brown",
    email: "robert.brown@example.com",
    phone: "555-567-8901",
    notes: "Prefers early morning appointments",
    createdAt: new Date(2023, 4, 5),
  },
  {
    id: "client-5",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "555-678-9012",
    createdAt: new Date(2023, 5, 12),
  },
];

// Helper to generate random appointments
const generateAppointments = (): Appointment[] => {
  const statuses: AppointmentStatus[] = ['scheduled', 'completed', 'cancelled', 'no-show'];
  const today = new Date();
  const appointments: Appointment[] = [];

  // Generate past appointments (last 30 days)
  for (let i = 0; i < 30; i++) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - i);
    
    if (Math.random() > 0.6) { // Only generate for some days
      const numAppointments = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numAppointments; j++) {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        const stylist = stylists[Math.floor(Math.random() * stylists.length)];
        const status = i === 0 ? 'scheduled' : statuses[Math.floor(Math.random() * statuses.length)];
        
        const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
        const start = new Date(pastDate);
        start.setHours(startHour, 0, 0, 0);
        
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + service.duration);
        
        appointments.push({
          id: `appointment-${i}-${j}`,
          title: `${client.name} - ${service.name}`,
          clientId: client.id,
          client: client,
          serviceId: service.id,
          service: service,
          stylistId: stylist.id,
          start: start,
          end: end,
          status: status,
          notes: Math.random() > 0.7 ? "Special requests noted" : undefined,
          createdAt: new Date(pastDate.setDate(pastDate.getDate() - 1)),
          updatedAt: pastDate,
        });
      }
    }
  }
  
  // Generate future appointments (next 30 days)
  for (let i = 1; i < 30; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    
    if (Math.random() > 0.6) { // Only generate for some days
      const numAppointments = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numAppointments; j++) {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        const stylist = stylists[Math.floor(Math.random() * stylists.length)];
        
        const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
        const start = new Date(futureDate);
        start.setHours(startHour, 0, 0, 0);
        
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + service.duration);
        
        appointments.push({
          id: `appointment-future-${i}-${j}`,
          title: `${client.name} - ${service.name}`,
          clientId: client.id,
          client: client,
          serviceId: service.id,
          service: service,
          stylistId: stylist.id,
          start: start,
          end: end,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }
  
  return appointments;
};

export const appointments = generateAppointments();

// KPI data
export const kpiData = {
  revenue: {
    daily: [
      { date: "Mon", amount: 450 },
      { date: "Tue", amount: 380 },
      { date: "Wed", amount: 520 },
      { date: "Thu", amount: 410 },
      { date: "Fri", amount: 650 },
      { date: "Sat", amount: 720 },
      { date: "Sun", amount: 380 },
    ],
    monthly: [
      { date: "Jan", amount: 12800 },
      { date: "Feb", amount: 14200 },
      { date: "Mar", amount: 15100 },
      { date: "Apr", amount: 16300 },
      { date: "May", amount: 17500 },
      { date: "Jun", amount: 18200 },
      { date: "Jul", amount: 17100 },
      { date: "Aug", amount: 16900 },
      { date: "Sep", amount: 18400 },
      { date: "Oct", amount: 19200 },
      { date: "Nov", amount: 20100 },
      { date: "Dec", amount: 22500 },
    ],
  },
  appointments: {
    total: 1254,
    completed: 1135,
    cancelled: 89,
    noShow: 30,
    conversionRate: 0.91,
  },
  services: {
    distribution: [
      { name: "Women's Haircut", value: 35 },
      { name: "Men's Haircut", value: 25 },
      { name: "Hair Coloring", value: 20 },
      { name: "Blowout & Styling", value: 15 },
      { name: "Hair Treatment", value: 5 },
    ],
  },
  clients: {
    total: 752,
    new: 48,
    returning: 352,
    retention: 0.78,
  },
};
