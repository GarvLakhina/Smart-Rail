import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Train, MapPin, Clock, AlertTriangle, CheckCircle, Search } from "lucide-react";

interface TrainStatusData {
  trainNumber: string;
  trainName: string;
  currentStation: string;
  nextStation: string;
  estimatedArrival: string;
  estimatedDeparture: string;
  delay: number;
  status: "On Time" | "Delayed" | "Cancelled" | "Departed";
  platformNumber: string;
  coaches: number;
  route: string[];
  currentStationIndex: number;
}

const LiveTrainStatus = () => {
  const [searchTrain, setSearchTrain] = useState("");
  const [selectedTrain, setSelectedTrain] = useState<TrainStatusData | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data - in real app, this would come from live API
  const mockTrainData: TrainStatusData = {
    trainNumber: "EXP101",
    trainName: "Ocean Express",
    currentStation: "Junction City",
    nextStation: "Metro Central",
    estimatedArrival: "14:30",
    estimatedDeparture: "14:35",
    delay: 15,
    status: "Delayed",
    platformNumber: "3",
    coaches: 18,
    route: ["Central Station", "North Junction", "Junction City", "Metro Central", "South Terminal"],
    currentStationIndex: 2
  };

  const handleSearch = async () => {
    if (!searchTrain.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSelectedTrain(mockTrainData);
    setIsSearching(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Time":
        return "bg-green-100 text-green-800";
      case "Delayed":
        return "bg-red-100 text-red-800";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      case "Departed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDelayColor = (delay: number) => {
    if (delay === 0) return "text-green-600";
    if (delay <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Live Train Status</h2>
        <p className="text-muted-foreground">Get real-time updates on train schedules and delays</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Track Your Train</CardTitle>
          <CardDescription>Enter train number or name to get live status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="trainSearch">Train Number / Name</Label>
              <Input
                id="trainSearch"
                placeholder="e.g., EXP101 or Ocean Express"
                value={searchTrain}
                onChange={(e) => setSearchTrain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isSearching} className="bg-rail-primary hover:bg-rail-primary/90">
                <Search size={16} className="mr-2" />
                {isSearching ? "Searching..." : "Track"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Train Status Display */}
      {selectedTrain && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Train size={24} className="text-rail-primary" />
                  {selectedTrain.trainNumber} - {selectedTrain.trainName}
                </CardTitle>
                <CardDescription>Platform {selectedTrain.platformNumber} • {selectedTrain.coaches} Coaches</CardDescription>
              </div>
              <Badge className={getStatusColor(selectedTrain.status)}>
                {selectedTrain.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-rail-secondary" />
                    Current Location
                  </h4>
                  <p className="text-lg font-medium">{selectedTrain.currentStation}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Departure: {selectedTrain.estimatedDeparture}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Next Station</h4>
                  <p className="text-lg font-medium">{selectedTrain.nextStation}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      ETA: {selectedTrain.estimatedArrival}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    {selectedTrain.delay === 0 ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-red-600" />
                    )}
                    Delay Status
                  </h4>
                  <p className={`text-lg font-medium ${getDelayColor(selectedTrain.delay)}`}>
                    {selectedTrain.delay === 0 ? "On Time" : `${selectedTrain.delay} minutes delayed`}
                  </p>
                </div>

                {selectedTrain.delay > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-600" />
                      <span className="text-sm font-medium text-red-800">Delay Notice</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      Train is running {selectedTrain.delay} minutes behind schedule due to operational reasons.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Route Progress */}
            <div>
              <h4 className="font-semibold mb-4">Route Progress</h4>
              <div className="space-y-2">
                {selectedTrain.route.map((station, index) => (
                  <div key={station} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index < selectedTrain.currentStationIndex 
                        ? "bg-green-500" 
                        : index === selectedTrain.currentStationIndex 
                        ? "bg-blue-500" 
                        : "bg-gray-300"
                    }`} />
                    <span className={`${
                      index === selectedTrain.currentStationIndex 
                        ? "font-semibold text-rail-primary" 
                        : index < selectedTrain.currentStationIndex
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}>
                      {station}
                      {index === selectedTrain.currentStationIndex && " (Current)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button size="sm" variant="outline">
                Set Alerts
              </Button>
              <Button size="sm" variant="outline">
                Share Status
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedTrain && (
        <Card>
          <CardContent className="text-center py-12">
            <Train className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Enter a train number to view live status</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveTrainStatus;