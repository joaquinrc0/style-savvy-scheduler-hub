import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { AppointmentFormType } from "./AppointmentFormConfig.tsx";

interface AppointmentServiceFieldProps {
  form: UseFormReturn<AppointmentFormType>;
  services: any[];
  disabled?: boolean;
  onServiceChange: (serviceId: string) => void;
}

export const AppointmentServiceField = ({
  form,
  services,
  disabled = false,
  onServiceChange,
}: AppointmentServiceFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="serviceId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service</FormLabel>
          <Select
            onValueChange={(value) => {
              console.log('Service selection changed to:', value);
              // First update field value using react-hook-form
              field.onChange(value);
              // Then call our handler
              onServiceChange(value);
            }}
            value={field.value || ""}
            disabled={disabled}
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
  );
};
