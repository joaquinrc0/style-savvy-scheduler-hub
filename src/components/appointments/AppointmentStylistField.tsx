import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { AppointmentFormType } from "./AppointmentFormConfig.tsx";

interface AppointmentStylistFieldProps {
  form: UseFormReturn<AppointmentFormType>;
  stylists: any[];
  disabled?: boolean;
}

export const AppointmentStylistField = ({
  form,
  stylists,
  disabled = false,
}: AppointmentStylistFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="stylistId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Stylist</FormLabel>
          <Select
            onValueChange={(value) => {
              console.log('Stylist selection changed to:', value);
              field.onChange(value);
            }}
            value={field.value || ""}
            disabled={disabled}
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
  );
};
