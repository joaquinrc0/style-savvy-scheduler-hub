
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Scissors, LineChart, ChevronRight } from "lucide-react";
import { services } from "@/data/mockData";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-salon-900/80 to-salon-500/50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        ></div>
        <div className="relative h-full flex items-center salon-container">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-4">
              Hair Salon
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              A comprehensive salon management system with appointment scheduling, client management, and performance analytics
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-salon-600 hover:bg-salon-700">
                <Link to="/appointments">Schedule Appointment</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
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

      {/* Services Section */}
      <section className="py-20 bg-salon-50">
        <div className="salon-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold font-playfair mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our range of professional salon services available for booking
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <Card key={service.id} className="service-card">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-full bg-salon-100 flex items-center justify-center mb-4">
                      <Scissors className="h-6 w-6 text-salon-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{service.duration} minutes</span>
                      <span className="font-medium text-foreground">${service.price.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild className="bg-salon-600 hover:bg-salon-700">
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-salon-600 text-white">
        <div className="salon-container text-center">
          <h2 className="text-3xl md:text-4xl font-semibold font-playfair mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Start managing your salon more efficiently today with our comprehensive salon management system
          </p>
          <Button asChild size="lg" variant="outline" className="bg-white text-salon-600 hover:bg-white/90">
            <Link to="/appointments">Schedule Your First Appointment</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-foreground text-white">
        <div className="salon-container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Belle Salon</h3>
              <p className="text-white/70">
                Professional salon management system for modern salons and spas.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-white/70 hover:text-white">Home</Link></li>
                <li><Link to="/appointments" className="text-white/70 hover:text-white">Appointments</Link></li>
                <li><Link to="/clients" className="text-white/70 hover:text-white">Clients</Link></li>
                <li><Link to="/services" className="text-white/70 hover:text-white">Services</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-white/70 hover:text-white">Dashboard</Link></li>
                <li><Link to="/appointments" className="text-white/70 hover:text-white">Calendar</Link></li>
                <li><Link to="/clients" className="text-white/70 hover:text-white">Client Management</Link></li>
                <li><Link to="/services" className="text-white/70 hover:text-white">Service Management</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <address className="not-italic text-white/70">
                123 Salon Street<br />
                Beauty City, BC 12345<br />
                info@bellesalon.com<br />
                (555) 123-4567
              </address>
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
