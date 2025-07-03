
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Train, Coffee, Accessibility, Info, Wifi } from "lucide-react";

const StationInfo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample stations data
  const stations = [
    {
      id: "1",
      name: "Central Station",
      location: "Downtown District",
      platforms: 12,
      amenities: ["Restaurants", "Shops", "Restrooms", "WiFi", "Waiting Area", "Accessibility"],
      connections: ["Bus", "Subway", "Taxi"]
    },
    {
      id: "2",
      name: "Harbor Terminal",
      location: "Waterfront Area",
      platforms: 8,
      amenities: ["Cafes", "Shops", "Restrooms", "WiFi", "Luggage Storage"],
      connections: ["Ferry", "Bus", "Taxi"]
    },
    {
      id: "3",
      name: "Riverside Junction",
      location: "River District",
      platforms: 6,
      amenities: ["Cafes", "Restrooms", "WiFi", "Waiting Area"],
      connections: ["Bus", "Taxi"]
    }
  ];
  
  return (
    <div className="container mx-auto space-y-8 pb-10 animate-enter">
      <header>
        <h1 className="text-3xl font-bold">Station Information</h1>
        <p className="text-muted-foreground">Find details about our stations, amenities, and facilities</p>
      </header>
      
      <div className="bg-rail-light p-6 rounded-lg">
        <div className="relative max-w-lg mx-auto">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search for a station"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button className="absolute right-0 top-0 rounded-l-none bg-rail-primary hover:bg-rail-primary/90">
            <Search size={18} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((station) => (
          <StationCard key={station.id} station={station} />
        ))}
      </div>
    </div>
  );
};

interface StationCardProps {
  station: {
    id: string;
    name: string;
    location: string;
    platforms: number;
    amenities: string[];
    connections: string[];
  };
}

const StationCard = ({ station }: StationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin size={18} className="text-rail-accent" />
          {station.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{station.location}</p>
      </CardHeader>
      <CardContent className="pb-2">
        <Tabs defaultValue="info">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Train size={16} className="text-rail-secondary" />
                <span>{station.platforms} Platforms</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee size={16} className="text-rail-secondary" />
                <span>{station.amenities.length} Amenities Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Info size={16} className="text-rail-secondary" />
                <span>Open 24/7</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="amenities" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {station.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2">
                  {amenity === "WiFi" ? (
                    <Wifi size={16} className="text-rail-accent" />
                  ) : amenity === "Accessibility" ? (
                    <Accessibility size={16} className="text-rail-accent" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-rail-accent/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-rail-accent"></div>
                    </div>
                  )}
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="connections" className="mt-4">
            <div className="space-y-2">
              {station.connections.map((connection, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rail-primary"></div>
                  <span>{connection}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">View Station Details</Button>
      </CardFooter>
    </Card>
  );
};

export default StationInfo;
