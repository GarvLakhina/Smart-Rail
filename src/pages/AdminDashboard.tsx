
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ArrowUp, 
  ArrowDown, 
  Train, 
  AlertTriangle, 
  Map,
  Shield,
  Zap,
  Activity,
  TrendingUp
} from "lucide-react";
import CollisionDetectionMap from "@/components/admin/CollisionDetectionMap";
import CrowdDensityHeatmap from "@/components/admin/CrowdDensityHeatmap";
import EnergyOptimizationControl from "@/components/admin/EnergyOptimizationControl";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="container mx-auto space-y-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Railway Control Center</h1>
          <p className="text-slate-300 text-lg">Advanced monitoring and management for railway operations</p>
        </header>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:flex bg-slate-800 border-slate-600">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-600 text-white">Overview</TabsTrigger>
            <TabsTrigger value="collision" className="data-[state=active]:bg-slate-600 text-white">Collision Detection</TabsTrigger>
            <TabsTrigger value="crowd" className="data-[state=active]:bg-slate-600 text-white">Crowd Density</TabsTrigger>
            <TabsTrigger value="energy" className="data-[state=active]:bg-slate-600 text-white">Energy Control</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard 
                title="Active Trains"
                value="43"
                description={<>2 delayed, 41 on time</>}
                icon={<Train className="h-6 w-6 text-blue-400" />}
              />
              <StatsCard 
                title="Collision Alerts"
                value="1"
                description={<><AlertTriangle size={14} className="text-red-500" /> High priority</>}
                icon={<Shield className="h-6 w-6 text-red-500" />}
              />
              <StatsCard 
                title="Crowd Status"
                value="67%"
                description={<><TrendingUp size={14} className="text-orange-500" /> Peak hours</>}
                icon={<Users className="h-6 w-6 text-orange-400" />}
              />
              <StatsCard 
                title="Energy Efficiency" 
                value="89%"
                description={<><ArrowUp size={14} className="text-green-500" /> Optimized</>}
                icon={<Zap className="h-6 w-6 text-green-500" />}
              />
            </div>

            {/* System Monitoring Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-white">Collision Detection</CardTitle>
                  </div>
                  <CardDescription className="text-slate-400">Real-time train tracking and collision prevention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500 mb-2">1 Warning</div>
                  <div className="text-sm text-slate-400">Express 101 & Bullet 330 - 45s to collision</div>
                  <div className="mt-4 h-2 bg-slate-700 rounded">
                    <div className="h-2 bg-red-500 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-3 text-slate-300 border-slate-600"
                    onClick={() => setActiveTab("collision")}
                  >
                    View Live Map
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-white">Crowd Density</CardTitle>
                  </div>
                  <CardDescription className="text-slate-400">Heat map visualization of passenger flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500 mb-2">High Density</div>
                  <div className="text-sm text-slate-400">2 critical zones detected</div>
                  <div className="mt-4 h-2 bg-slate-700 rounded">
                    <div className="h-2 bg-orange-500 rounded w-2/3"></div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-3 text-slate-300 border-slate-600"
                    onClick={() => setActiveTab("crowd")}
                  >
                    View Heat Map
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-white">Energy Control</CardTitle>
                  </div>
                  <CardDescription className="text-slate-400">Automated energy optimization system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500 mb-2">89%</div>
                  <div className="text-sm text-slate-400">$127 saved today</div>
                  <div className="mt-4 h-2 bg-slate-700 rounded">
                    <div className="h-2 bg-green-500 rounded w-11/12"></div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-3 text-slate-300 border-slate-600"
                    onClick={() => setActiveTab("energy")}
                  >
                    Control Systems
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* System Status Overview */}
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Shield className="h-5 w-5" />
                  System Status Overview
                </CardTitle>
                <CardDescription className="text-slate-400">Real-time monitoring of all railway systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-700">
                    <div className="text-2xl font-bold text-red-400">1</div>
                    <div className="text-sm text-red-300">Active Alerts</div>
                  </div>
                  <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-700">
                    <div className="text-2xl font-bold text-green-400">98.5%</div>
                    <div className="text-sm text-green-300">System Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                    <div className="text-2xl font-bold text-blue-400">43</div>
                    <div className="text-sm text-blue-300">Monitored Trains</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collision">
            <div className="bg-white rounded-lg p-6">
              <CollisionDetectionMap />
            </div>
          </TabsContent>

          <TabsContent value="crowd">
            <div className="bg-white rounded-lg p-6">
              <CrowdDensityHeatmap />
            </div>
          </TabsContent>

          <TabsContent value="energy">
            <div className="bg-white rounded-lg p-6">
              <EnergyOptimizationControl />
            </div>
          </TabsContent>
        </Tabs>
      </div>
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
    <Card className="bg-slate-800 border-slate-600">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 flex items-center mt-1">{description}</p>
          </div>
          <div className="p-2 bg-slate-700 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
