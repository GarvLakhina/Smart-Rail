
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Train, MessageCircle, MapPin, Star, Ticket, Clock, User, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import TrainStatusCard from "@/components/TrainStatusCard";

const PassengerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="container mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Passenger Portal</h1>
          <p className="text-slate-300 text-lg">Your journey starts here</p>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/book-ticket">
            <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-colors cursor-pointer h-full">
              <CardHeader>
                <QrCode className="h-8 w-8 text-rail-accent mb-2" />
                <CardTitle className="text-white">Book Tickets</CardTitle>
                <CardDescription className="text-slate-400">Quick and easy ticket booking with QR codes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-rail-accent hover:bg-rail-accent/90">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/train-status">
            <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-colors cursor-pointer h-full">
              <CardHeader>
                <Train className="h-8 w-8 text-rail-accent mb-2" />
                <CardTitle className="text-white">Live Train Status</CardTitle>
                <CardDescription className="text-slate-400">Real-time updates on train schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full text-slate-300 border-slate-600">
                  Check Status
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/user">
            <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-colors cursor-pointer h-full">
              <CardHeader>
                <User className="h-8 w-8 text-rail-accent mb-2" />
                <CardTitle className="text-white">My Bookings</CardTitle>
                <CardDescription className="text-slate-400">View and manage your ticket bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full text-slate-300 border-slate-600">
                  View Bookings
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-colors cursor-pointer h-full">
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-rail-accent mb-2" />
              <CardTitle className="text-white">Chat Assistant</CardTitle>
              <CardDescription className="text-slate-400">Get help with voice or text chat</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full text-slate-300 border-slate-600">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search section */}
        <section className="bg-slate-800 shadow-lg rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center border rounded-md px-3 py-2 bg-slate-700 focus-within:ring-2 focus-within:ring-rail-accent focus-within:border-transparent">
                <MapPin size={18} className="text-gray-400 mr-2" />
                <Input 
                  type="text" 
                  placeholder="Enter train number, station or destination" 
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:outline-none text-white"
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
            <h2 className="text-2xl font-bold text-white">Live Train Status</h2>
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
          <h2 className="text-2xl font-bold mb-6 text-white">Our Services</h2>
          
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

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Priority Services
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upgrade your travel experience with priority booking and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-300 text-sm">Priority ticket confirmation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-300 text-sm">Dedicated customer support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-300 text-sm">Priority boarding access</span>
              </div>
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-6 w-6 text-green-500" />
                Trip Planner
              </CardTitle>
              <CardDescription className="text-slate-400">
                Discover hotels and attractions near your destination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-300 text-sm">Hotel recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-300 text-sm">Tourist attractions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-300 text-sm">Local points of interest</span>
              </div>
              <Button variant="outline" className="w-full text-slate-300 border-slate-600">
                Explore
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your latest bookings and travel updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5 text-rail-accent" />
                  <div>
                    <p className="text-white font-medium">Ticket Booked</p>
                    <p className="text-slate-400 text-sm">EXP101 - Central to Metro Junction</p>
                  </div>
                </div>
                <span className="text-slate-400 text-sm">2 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Train className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-white font-medium">Train Status Update</p>
                    <p className="text-slate-400 text-sm">SPD330 is running on time</p>
                  </div>
                </div>
                <span className="text-slate-400 text-sm">1 day ago</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-white font-medium">Chat Session</p>
                    <p className="text-slate-400 text-sm">Booking assistance completed</p>
                  </div>
                </div>
                <span className="text-slate-400 text-sm">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const ServiceCard = ({ icon, title, description }: ServiceCardProps) => {
  return (
    <Card className="transition-all hover:shadow-md hover:border-rail-accent/30 bg-slate-800 border-slate-600 text-white">
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

export const Badge = ({ label }: BadgeProps) => {
  return (
    <span className="inline-block bg-slate-700 text-slate-300 rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:bg-rail-primary hover:text-white transition-colors">
      {label}
    </span>
  );
};

export default PassengerDashboard;
