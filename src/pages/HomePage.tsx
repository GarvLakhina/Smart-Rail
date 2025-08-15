
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Train, 
  Ticket, 
  Clock, 
  MapPin, 
  Star, 
  MessageCircle,
  Calendar,
  AlertCircle,
  TrendingUp,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BookedTickets from "@/components/BookedTickets";
import LiveTrainStatus from "@/components/LiveTrainStatus";

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto space-y-8 pb-10 animate-enter">
      {/* Welcome Header */}
      <header className="text-center py-8 bg-gradient-to-r from-rail-primary to-rail-accent text-white rounded-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to TrackWise Rail</h1>
        <p className="text-lg opacity-90">Your journey starts here</p>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/book-ticket")}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-rail-light rounded-full flex items-center justify-center mb-2">
              <Ticket className="h-6 w-6 text-rail-primary" />
            </div>
            <CardTitle className="text-lg">Book Tickets</CardTitle>
            <CardDescription>Reserve your seats for upcoming journeys</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/train-status")}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-rail-light rounded-full flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-rail-primary" />
            </div>
            <CardTitle className="text-lg">Train Status</CardTitle>
            <CardDescription>Check real-time train locations and delays</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/trip-planner")}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-rail-light rounded-full flex items-center justify-center mb-2">
              <MapPin className="h-6 w-6 text-rail-primary" />
            </div>
            <CardTitle className="text-lg">Trip Planner</CardTitle>
            <CardDescription>Discover places and hotels at your destination</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/user")}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-rail-light rounded-full flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-rail-primary" />
            </div>
            <CardTitle className="text-lg">My Profile</CardTitle>
            <CardDescription>Manage your account and preferences</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Ticket className="h-6 w-6 text-rail-primary" />
            Your Recent Bookings
          </h2>
          <BookedTickets />
        </div>

        {/* Live Train Status */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Train className="h-6 w-6 text-rail-primary" />
            Live Train Updates
          </h2>
          <LiveTrainStatus />
        </div>
      </div>

      {/* Features & Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-rail-accent" />
            Premium Features
          </CardTitle>
          <CardDescription>Enhance your travel experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-rail-accent" />
              <h3 className="font-semibold mb-1">AI ChatBot</h3>
              <p className="text-sm text-muted-foreground">Book tickets with voice commands</p>
              <Badge variant="secondary" className="mt-2">Available</Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-semibold mb-1">Priority Booking</h3>
              <p className="text-sm text-muted-foreground">Skip queues with priority tickets</p>
              <Badge variant="secondary" className="mt-2">Premium</Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold mb-1">Trip Planning</h3>
              <p className="text-sm text-muted-foreground">Discover hotels and attractions</p>
              <Badge variant="secondary" className="mt-2">Free</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">98.5%</p>
                <p className="text-sm text-muted-foreground">On-time Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.4M</p>
                <p className="text-sm text-muted-foreground">Daily Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <Train className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">450+</p>
                <p className="text-sm text-muted-foreground">Active Trains</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
