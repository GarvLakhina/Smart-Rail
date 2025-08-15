
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Train, UserPlus, Shield, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created successfully! Please check your email to verify your account.");
        navigate("/login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Train size={48} className="mx-auto text-rail-accent mb-4" />
          <h1 className="text-3xl font-bold text-white">Join TrackWise</h1>
          <p className="text-slate-400 mt-2">Create your account to get started</p>
        </div>

        <Card className="bg-slate-800 border-slate-600">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-400">Fill in your details to register</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-white text-sm font-medium">Account Type</Label>
                <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="user" id="user" className="peer sr-only" />
                    <Label
                      htmlFor="user"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-slate-600 bg-slate-700 p-4 hover:bg-slate-600 peer-data-[state=checked]:border-rail-accent [&:has([data-state=checked])]:border-rail-accent cursor-pointer"
                    >
                      <User className="mb-3 h-6 w-6 text-blue-400" />
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">Passenger</div>
                        <div className="text-xs text-slate-400">Book & manage travel</div>
                      </div>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
                    <Label
                      htmlFor="admin"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-slate-600 bg-slate-700 p-4 hover:bg-slate-600 peer-data-[state=checked]:border-rail-accent [&:has([data-state=checked])]:border-rail-accent cursor-pointer"
                    >
                      <Shield className="mb-3 h-6 w-6 text-red-400" />
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">Admin</div>
                        <div className="text-xs text-slate-400">Manage operations</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-rail-primary hover:bg-rail-primary/90 text-white" 
                disabled={isLoading}
              >
                <UserPlus size={18} className="mr-2" />
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <p className="text-sm text-center mt-4 text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="text-rail-accent hover:text-rail-accent/80 font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
