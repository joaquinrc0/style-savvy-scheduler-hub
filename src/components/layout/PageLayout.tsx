import { cn } from "@/lib/utils";
import { Header } from "./header/Header";
import { Footer } from "./footer/Footer";
import SidebarNav from "./SidebarNav";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 ml-16 md:ml-64">
          <div className={cn("salon-container font-poppins", className)}>
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
