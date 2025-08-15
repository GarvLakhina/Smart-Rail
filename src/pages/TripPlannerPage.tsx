
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Phone, Globe, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";

const TripPlannerPage = () => {
  const location = useLocation();
  const destination = location.state?.destination || "your destination";

  // Mock data - in a real app, this would come from an API based on the destination
  const hotels = [
    {
      name: "Grand Central Hotel",
      rating: 4.5,
      price: "₹8000/night",
      distance: "0.2 km from station",
      amenities: ["WiFi", "Restaurant", "Parking"],
      phone: "+91-11-12345678"
    },
    {
      name: "Station View Inn",
      rating: 4.2,
      price: "₹5000/night", 
      distance: "0.5 km from station",
      amenities: ["WiFi", "Breakfast", "24/7 Front Desk"],
      phone: "+91-11-87654321"
    },
    {
      name: "Transit Lodge",
      rating: 3.8,
      price: "₹3500/night",
      distance: "0.8 km from station", 
      amenities: ["WiFi", "Parking"],
      phone: "+91-11-11223344"
    }
  ];

  const attractions = [
    {
      name: "Historic City Center",
      type: "Historical Site",
      rating: 4.6,
      distance: "1.2 km from station",
      description: "Beautiful historic architecture and cultural sites",
      openHours: "9:00 AM - 6:00 PM"
    },
    {
      name: "Central Park & Gardens",
      type: "Nature & Parks",
      rating: 4.4,
      distance: "0.8 km from station",
      description: "Peaceful gardens perfect for relaxation",
      openHours: "6:00 AM - 8:00 PM"
    },
    {
      name: "Local Art Museum",
      type: "Museum",
      rating: 4.3,
      distance: "1.5 km from station",
      description: "Contemporary and traditional art collections",
      openHours: "10:00 AM - 5:00 PM"
    },
    {
      name: "Riverside Market",
      type: "Shopping",
      rating: 4.1,
      distance: "2.0 km from station",
      description: "Local crafts, food, and souvenirs",
      openHours: "8:00 AM - 6:00 PM"
    }
  ];

  return (
    <div className="container mx-auto space-y-8 pb-10 animate-enter">
      <header>
        <h1 className="text-3xl font-bold">Trip Planner</h1>
        <p className="text-muted-foreground">Discover hotels and attractions near {destination}</p>
      </header>

      {/* Hotels Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-rail-primary" />
            Recommended Hotels
          </CardTitle>
          <CardDescription>Stay close to the station for convenient travel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {hotels.map((hotel, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{hotel.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">{hotel.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{hotel.distance}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-rail-primary">{hotel.price}</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {hotel.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="bg-rail-primary hover:bg-rail-primary/90">
                    <Globe className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-1" />
                    {hotel.phone}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attractions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-rail-accent" />
            Tourist Attractions
          </CardTitle>
          <CardDescription>Explore popular destinations and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {attractions.map((attraction, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{attraction.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {attraction.type}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium ml-1">{attraction.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{attraction.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {attraction.distance}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {attraction.openHours}
                  </div>
                </div>
                
                <Button size="sm" variant="outline">
                  Get Directions
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripPlannerPage;
