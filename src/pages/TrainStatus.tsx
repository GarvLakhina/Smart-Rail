
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, ArrowRight } from "lucide-react";
import TrainStatusCard from "@/components/TrainStatusCard";

const TrainStatus = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTrains, setFilteredTrains] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  
  // Sample train data for demonstration
  const trains = [
    {
      id: "1",
      trainNumber: "EXP101",
      trainName: "Ocean Express",
      origin: "Central Station",
      destination: "Harbor Terminal",
      departureTime: "08:30",
      arrivalTime: "12:45",
      status: "ontime" as const,
      platform: "3",
      progress: 75,
      nextStation: "Riverside Junction",
    },
    {
      id: "2",
      trainNumber: "REG205",
      trainName: "Valley Commuter",
      origin: "Downtown",
      destination: "Highland Park",
      departureTime: "09:15",
      arrivalTime: "10:30",
      status: "delayed" as const,
      delay: 15,
      platform: "1",
      progress: 40,
      nextStation: "College Station",
    },
    {
      id: "3",
      trainNumber: "SPD330",
      trainName: "Capital Bullet",
      origin: "Union Square",
      destination: "Metropolitan City",
      departureTime: "10:00",
      arrivalTime: "11:20",
      status: "boarding" as const,
      platform: "7",
      progress: 0,
    },
    {
      id: "4",
      trainNumber: "LCL118",
      trainName: "Suburban Local",
      origin: "Westside",
      destination: "Eastern Heights",
      departureTime: "11:20",
      arrivalTime: "13:15",
      status: "ontime" as const,
      platform: "5",
      progress: 25,
      nextStation: "Market Square",
    },
    {
      id: "5",
      trainNumber: "EXP432",
      trainName: "Northern Express",
      origin: "Southern Terminal",
      destination: "North Junction",
      departureTime: "12:05",
      arrivalTime: "16:30",
      status: "cancelled" as const,
      platform: "2",
      progress: 0,
    },
    {
      id: "6",
      trainNumber: "SPD550",
      trainName: "Coast Runner",
      origin: "Mountain View",
      destination: "Seaside Terminal",
      departureTime: "13:45",
      arrivalTime: "17:20",
      status: "ontime" as const,
      platform: "9",
      progress: 10,
      nextStation: "Valley Pass",
    },
  ];
  
  // Filter trains based on search query and active tab
  useEffect(() => {
    let results = trains;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        train => 
          train.trainNumber.toLowerCase().includes(query) || 
          train.trainName.toLowerCase().includes(query) ||
          train.origin.toLowerCase().includes(query) ||
          train.destination.toLowerCase().includes(query)
      );
    }
    
    // Filter by tab
    if (activeTab !== "all") {
      results = results.filter(train => train.status === activeTab);
    }
    
    setFilteredTrains(results);
  }, [searchQuery, activeTab]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by useEffect
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="container mx-auto space-y-8 pb-10 animate-enter">
      <header>
        <h1 className="text-3xl font-bold">Train Status</h1>
        <p className="text-muted-foreground">Check real-time updates on train arrivals and departures</p>
      </header>
      
      <section className="bg-rail-light p-6 rounded-lg">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="mb-2 block">Search by train number, name or station</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  id="search"
                  className="pl-10"
                  placeholder="e.g. EXP101, Central Station"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="bg-rail-primary hover:bg-rail-primary/90">
                <Search size={18} className="mr-2" />
                Search
              </Button>
              <Button variant="outline" className="bg-white">
                <Filter size={18} />
              </Button>
            </div>
          </div>
        </form>
      </section>
      
      <section>
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Trains</TabsTrigger>
            <TabsTrigger value="ontime">On Time</TabsTrigger>
            <TabsTrigger value="delayed">Delayed</TabsTrigger>
            <TabsTrigger value="boarding">Boarding</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {filteredTrains.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrains.map((train) => (
                  <TrainStatusCard
                    key={train.id}
                    trainNumber={train.trainNumber}
                    trainName={train.trainName}
                    origin={train.origin}
                    destination={train.destination}
                    departureTime={train.departureTime}
                    arrivalTime={train.arrivalTime}
                    status={train.status}
                    delay={train.delay}
                    platform={train.platform}
                    progress={train.progress}
                    nextStation={train.nextStation}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No trains found matching your search criteria.</p>
                <Button variant="link" onClick={() => setSearchQuery("")}>
                  Clear search and view all trains
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default TrainStatus;
