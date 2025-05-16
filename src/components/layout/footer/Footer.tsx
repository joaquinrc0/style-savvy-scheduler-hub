import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full border-t bg-salon-50/80 backdrop-blur-sm pl-16 md:pl-64">
      <div className="salon-container py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="grid grid-cols-3 gap-x-16 md:gap-x-32">
            <Link 
              to="/terms" 
              className="text-sm text-salon-600 hover:text-salon-700"
            >
              Terms & Conditions
            </Link>
            <Link 
              to="/privacy" 
              className="text-sm text-salon-600 hover:text-salon-700"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/contact" 
              className="text-sm text-salon-600 hover:text-salon-700"
            >
              Contact Us
            </Link>
          </div>
          <div className="text-sm text-salon-600 mt-4 md:mt-0">
            Powered by <span className="font-medium">Style Savvy Solutions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}