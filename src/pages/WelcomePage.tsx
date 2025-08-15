import { useNavigate } from "react-router-dom";
import { Users, Shield, Train } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="container mx-auto max-w-4xl space-y-10 animate-enter">
        {/* Hero section */}
        <div className="text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-rail-primary rounded-full">
              <Train className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">TrackWise Rail</h1>
          <p className="text-xl text-gray-300 mb-8">
            Real-time train updates, easy booking, and comprehensive railway management
          </p>
        </div>

        {/* Login Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="bg-slate-800 border-slate-600 hover:border-rail-accent transition-colors cursor-pointer"
                onClick={() => navigate("/login?type=passenger")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-rail-accent">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold text-white">Passenger Portal</CardTitle>
              <CardDescription className="text-slate-400">
                Book tickets, check train status, and plan your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/login?type=passenger")}
                className="w-full bg-rail-accent hover:bg-rail-accent/90 text-white"
              >
                Passenger Login
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-600 hover:border-yellow-500 transition-colors cursor-pointer"
                onClick={() => navigate("/login?type=admin")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-yellow-500">
                  <Shield className="h-8 w-8 text-slate-900" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold text-white">Admin Dashboard</CardTitle>
              <CardDescription className="text-slate-400">
                Monitor operations, track crowds, and manage safety
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/login?type=admin")}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900"
              >
                Admin Login
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-slate-400 mb-4">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="text-rail-accent hover:text-rail-accent/80 p-0"
              onClick={() => navigate("/register")}
            >
              Register Now
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;