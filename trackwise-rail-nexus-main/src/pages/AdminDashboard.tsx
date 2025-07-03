
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AreaChart, BarChart, PieChart } from "@/components/ui/chart";
import { 
  Users, 
  ArrowUp, 
  ArrowDown, 
  Ticket, 
  Train, 
  AlertTriangle, 
  Map,
  Clock,
  Calendar,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto space-y-8 pb-10 animate-enter">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage railway operations</p>
      </header>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trains">Trains</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Sales</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Total Passengers"
              value="12,543"
              description={<><ArrowUp size={14} className="text-green-500" /> 12% from yesterday</>}
              icon={<Users className="h-6 w-6 text-rail-accent" />}
            />
            <StatsCard 
              title="Tickets Sold"
              value="1,345"
              description={<><ArrowUp size={14} className="text-green-500" /> 8% from yesterday</>}
              icon={<Ticket className="h-6 w-6 text-rail-accent" />}
            />
            <StatsCard 
              title="Active Trains"
              value="43"
              description={<>2 delayed</>}
              icon={<Train className="h-6 w-6 text-rail-accent" />}
            />
            <StatsCard 
              title="Incidents"
              value="3"
              description={<><ArrowDown size={14} className="text-green-500" /> 2 resolved today</>}
              icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Passenger Traffic</CardTitle>
                <CardDescription>Daily passenger volume across all stations</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart 
                  data={[
                    { date: "2023-01-01", value: 5000 },
                    { date: "2023-01-02", value: 7800 },
                    { date: "2023-01-03", value: 4500 },
                    { date: "2023-01-04", value: 9000 },
                    { date: "2023-01-05", value: 8500 },
                    { date: "2023-01-06", value: 7300 },
                    { date: "2023-01-07", value: 6000 }
                  ]}
                  categories={["value"]}
                  index="date"
                  colors={["#4a6fa5"]}
                  valueFormatter={(value) => `${value.toLocaleString()} passengers`}
                  className="aspect-[4/3]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Train Type</CardTitle>
                <CardDescription>Breakdown of ticket sales by train category</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={[
                    { name: "Express", value: 45 },
                    { name: "Local", value: 20 },
                    { name: "High-Speed", value: 35 }
                  ]}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value}%`}
                  colors={["#1a365d", "#4a6fa5", "#20b2aa"]}
                  className="aspect-[4/3]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Crowd density heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="h-5 w-5" />
                Real-time Crowd Density
              </CardTitle>
              <CardDescription>Live passenger density across major stations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center text-muted-foreground">
                Interactive station density heatmap would appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trains">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Train className="h-5 w-5 mr-2" />
                    Train Status Management
                  </span>
                  <Button size="sm">Update Schedule</Button>
                </CardTitle>
                <CardDescription>Manage train operations and schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center text-muted-foreground">
                  Train management interface would appear here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Ticket className="h-5 w-5 mr-2" />
                    Ticket Sales Analytics
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      This Week
                    </Button>
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Today
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>Monitor and analyze ticket sales</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={[
                    { date: "Monday", express: 240, local: 180, highSpeed: 200 },
                    { date: "Tuesday", express: 290, local: 190, highSpeed: 240 },
                    { date: "Wednesday", express: 350, local: 210, highSpeed: 280 },
                    { date: "Thursday", express: 320, local: 170, highSpeed: 220 },
                    { date: "Friday", express: 400, local: 230, highSpeed: 290 },
                    { date: "Saturday", express: 450, local: 280, highSpeed: 350 },
                    { date: "Sunday", express: 380, local: 240, highSpeed: 300 }
                  ]}
                  index="date"
                  categories={["express", "local", "highSpeed"]}
                  colors={["#1a365d", "#4a6fa5", "#20b2aa"]}
                  valueFormatter={(value) => `${value} tickets`}
                  className="aspect-[16/9]"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stations">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Map className="h-5 w-5 mr-2" />
                    Station Management
                  </span>
                </CardTitle>
                <CardDescription>Monitor and manage station operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center text-muted-foreground">
                  Station management interface would appear here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: React.ReactNode;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, description, icon }: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground flex items-center mt-1">{description}</p>
          </div>
          <div className="p-2 bg-rail-light rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
