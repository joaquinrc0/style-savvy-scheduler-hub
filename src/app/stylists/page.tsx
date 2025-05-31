"use client";

import { StylistList } from "@/components/stylists/StylistList";
import { StylistProvider } from "@/contexts/StylistContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LayoutShell } from "@/components/layout/LayoutShell";

export default function StylistsPage() {
  return (
    <AuthGuard>
      <StylistProvider>
        <LayoutShell
          title="Stylists Management"
          subtitle="View, add, edit and delete stylists"
        >
          <StylistList />
        </LayoutShell>
      </StylistProvider>
    </AuthGuard>
  );
}
