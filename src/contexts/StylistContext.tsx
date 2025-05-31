import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import stylistsApi, { Stylist } from "@/services/stylistsApi";
import { useToast } from "@/hooks/use-toast";

type StylistContextType = {
  stylists: Stylist[];
  isLoading: boolean;
  error: string | null;
  addStylist: (data: Omit<Stylist, 'id'>) => Promise<void>;
  updateStylist: (id: string, data: Partial<Stylist>) => Promise<void>;
  deleteStylist: (id: string) => Promise<void>;
  getStylistById: (id: string) => Stylist | undefined;
  refetchStylists: () => Promise<void>;
};

const StylistContext = createContext<StylistContextType | undefined>(undefined);

export const useStylists = () => {
  const context = useContext(StylistContext);
  if (!context) {
    throw new Error("useStylists must be used within a StylistProvider");
  }
  return context;
};

export const StylistProvider = ({ children }: { children: ReactNode }) => {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadStylists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedStylists = await stylistsApi.getStylists();
      setStylists(fetchedStylists);
    } catch (err: any) {
      console.error("Failed to fetch stylists:", err);
      setError(err.message || "Failed to load stylists.");
      toast({
        title: "Error Loading Stylists",
        description: err.message || "Could not fetch stylists from the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStylists();
  }, []);

  const addStylist = async (data: Omit<Stylist, 'id'>) => {
    try {
      const newStylist = await stylistsApi.createStylist(data);
      setStylists(prev => [...prev, newStylist]);
      toast({
        title: "Stylist Created",
        description: `Successfully created stylist: ${newStylist.name}`,
      });
    } catch (err: any) {
      console.error("Failed to create stylist:", err);
      setError(err.message || "Failed to create stylist.");
      toast({
        title: "Error Creating Stylist",
        description: err.message || "Could not create the stylist.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateStylist = async (id: string, data: Partial<Stylist>) => {
    try {
      const updatedStylistData = await stylistsApi.updateStylist(id, data);
      setStylists(prev => 
        prev.map(stylist => stylist.id === id ? updatedStylistData : stylist)
      );
      toast({
        title: "Stylist Updated",
        description: `Successfully updated stylist: ${updatedStylistData.name}`,
      });
    } catch (err: any) {
      console.error("Failed to update stylist:", err);
      setError(err.message || "Failed to update stylist.");
      toast({
        title: "Error Updating Stylist",
        description: err.message || "Could not update the stylist.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteStylist = async (id: string) => {
    try {
      await stylistsApi.deleteStylist(id);
      setStylists(prev => prev.filter(stylist => stylist.id !== id));
      toast({
        title: "Stylist Deleted",
        description: "Successfully deleted the stylist.",
      });
    } catch (err: any) {
      console.error("Failed to delete stylist:", err);
      setError(err.message || "Failed to delete stylist.");
      toast({
        title: "Error Deleting Stylist",
        description: err.message || "Could not delete the stylist.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getStylistById = (id: string) => {
    return stylists.find(stylist => stylist.id === id);
  };

  const value = {
    stylists,
    isLoading,
    error,
    addStylist,
    updateStylist,
    deleteStylist,
    getStylistById,
    refetchStylists: loadStylists,
  };

  return (
    <StylistContext.Provider value={value}>
      {children}
    </StylistContext.Provider>
  );
};
