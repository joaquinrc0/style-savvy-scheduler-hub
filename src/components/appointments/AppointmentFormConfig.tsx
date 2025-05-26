import { z } from "zod";

// Form validation schema
export const formSchema = z.object({
  clientId: z.string().min(1, { message: "Please select a client" }),
  serviceId: z.string().min(1, { message: "Please select a service" }),
  stylistId: z.string().min(1, { message: "Please select a stylist" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, { message: "Please select a time" }),
  endTime: z.string().min(1, { message: "Please select an end time" }),
  notes: z.string().optional(),
});

// Form data type based on schema
export type AppointmentFormValues = z.infer<typeof formSchema>;

// Create a generic type for our components to use with UseFormReturn
export type AppointmentFormType = z.infer<typeof formSchema>;

// Special fields that need additional handling
export const getDefaultFormValues = (): Partial<AppointmentFormValues> & { date: Date } => ({
  clientId: "",
  serviceId: "",
  stylistId: "",
  time: "09:00",
  endTime: "10:00",
  notes: "",
  date: new Date(), // Always include a default date
});
