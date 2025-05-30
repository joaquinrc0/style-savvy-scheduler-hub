import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { AppointmentFormType } from "./AppointmentFormConfig.tsx";

interface AppointmentClientFieldProps {
  form: UseFormReturn<AppointmentFormType>;
  clients: any[];
  disabled?: boolean;
  onClientChange: (clientId: string) => void;
}

export const AppointmentClientField = ({
  form,
  clients,
  disabled = false,
  onClientChange,
}: AppointmentClientFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="clientId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm">Client</FormLabel>
          <Select
            onValueChange={(value) => {
              console.log('Client selection changed to:', value);
              // Explicitly set both state variables to ensure consistency
              field.onChange(value);
              onClientChange(value);
              
              // Log additional debug info to help track value flow
              console.log('After selection change - field value:', field.value);
              console.log('After selection change - form value:', form.getValues().clientId);
            }}
            value={field.value || ""}
            disabled={disabled}
            // Force the select to reflect its value from the field
            defaultValue={field.value || ""}
          >
            <FormControl>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a client" className="text-sm" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[200px]">
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id} className="text-sm">
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};
