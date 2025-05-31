import { useState } from "react";
import { useStylists } from "@/contexts/StylistContext";
import { Stylist } from "@/services/stylistsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StylistList() {
  const { stylists, addStylist, updateStylist, deleteStylist, isLoading, error } = useStylists();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStylist, setCurrentStylist] = useState<Stylist | null>(null);
  const [newStylist, setNewStylist] = useState<{name: string, specialties: string[]}>({
    name: "",
    specialties: []
  });
  const [specialtyInput, setSpecialtyInput] = useState("");

  const handleAddStylist = async () => {
    if (newStylist.name.trim() && newStylist.specialties.length > 0) {
      await addStylist({
        name: newStylist.name,
        specialties: newStylist.specialties,
      });
      setNewStylist({ name: "", specialties: [] });
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdateStylist = async () => {
    if (currentStylist && currentStylist.name.trim() && currentStylist.specialties.length > 0) {
      await updateStylist(currentStylist.id, {
        name: currentStylist.name,
        specialties: currentStylist.specialties,
      });
      setCurrentStylist(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteStylist = async () => {
    if (currentStylist) {
      await deleteStylist(currentStylist.id);
      setCurrentStylist(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const addSpecialty = (list: string[], setList: (list: string[]) => void) => {
    if (specialtyInput.trim() && !list.includes(specialtyInput.trim())) {
      setList([...list, specialtyInput.trim()]);
      setSpecialtyInput("");
    }
  };

  const removeSpecialty = (specialty: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter(s => s !== specialty));
  };

  if (isLoading) return <div className="p-4">Loading stylists...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Stylists</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Stylist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Stylist</DialogTitle>
              <DialogDescription>
                Enter the name and specialties of the new stylist.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newStylist.name}
                  onChange={(e) => setNewStylist({...newStylist, name: e.target.value})}
                  placeholder="Enter stylist name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Specialties</Label>
                <div className="flex gap-2">
                  <Input
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    placeholder="Add a specialty"
                  />
                  <Button 
                    type="button" 
                    onClick={() => addSpecialty(newStylist.specialties, (list) => setNewStylist({...newStylist, specialties: list}))}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newStylist.specialties.map((specialty, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {specialty}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSpecialty(specialty, newStylist.specialties, (list) => setNewStylist({...newStylist, specialties: list}))} 
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddStylist}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stylists.map((stylist) => (
          <Card key={stylist.id}>
            <CardHeader>
              <CardTitle>{stylist.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stylist.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Dialog open={isEditDialogOpen && currentStylist?.id === stylist.id} onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) setCurrentStylist(null);
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCurrentStylist(stylist);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Stylist</DialogTitle>
                    <DialogDescription>
                      Update the stylist's information.
                    </DialogDescription>
                  </DialogHeader>
                  {currentStylist && (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                          id="edit-name"
                          value={currentStylist.name}
                          onChange={(e) => setCurrentStylist({...currentStylist, name: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Specialties</Label>
                        <div className="flex gap-2">
                          <Input
                            value={specialtyInput}
                            onChange={(e) => setSpecialtyInput(e.target.value)}
                            placeholder="Add a specialty"
                          />
                          <Button 
                            type="button" 
                            onClick={() => addSpecialty(currentStylist.specialties, (list) => setCurrentStylist({...currentStylist, specialties: list}))}
                            size="sm"
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentStylist.specialties.map((specialty, index) => (
                            <Badge key={index} className="flex items-center gap-1">
                              {specialty}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeSpecialty(specialty, currentStylist.specialties, (list) => setCurrentStylist({...currentStylist, specialties: list}))} 
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateStylist}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isDeleteDialogOpen && currentStylist?.id === stylist.id} onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) setCurrentStylist(null);
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setCurrentStylist(stylist);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Stylist</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {stylist.name}? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteStylist}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
