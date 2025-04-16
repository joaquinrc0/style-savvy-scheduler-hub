
import { cn } from "@/lib/utils";
import SidebarNav from "./SidebarNav";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      <main className="flex-1 ml-16 md:ml-64 p-6">
        <div className={cn("salon-container font-poppins", className)}>
          {children}
        </div>
      </main>
    </div>
  );
}
