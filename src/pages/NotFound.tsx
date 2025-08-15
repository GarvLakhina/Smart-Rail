
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Train } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-rail-light p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-rail-primary rounded-full p-4">
            <Train className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-rail-primary mb-4">404</h1>
        <p className="text-2xl text-rail-dark mb-4">Oops! This train doesn't stop here.</p>
        <p className="text-rail-secondary mb-8">
          We couldn't find the page you're looking for. It might have been moved, 
          renamed, or might not exist.
        </p>
        <div className="flex justify-center">
          <Link to="/">
            <Button className="bg-rail-primary hover:bg-rail-primary/90">
              Return to Home Station
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
