
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Ticket, Clock, Calendar, Train } from "lucide-react";
import BookedTickets from "@/components/BookedTickets";
import LiveTrainStatus from "@/components/LiveTrainStatus";

const UserPortal = () => {
  return (
    <div className="container mx-auto space-y-8 pb-10 animate-enter">
      <header>
        <h1 className="text-3xl font-bold">User Portal</h1>
        <p className="text-muted-foreground">Manage your bookings and account information</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-rail-light rounded-full flex items-center justify-center mb-4">
                <User size={40} className="text-rail-primary" />
              </div>
              <CardTitle>John Traveler</CardTitle>
              <CardDescription>john.t@example.com</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <nav className="space-y-2">
              <NavItem label="Profile Settings" icon={<User size={16} />} active />
              <NavItem label="My Tickets" icon={<Ticket size={16} />} />
              <NavItem label="Travel History" icon={<Clock size={16} />} />
              <NavItem label="Upcoming Journeys" icon={<Calendar size={16} />} />
            </nav>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Tabs defaultValue="booked">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="booked">Booked Tickets</TabsTrigger>
              <TabsTrigger value="live">Live Train Status</TabsTrigger>
            </TabsList>
            
            <TabsContent value="booked" className="mt-6">
              <BookedTickets />
            </TabsContent>
            
            <TabsContent value="live" className="mt-6">
              <LiveTrainStatus />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const NavItem = ({ label, icon, active }: NavItemProps) => {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
      active 
        ? "bg-rail-accent/10 text-rail-accent" 
        : "hover:bg-rail-light text-muted-foreground"
    }`}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default UserPortal;
