
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Train, Ticket, MapPin, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TrainStatusCard from "@/components/TrainStatusCard";
import { Card, CardContent } from "@/components/ui/card";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="container mx-auto space-y-10 pb-10 animate-enter">
      {/* Hero section */}
      <section className="relative bg-rail-primary text-white rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578467581753-f91757efdb78')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 py-16 px-6 md:px-10 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to TrackWise Rail</h1>
            <p className="text-xl mb-8 text-gray-200">
              Real-time train updates, easy booking, and comprehensive railway management
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/train-status">
                <Button size="lg" className="bg-rail-accent hover:bg-rail-accent/90">
                  <Train size={18} className="mr-2" />
                  Check Train Status
                </Button>
              </Link>
              <Link to="/book-ticket">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <Ticket size={18} className="mr-2" />
                  Book Tickets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Search section */}
      <section className="bg-white shadow-lg rounded-lg p-6 -mt-8 mx-4 lg:mx-auto max-w-4xl relative z-20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center border rounded-md px-3 py-2 bg-rail-light focus-within:ring-2 focus-within:ring-rail-accent focus-within:border-transparent">
              <MapPin size={18} className="text-gray-400 mr-2" />
              <Input 
                type="text" 
                placeholder="Enter train number, station or destination" 
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button className="bg-rail-primary hover:bg-rail-primary/90">
            <Search size={18} className="mr-2" />
            Search
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Badge label="Express Trains" />
          <Badge label="Today" />
          <Badge label="Popular Routes" />
          <Badge label="Weekend Specials" />
        </div>
      </section>
      
      {/* Featured trains section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Live Train Status</h2>
          <Link to="/train-status" className="text-rail-secondary hover:text-rail-accent flex items-center">
            View all
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TrainStatusCard
            trainNumber="EXP101"
            trainName="Ocean Express"
            origin="Central Station"
            destination="Harbor Terminal"
            departureTime="08:30"
            arrivalTime="12:45"
            status="ontime"
            platform="3"
            progress={75}
            nextStation="Riverside Junction"
          />
          
          <TrainStatusCard
            trainNumber="REG205"
            trainName="Valley Commuter"
            origin="Downtown"
            destination="Highland Park"
            departureTime="09:15"
            arrivalTime="10:30"
            status="delayed"
            delay={15}
            platform="1"
            progress={40}
            nextStation="College Station"
          />
          
          <TrainStatusCard
            trainNumber="SPD330"
            trainName="Capital Bullet"
            origin="Union Square"
            destination="Metropolitan City"
            departureTime="10:00"
            arrivalTime="11:20"
            status="boarding"
            platform="7"
            progress={0}
          />
        </div>
      </section>
      
      {/* Services section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Our Services</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<Clock className="h-8 w-8 text-rail-accent" />}
            title="Real-time Updates"
            description="Get up-to-the-minute information on train arrivals, departures, and delays."
          />
          
          <ServiceCard
            icon={<Ticket className="h-8 w-8 text-rail-accent" />}
            title="Online Booking"
            description="Book tickets online with seat selection and receive e-tickets instantly."
          />
          
          <ServiceCard
            icon={<MapPin className="h-8 w-8 text-rail-accent" />}
            title="Station Information"
            description="Comprehensive details about stations, amenities, and accessibility features."
          />
          
          <ServiceCard
            icon={<Train className="h-8 w-8 text-rail-accent" />}
            title="Train Tracking"
            description="Track your train's location in real-time with our interactive map."
          />
        </div>
      </section>
    </div>
  );
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard = ({ icon, title, description }: ServiceCardProps) => {
  return (
    <Card className="transition-all hover:shadow-md hover:border-rail-accent/30">
      <CardContent className="pt-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

interface BadgeProps {
  label: string;
}

const Badge = ({ label }: BadgeProps) => {
  return (
    <span className="inline-block bg-rail-light text-rail-primary rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:bg-rail-primary hover:text-white transition-colors">
      {label}
    </span>
  );
};

export default HomePage;
