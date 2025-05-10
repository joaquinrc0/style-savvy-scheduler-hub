import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Scissors, LineChart, ChevronRight, Settings, LogOut } from "lucide-react";
import { services } from "@/data/mockData";

export default function Index() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Auth buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/settings')}
          className="bg-white/90 text-salon-000 hover:text-salon-700 hover:bg-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="bg-white/90 text-salon-000 hover:text-salon-700 hover:bg-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative h-[200px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-salon-900/80 to-salon-500/50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        ></div>
        <div className="relative h-full flex items-center salon-container">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-4">
              Barber Shop
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              A comprehensive salon management system with appointment scheduling, client management, and performance analytics
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 salon-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold font-playfair mb-4">
            Comprehensive Salon Management
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our system offers all the tools you need to manage your salon efficiently, from appointment scheduling to performance tracking.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Calendar className="h-10 w-10 text-salon-600" />}
            title="Appointment Scheduling"
            description="Intuitive calendar interface for booking, managing, and tracking appointments"
            linkTo="/appointments"
          />
          <FeatureCard 
            icon={<Users className="h-10 w-10 text-salon-600" />}
            title="Client Management"
            description="Store client information, preferences, and appointment history"
            linkTo="/clients"
          />
          <FeatureCard 
            icon={<Scissors className="h-10 w-10 text-salon-600" />}
            title="Service Management"
            description="Define and manage your service offerings, pricing, and durations"
            linkTo="/services"
          />
          <FeatureCard 
            icon={<LineChart className="h-10 w-10 text-salon-600" />}
            title="Performance Analytics"
            description="Track KPIs, revenue, appointment statistics, and client retention"
            linkTo="/dashboard"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-foreground text-white">
        <div className="salon-container">
          <div className="grid md:grid-cols-4 gap-20">
            <div>
              <h3 className="text-lg font-semibold mb-4">Barber Shop</h3>
              <p className="text-white/70">
                Professional salon management system for modern salons and spas.
              </p>
            </div>
            <div>
              <h3><Link to="/terms" className="text-lg font-semibold mb-4">Terms & Conditions</Link></h3>
            </div>
              <div>
              <h3><Link to="/privacy" className="text-lg font-semibold mb-4">Privacy Policy</Link></h3>
            </div>
            <div>
              <h3><Link to="/contact" className="text-lg font-semibold mb-4">Contact Us</Link></h3>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50">
            <p>&copy; {new Date().getFullYear()} Belle Salon Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, linkTo }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  linkTo: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-border/50 relative group overflow-hidden hover:border-salon-200 transition-all duration-300">
      <div className="absolute inset-0 bg-salon-50 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Link to={linkTo} className="inline-flex items-center text-salon-600 font-medium hover:text-salon-700">
          Learn more <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
