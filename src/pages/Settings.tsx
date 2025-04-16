
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

const salonSettingsSchema = z.object({
  salonName: z.string().min(2, { message: "Salon name must be at least 2 characters" }),
  ownerName: z.string().min(2, { message: "Owner name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  phone: z.string().min(5, { message: "Phone must be at least 5 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  description: z.string().optional(),
});

const appointmentSettingsSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  slotDuration: z.coerce.number().min(15, { message: "Minimum slot duration is 15 minutes" }),
  bufferTime: z.coerce.number().min(0, { message: "Buffer time cannot be negative" }),
  allowOnlineBooking: z.boolean(),
  requireDeposit: z.boolean(),
  sendReminders: z.boolean(),
  maxAdvanceBookingDays: z.coerce.number().min(1, { message: "Minimum 1 day required" }),
});

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("salon");

  // Salon Settings Form
  const salonForm = useForm<z.infer<typeof salonSettingsSchema>>({
    resolver: zodResolver(salonSettingsSchema),
    defaultValues: {
      salonName: "Belle Salon",
      ownerName: "Emma Johnson",
      address: "123 Salon Street, Beauty City, BC 12345",
      phone: "(555) 123-4567",
      email: "info@bellesalon.com",
      website: "https://www.bellesalon.com",
      description: "A premium hair salon offering a variety of services including haircuts, coloring, and styling.",
    },
  });

  // Appointment Settings Form
  const appointmentForm = useForm<z.infer<typeof appointmentSettingsSchema>>({
    resolver: zodResolver(appointmentSettingsSchema),
    defaultValues: {
      startTime: "09:00",
      endTime: "18:00",
      slotDuration: 30,
      bufferTime: 10,
      allowOnlineBooking: true,
      requireDeposit: false,
      sendReminders: true,
      maxAdvanceBookingDays: 30,
    },
  });

  const onSalonSubmit = (data: z.infer<typeof salonSettingsSchema>) => {
    toast({
      title: "Salon settings updated",
      description: "Your salon settings have been saved successfully.",
    });
    console.log("Salon settings:", data);
  };

  const onAppointmentSubmit = (data: z.infer<typeof appointmentSettingsSchema>) => {
    toast({
      title: "Appointment settings updated",
      description: "Your appointment settings have been saved successfully.",
    });
    console.log("Appointment settings:", data);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="section-heading">Settings</h1>

        <Tabs defaultValue="salon" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="salon">Salon Information</TabsTrigger>
            <TabsTrigger value="appointments">Appointment Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="salon" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Salon Information</CardTitle>
                <CardDescription>
                  Update your salon details and business information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...salonForm}>
                  <form onSubmit={salonForm.handleSubmit(onSalonSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={salonForm.control}
                        name="salonName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salon Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={salonForm.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={salonForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={salonForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={salonForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={salonForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Optional: Enter your salon's website URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={salonForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salon Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormDescription>
                            Brief description of your salon and services
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" className="bg-salon-600 hover:bg-salon-700">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Settings</CardTitle>
                <CardDescription>
                  Configure how appointments are scheduled and managed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...appointmentForm}>
                  <form onSubmit={appointmentForm.handleSubmit(onAppointmentSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Business Hours</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={appointmentForm.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Scheduling Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={appointmentForm.control}
                          name="slotDuration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Appointment Slot Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" min={15} {...field} />
                              </FormControl>
                              <FormDescription>
                                Default duration for appointment slots
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="bufferTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Buffer Time (minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} {...field} />
                              </FormControl>
                              <FormDescription>
                                Time buffer between appointments
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="maxAdvanceBookingDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Advance Booking (days)</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} {...field} />
                              </FormControl>
                              <FormDescription>
                                How far in advance clients can book
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Booking Preferences</h3>
                      <div className="space-y-4">
                        <FormField
                          control={appointmentForm.control}
                          name="allowOnlineBooking"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div>
                                <FormLabel className="text-base">Allow Online Booking</FormLabel>
                                <FormDescription>
                                  Enable clients to book appointments online
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="requireDeposit"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div>
                                <FormLabel className="text-base">Require Deposit</FormLabel>
                                <FormDescription>
                                  Require deposit payment for bookings
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="sendReminders"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div>
                                <FormLabel className="text-base">Send Appointment Reminders</FormLabel>
                                <FormDescription>
                                  Automatically send email/SMS reminders to clients
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="bg-salon-600 hover:bg-salon-700">
                        <Save className="mr-2 h-4 w-4" /> Save Settings
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
