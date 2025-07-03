
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Train, Bell, User } from "lucide-react";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-rail-primary text-white py-4 px-6 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <Train size={24} className="text-rail-accent" />
            <span className="text-xl font-bold">TrackWise</span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/train-status" className="hover:text-rail-accent transition-colors">
            Train Status
          </Link>
          <Link to="/stations" className="hover:text-rail-accent transition-colors">
            Stations
          </Link>
          <Link to="/book-ticket" className="hover:text-rail-accent transition-colors">
            Book Ticket
          </Link>
        </div>
        
        {/* User actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-rail-secondary/20">
            <Bell size={20} />
          </Button>
          <Link to="/login">
            <Button variant="outline" className="border-rail-accent text-rail-accent hover:bg-rail-accent hover:text-white">
              <User size={18} className="mr-2" />
              Login
            </Button>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-rail-primary border-t border-rail-secondary/30 animate-slide-in">
          <div className="container mx-auto py-4 px-6 flex flex-col space-y-4">
            <Link 
              to="/train-status" 
              className="py-2 hover:text-rail-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Train Status
            </Link>
            <Link 
              to="/stations" 
              className="py-2 hover:text-rail-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Stations
            </Link>
            <Link 
              to="/book-ticket" 
              className="py-2 hover:text-rail-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Ticket
            </Link>
            <Link 
              to="/login" 
              className="py-2 hover:text-rail-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
