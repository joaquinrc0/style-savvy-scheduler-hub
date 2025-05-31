import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StylistProvider } from "@/contexts/StylistContext";
import { StylistList } from "@/components/stylists/StylistList";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function Stylists() {
  const navigate = useNavigate();
  
  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stylists</h1>
          <p className="text-muted-foreground">
            Manage your salon's stylists and their specialties
          </p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <StylistProvider>
              <StylistList />
            </StylistProvider>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
