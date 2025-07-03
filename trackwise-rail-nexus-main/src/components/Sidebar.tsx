
import { Link } from "react-router-dom";
import { 
  Home, 
  Gauge, 
  Train, 
  Map, 
  Ticket, 
  User, 
  HelpCircle, 
  Bell, 
  Info 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside 
      className={`bg-rail-primary text-white transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0 md:w-16'
      } overflow-hidden`}
    >
      <div className="h-full flex flex-col py-6">
        <div className="px-4 mb-6">
          {isOpen && <h2 className="text-xl font-bold mb-4">TrackWise</h2>}
        </div>
        
        <nav className="flex-1">
          <div className="px-2 space-y-1">
            <SidebarLink to="/" icon={Home} label="Home" isOpen={isOpen} />
            <SidebarLink to="/admin" icon={Gauge} label="Admin Dashboard" isOpen={isOpen} />
            <SidebarLink to="/train-status" icon={Train} label="Train Status" isOpen={isOpen} />
            <SidebarLink to="/stations" icon={Map} label="Stations" isOpen={isOpen} />
            <SidebarLink to="/book-ticket" icon={Ticket} label="Book Ticket" isOpen={isOpen} />
          </div>
          
          <div className="mt-8 px-4">
            {isOpen && <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">User</h3>}
            <div className="px-2 space-y-1">
              <SidebarLink to="/user" icon={User} label="My Profile" isOpen={isOpen} />
              <SidebarLink to="/help" icon={HelpCircle} label="Help & Support" isOpen={isOpen} />
              <SidebarLink to="/announcements" icon={Bell} label="Announcements" isOpen={isOpen} />
              <SidebarLink to="/about" icon={Info} label="About" isOpen={isOpen} />
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isOpen: boolean;
}

const SidebarLink = ({ to, icon: Icon, label, isOpen }: SidebarLinkProps) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center p-2 rounded-md hover:bg-rail-secondary/30 transition-colors ${
        isOpen ? 'justify-start' : 'justify-center'
      }`}
    >
      <Icon size={isOpen ? 18 : 20} />
      {isOpen && <span className="ml-3">{label}</span>}
    </Link>
  );
};

export default Sidebar;
