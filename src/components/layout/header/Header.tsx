import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react"; // Add Settings import
import { Button } from "@/components/ui/button";

export function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <header className="w-full border-b bg-salon-50/80 backdrop-blur-sm pl-16 md:pl-64">
      <div className="salon-container py-6">
        <div className="flex justify-between items-center">
          <div className="grid grid-cols-1 gap-x-16 md:gap-x-32">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-playfair font-semibold text-salon-800">
                Belle Salon
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/settings')}
              className="text-salon-600 hover:text-salon-700 hover:bg-salon-100"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-salon-600 hover:text-salon-700 hover:bg-salon-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}