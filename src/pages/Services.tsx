
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Plus, Edit, Trash, ChevronDown, Clock, DollarSign } from "lucide-react";
import { Service } from "@/types/appointment";
import PageLayout from "@/components/layout/PageLayout";
import { fetchServices, createService, updateService, deleteService } from "@/services/serviceApi";
import { toast } from "@/components/ui/use-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  duration: z.coerce.number().min(5, { message: "Duration must be at least 5 minutes" }),
  price: z.coerce.number().min(1, { message: "Price must be at least $1" }),
});

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch services on component mount
  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      try {
        const services = await fetchServices();
        setServiceList(services);
      } catch (error) {
        console.error("Failed to load services:", error);
        toast({
          title: "Error",
          description: "Failed to load services. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadServices();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 30,
      price: 0,
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredServices = serviceList.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddService = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const newService = await createService({
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
      });

      setServiceList([...serviceList, newService]);
      toast({
        title: "Success",
        description: "Service created successfully"
      });
      form.reset();
      setIsAddServiceOpen(false);
    } catch (error) {
      console.error("Failed to create service:", error);
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    form.reset({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
    });
    setIsAddServiceOpen(true);
  };

  const handleUpdateService = async (data: z.infer<typeof formSchema>) => {
    if (selectedService) {
      setIsSubmitting(true);
      try {
        const updatedService = await updateService(selectedService.id, {
          name: data.name,
          description: data.description,
          duration: data.duration,
          price: data.price,
        });

        const updatedServices = serviceList.map((service) =>
          service.id === selectedService.id ? updatedService : service
        );
        
        setServiceList(updatedServices);
        toast({
          title: "Success",
          description: "Service updated successfully"
        });
        setSelectedService(null);
        setIsAddServiceOpen(false);
      } catch (error) {
        console.error("Failed to update service:", error);
        toast({
          title: "Error",
          description: "Failed to update service. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id);
      setServiceList(serviceList.filter((service) => service.id !== id));
      toast({
        title: "Success",
        description: "Service deleted successfully"
      });
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (selectedService) {
      handleUpdateService(data);
    } else {
      handleAddService(data);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="section-heading">Service Management</h1>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-9 w-[250px]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button 
              className="bg-salon-600 hover:bg-salon-700" 
              onClick={() => {
                setSelectedService(null);
                form.reset({
                  name: "",
                  description: "",
                  duration: 30,
                  price: 0,
                });
                setIsAddServiceOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Service
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>All Services</CardTitle>
            <CardDescription>
              Manage your salon services, pricing, and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Loading services...</TableCell>
                  </TableRow>
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {service.duration} mins
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {service.price.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {service.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Open menu</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditService(service)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteService(service.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No services found. Add a new service to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription>
              {selectedService
                ? "Update the service information below"
                : "Fill in the details to add a new service"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Women's Haircut" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step={0.01} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the service..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddServiceOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Service"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
