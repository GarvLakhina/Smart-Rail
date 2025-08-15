
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  AlertTriangle, 
  Train, 
  Users, 
  BarChart3, 
  Lightbulb, 
  Zap,
  CheckCircle,
  Clock,
  TrendingUp,
  Power
} from "lucide-react";

const AdminHomePage = () => {
  const [lightControls, setLightControls] = useState({
    platform1: true,
    platform2: false,
    platform3: true,
    waitingArea: true,
    entrance: false
  });

  // Mock data for analytics
  const analytics = {
    ticketsBooked: 1247,
    trainsPassed: 23,
    trainsUpcoming: 8,
    onTimeTrains: 18,
    delayedTrains: 5
  };

  // Mock collision detection data
  const collisionWarnings = [
    {
      id: 1,
      trains: ["Express 101", "Local 245"],
      distance: "2.5 km",
      estimatedCollision: "45 seconds",
      severity: "HIGH"
    },
    {
      id: 2,
      trains: ["Bullet 330", "Metro 67"],
      distance: "5.8 km",
      estimatedCollision: "2 minutes",
      severity: "MEDIUM"
    }
  ];

  const toggleLight = (zone: string) => {
    setLightControls(prev => ({
      ...prev,
      [zone]: !prev[zone]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Control Center</h1>
          <p className="text-slate-300 text-lg">Comprehensive railway management and monitoring system</p>
        </header>

        {/* Collision Detection Section */}
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Collision Detection System
            </CardTitle>
            <CardDescription className="text-slate-400">
              Live train tracking and collision prevention monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Map Area */}
              <div className="bg-slate-100 rounded-lg h-80 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                  {/* Simulated Railway Lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    <line x1="10%" y1="50%" x2="90%" y2="20%" stroke="#4B5563" strokeWidth="3" strokeDasharray="5,5" />
                    <line x1="20%" y1="80%" x2="80%" y2="30%" stroke="#4B5563" strokeWidth="3" strokeDasharray="5,5" />
                    <line x1="30%" y1="10%" x2="70%" y2="90%" stroke="#4B5563" strokeWidth="3" strokeDasharray="5,5" />
                  </svg>
                  
                  {/* Train Positions */}
                  <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <Train className="h-2 w-2 text-white" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Train className="h-2 w-2 text-white" />
                  </div>
                  <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Train className="h-2 w-2 text-white" />
                  </div>
                  
                  {/* Warning Zone */}
                  <div className="absolute top-1/2 left-1/3 w-20 h-20 border-4 border-red-500 border-dashed rounded-full bg-red-100 bg-opacity-50 animate-pulse flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Live Railway Map
                </div>
              </div>

              {/* Warning Alerts */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Active Collision Warnings</h3>
                {collisionWarnings.map((warning) => (
                  <div key={warning.id} className={`p-4 rounded-lg border-l-4 ${
                    warning.severity === 'HIGH' ? 'bg-red-900/30 border-red-500' : 'bg-yellow-900/30 border-yellow-500'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">
                          {warning.trains.join(' & ')}
                        </p>
                        <p className="text-slate-300 text-sm">Distance: {warning.distance}</p>
                      </div>
                      <Badge className={warning.severity === 'HIGH' ? 'bg-red-600' : 'bg-yellow-600'}>
                        {warning.severity}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      Estimated collision time: {warning.estimatedCollision}
                    </p>
                    <Button size="sm" variant="destructive" className="w-full">
                      Send Emergency Stop Signal
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crowd Density & Energy Control Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Crowd Density */}
          <Card className="bg-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-6 w-6 text-orange-500" />
                Real-time Crowd Density
              </CardTitle>
              <CardDescription className="text-slate-400">
                Heat map visualization of station occupancy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Heat Map */}
              <div className="bg-slate-100 rounded-lg h-64 relative overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100">
                  {/* Station Layout */}
                  <svg className="absolute inset-0 w-full h-full">
                    <rect x="10%" y="15%" width="80%" height="25%" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3,3" />
                    <rect x="10%" y="45%" width="80%" height="25%" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3,3" />
                    <rect x="10%" y="75%" width="80%" height="15%" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3,3" />
                  </svg>
                  
                  {/* Heat Map Zones */}
                  <div className="absolute top-[15%] left-[10%] w-[35%] h-[25%] bg-red-500 bg-opacity-60 rounded" title="Platform 1 - High Density"></div>
                  <div className="absolute top-[15%] right-[10%] w-[35%] h-[25%] bg-green-400 bg-opacity-40 rounded" title="Platform 2 - Low Density"></div>
                  <div className="absolute top-[45%] left-[20%] w-[60%] h-[25%] bg-yellow-500 bg-opacity-70 rounded" title="Waiting Area - Medium Density"></div>
                  <div className="absolute top-[75%] left-[30%] w-[40%] h-[15%] bg-blue-400 bg-opacity-50 rounded" title="Entrance - Low-Medium Density"></div>
                </div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Station Heat Map
                </div>
              </div>

              {/* Density Legend */}
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <span>Normal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Energy Control */}
          <Card className="bg-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-500" />
                Energy Control System
              </CardTitle>
              <CardDescription className="text-slate-400">
                Automated and manual lighting control based on crowd density
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(lightControls).map(([zone, isOn]) => (
                  <div key={zone} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lightbulb className={`h-5 w-5 ${isOn ? 'text-yellow-400' : 'text-gray-500'}`} />
                      <div>
                        <p className="text-white font-medium capitalize">
                          {zone.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-xs text-slate-400">
                          {isOn ? 'Currently ON' : 'Currently OFF'}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={isOn}
                      onCheckedChange={() => toggleLight(zone)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-green-900/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <Power className="h-4 w-4" />
                  <span className="text-sm font-medium">Energy Efficiency</span>
                </div>
                <p className="text-xs text-green-300">
                  23% energy saved today by automatic crowd-based lighting
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              Analytics Dashboard
            </CardTitle>
            <CardDescription className="text-slate-400">
              Real-time statistics and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                <div className="text-2xl font-bold text-blue-400">{analytics.ticketsBooked}</div>
                <div className="text-sm text-blue-300">Tickets Booked</div>
                <div className="text-xs text-slate-400 mt-1">Today</div>
              </div>
              
              <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-700">
                <div className="text-2xl font-bold text-green-400">{analytics.trainsPassed}</div>
                <div className="text-sm text-green-300">Trains Passed</div>
                <div className="text-xs text-slate-400 mt-1">Today</div>
              </div>
              
              <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-700">
                <div className="text-2xl font-bold text-purple-400">{analytics.trainsUpcoming}</div>
                <div className="text-sm text-purple-300">Upcoming Trains</div>
                <div className="text-xs text-slate-400 mt-1">Next 4 hours</div>
              </div>
              
              <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-700">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div className="text-2xl font-bold text-green-400">{analytics.onTimeTrains}</div>
                </div>
                <div className="text-sm text-green-300">On Time</div>
                <div className="text-xs text-slate-400 mt-1">Trains</div>
              </div>
              
              <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-700">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-5 w-5 text-red-400" />
                  <div className="text-2xl font-bold text-red-400">{analytics.delayedTrains}</div>
                </div>
                <div className="text-sm text-red-300">Delayed</div>
                <div className="text-xs text-slate-400 mt-1">Trains</div>
              </div>
            </div>
            
            {/* Performance Summary */}
            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  On-Time Performance
                </h4>
                <span className="text-green-400 font-bold">78%</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-slate-400 mt-2">
                18 out of 23 trains arrived on schedule today
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHomePage;
