import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Train, Menu, User, LogOut, Settings, UserCircle, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login" || location.pathname === "/register";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };
  
  return (
    <nav className="bg-slate-900 border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="md:hidden text-white hover:bg-slate-800"
            >
              <Menu size={20} />
            </Button>
            
            {!isLoginPage && (
              <Link to="/" className="flex items-center space-x-2">
                <Train size={32} className="text-rail-accent" />
                <span className="text-xl font-bold text-white hidden sm:block">TrackWise</span>
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {user && !isLoginPage && (
              <>
                <Link to="/train-status" className="text-slate-300 hover:text-white transition-colors">
                  Train Status
                </Link>
                <Link to="/stations" className="text-slate-300 hover:text-white transition-colors">
                  Stations
                </Link>
                {user && !isAdmin && (
                  <Link to="/book-ticket" className="text-slate-300 hover:text-white transition-colors">
                    Book Ticket
                  </Link>
                )}
                <Link to="/help" className="text-slate-300 hover:text-white transition-colors">
                  Help
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                    <User size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-600">
                  <DropdownMenuItem 
                    onClick={() => navigate(isAdmin ? '/admin' : '/passenger')}
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    {isAdmin ? <Shield size={16} className="mr-2" /> : <UserCircle size={16} className="mr-2" />}
                    {isAdmin ? 'Admin Control Center' : 'Passenger Portal'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-slate-300 border-slate-600 hover:bg-slate-800 hover:text-white"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-slate-800">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-slate-800 border-slate-600">
                <div className="flex flex-col space-y-4 pt-4">
                  {user && !isLoginPage && (
                    <>
                      <Link
                        to="/train-status"
                        className="text-left p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
                        onClick={() => setIsOpen(false)}
                      >
                        Train Status
                      </Link>
                      <Link
                        to="/stations"
                        className="text-left p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
                        onClick={() => setIsOpen(false)}
                      >
                        Stations
                      </Link>
                      {user && !isAdmin && (
                        <Link
                          to="/book-ticket"
                          className="text-left p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
                          onClick={() => setIsOpen(false)}
                        >
                          Book Ticket
                        </Link>
                      )}
                      <Link
                        to="/help"
                        className="text-left p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
                        onClick={() => setIsOpen(false)}
                      >
                        Help
                      </Link>
                    </>
                  )}
                  {user && (
                    <Link 
                      to={isAdmin ? '/admin' : '/passenger'} 
                      className="text-left p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
                      onClick={() => setIsOpen(false)}
                    >
                      {isAdmin ? 'Admin Control Center' : 'Passenger Portal'}
                    </Link>
                  )}
                  {!user && (
                    <>
                      <Link 
                        to="/login" 
                        className="text-left p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        to="/register" 
                        className="text-left p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
