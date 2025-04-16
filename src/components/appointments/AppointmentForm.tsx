
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useAppointments } from "@/contexts/AppointmentContext";
import { clients, services, stylists } from "@/data/mockData";
import { AppointmentFormData, Appointment } from "@/types/appointment";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  clientId: z.string().min(1, { message: "Please select a client" }),
  serviceId: z.string().min(1, { message: "Please select a service" }),
  stylistId: z.string().min(1, { message: "Please select a stylist" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, { message: "Please select a time" }),
  notes: z.string().optional(),
});

const timeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = Math.floor((i + 16) / 2) % 12 || 12;
  const minute = (i % 2) * 30;
  const ampm = Math.floor((i + 16) / 2) < 12 ? "AM" : "PM";
  return {
    value: `${String(Math.floor((i + 16) / 2) % 24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    label: `${hour}:${String(minute).padStart(2, "0")} ${ampm}`,
  };
});

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
  const { addAppointment, updateAppointment, getAppointmentById } = useAppointments();
  const [title, setTitle] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      serviceId: "",
      stylistId: "",
      time: "09:00",
      notes: "",
    },
  });

  useEffect(() => {
    if (appointmentId) {
      const appointment = getAppointmentById(appointmentId);
      if (appointment) {
        form.reset({
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          stylistId: appointment.stylistId,
          date: appointment.start,
          time: format(appointment.start, "HH:mm"),
          notes: appointment.notes || "",
        });
        updateTitle(appointment.clientId, appointment.serviceId);
      }
    } else {
      form.reset({
        clientId: "",
        serviceId: "",
        stylistId: "",
        date: new Date(),
        time: "09:00",
        notes: "",
      });
      setTitle("");
    }
  }, [appointmentId, isOpen, getAppointmentById, form]);

  const updateTitle = (clientId: string, serviceId: string) => {
    const client = clients.find((c) => c.id === clientId);
    const service = services.find((s) => s.id === serviceId);
    
    if (client && service) {
      setTitle(`${client.name} - ${service.name}`);
    } else if (client) {
      setTitle(`${client.name} - Service`);
    } else if (service) {
      setTitle(`Client - ${service.name}`);
    } else {
      setTitle("");
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const formData: AppointmentFormData = {
      title,
      clientId: data.clientId,
      serviceId: data.serviceId,
      stylistId: data.stylistId,
      date: data.date,
      time: data.time,
      notes: data.notes,
    };

    if (appointmentId) {
      updateAppointment(appointmentId, formData);
    } else {
      addAppointment(formData);
    }
    
    onClose();
  };

  const handleClientChange = (value: string) => {
    form.setValue("clientId", value);
    updateTitle(value, form.getValues("serviceId"));
  };

  const handleServiceChange = (value: string) => {
    form.setValue("serviceId", value);
    updateTitle(form.getValues("clientId"), value);
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
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={(value) => handleClientChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select
                    onValueChange={(value) => handleServiceChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.duration} min - ${service.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stylistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stylist</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a stylist" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stylists.map((stylist) => (
                        <SelectItem key={stylist.id} value={stylist.id}>
                          {stylist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requests or information"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-salon-600 hover:bg-salon-700">
                {appointmentId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
