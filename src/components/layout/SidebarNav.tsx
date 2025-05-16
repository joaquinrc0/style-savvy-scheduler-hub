import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Home, 
  LineChart, 
  Users, 
  Scissors, 
  Settings, 
  Menu,
  X,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItemProps = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isCollapsed: boolean;
};

const NavItem = ({ to, icon: Icon, label, isCollapsed }: NavItemProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "")} />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

export const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Services', href: '/services', icon: Scissors },
];

export default function SidebarNav() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/appointments", icon: Calendar, label: "Appointments" },
    { to: "/clients", icon: Users, label: "Clients" },
    { to: "/services", icon: Scissors, label: "Services" },
    { to: "/dashboard", icon: LineChart, label: "Dashboard" },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-sidebar transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="h-6 w-6 text-salon-600" />
            <span className="text-xl font-semibold font-playfair">Belle Salon</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={isCollapsed ? "mx-auto" : ""}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>
      <div className="scrollbar-hide flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        {!isCollapsed && (
          <div className="text-xs text-sidebar-foreground/60">
            © {new Date().getFullYear()} Belle Salon
          </div>
        )}
      </div>
    </aside>
  );
}
