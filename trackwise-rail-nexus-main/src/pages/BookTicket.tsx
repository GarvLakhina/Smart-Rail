
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Calendar, ArrowRight, Train, Users, CreditCard, QrCode } from "lucide-react";
import PaymentPage from "@/components/PaymentPage";

const BookTicket = () => {
  const [step, setStep] = useState(1);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    date: "",
    passengers: "1",
    trainClass: "economy",
  });
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };
  
  return (
    <div className="container mx-auto space-y-8 pb-10 animate-enter">
      <header>
        <h1 className="text-3xl font-bold">Book Tickets</h1>
        <p className="text-muted-foreground">Search and book train tickets for your journey</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div>
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Journey Details</CardTitle>
                <CardDescription>Enter your journey information to find available trains</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="origin">From</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          id="origin"
                          name="origin"
                          placeholder="Origin station"
                          className="pl-10"
                          value={formData.origin}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="destination">To</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          id="destination"
                          name="destination"
                          placeholder="Destination station"
                          className="pl-10"
                          value={formData.destination}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date of Journey</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          className="pl-10"
                          value={formData.date}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="passengers">Passengers</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          id="passengers"
                          name="passengers"
                          type="number"
                          min="1"
                          max="10"
                          className="pl-10"
                          value={formData.passengers}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Class</Label>
                    <RadioGroup 
                      defaultValue={formData.trainClass}
                      className="grid grid-cols-3 gap-4 mt-2"
                      onValueChange={(value) => setFormData(prev => ({ ...prev, trainClass: value }))}
                    >
                      <div>
                        <RadioGroupItem value="economy" id="economy" className="peer sr-only" />
                        <Label
                          htmlFor="economy"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-rail-light p-4 hover:bg-rail-light/80 hover:border-rail-accent peer-data-[state=checked]:border-rail-accent peer-data-[state=checked]:bg-rail-accent/10"
                        >
                          <span className="text-sm font-medium">Economy</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem value="business" id="business" className="peer sr-only" />
                        <Label
                          htmlFor="business"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-rail-light p-4 hover:bg-rail-light/80 hover:border-rail-accent peer-data-[state=checked]:border-rail-accent peer-data-[state=checked]:bg-rail-accent/10"
                        >
                          <span className="text-sm font-medium">Business</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem value="first" id="first" className="peer sr-only" />
                        <Label
                          htmlFor="first"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-rail-light p-4 hover:bg-rail-light/80 hover:border-rail-accent peer-data-[state=checked]:border-rail-accent peer-data-[state=checked]:bg-rail-accent/10"
                        >
                          <span className="text-sm font-medium">First Class</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full bg-rail-primary hover:bg-rail-primary/90">
                    <Train size={18} className="mr-2" />
                    Find Trains
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
          
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Trains</CardTitle>
                <CardDescription>Select a train for your journey from {formData.origin} to {formData.destination}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TrainOption
                  trainNumber="EXP101"
                  trainName="Ocean Express"
                  departureTime="08:30"
                  arrivalTime="12:45"
                  duration="4h 15m"
                  price={59.99}
                  availability="Available"
                  onSelect={() => {
                    setSelectedTrain({
                      trainNumber: "EXP101",
                      trainName: "Ocean Express",
                      departureTime: "08:30",
                      arrivalTime: "12:45",
                      duration: "4h 15m",
                      price: 59.99
                    });
                    setStep(3);
                  }}
                />
                <TrainOption
                  trainNumber="SPD330"
                  trainName="Capital Bullet"
                  departureTime="10:00"
                  arrivalTime="13:20"
                  duration="3h 20m"
                  price={79.99}
                  availability="Few seats left"
                  onSelect={() => {
                    setSelectedTrain({
                      trainNumber: "SPD330",
                      trainName: "Capital Bullet",
                      departureTime: "10:00",
                      arrivalTime: "13:20",
                      duration: "3h 20m",
                      price: 79.99
                    });
                    setStep(3);
                  }}
                />
                <TrainOption
                  trainNumber="REG205"
                  trainName="Valley Commuter"
                  departureTime="11:45"
                  arrivalTime="15:15"
                  duration="3h 30m"
                  price={49.99}
                  availability="Sold out"
                  disabled
                  onSelect={() => console.log("Selected train")}
                />
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setStep(1)}>Back to Search</Button>
              </CardFooter>
            </Card>
          )}
          
          {step === 3 && selectedTrain && (
            <PaymentPage 
              selectedTrain={selectedTrain}
              bookingDetails={formData}
              onBack={() => setStep(2)}
            />
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-rail-light p-2 rounded-full">
                  <Calendar size={18} className="text-rail-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Book in Advance</p>
                  <p className="text-xs text-muted-foreground">Get better deals by booking your tickets early</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-3">
                <div className="bg-rail-light p-2 rounded-full">
                  <CreditCard size={18} className="text-rail-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Multiple Payment Options</p>
                  <p className="text-xs text-muted-foreground">Pay using credit/debit cards, mobile wallets, or bank transfer</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-3">
                <div className="bg-rail-light p-2 rounded-full">
                  <QrCode size={18} className="text-rail-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Digital Tickets</p>
                  <p className="text-xs text-muted-foreground">Download e-tickets with QR code for contactless travel</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface TrainOptionProps {
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availability: string;
  disabled?: boolean;
  onSelect: () => void;
}

const TrainOption = ({
  trainNumber,
  trainName,
  departureTime,
  arrivalTime,
  duration,
  price,
  availability,
  disabled = false,
  onSelect
}: TrainOptionProps) => {
  const isAvailable = !disabled;
  
  return (
    <div 
      className={`border rounded-lg p-4 transition-all ${
        disabled 
          ? 'bg-gray-50 opacity-60' 
          : 'hover:border-rail-accent hover:shadow-md cursor-pointer'
      }`}
      onClick={isAvailable ? onSelect : undefined}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Train size={16} className="text-rail-primary" />
            <span className="font-medium">{trainNumber}</span>
            <span className="text-sm text-muted-foreground">|</span>
            <span>{trainName}</span>
          </div>
          <div className="flex items-center mt-2">
            <div>
              <div className="font-medium">{departureTime}</div>
              <div className="text-xs text-muted-foreground">Departure</div>
            </div>
            <ArrowRight size={16} className="mx-3 text-muted-foreground" />
            <div>
              <div className="font-medium">{arrivalTime}</div>
              <div className="text-xs text-muted-foreground">Arrival</div>
            </div>
            <div className="ml-4 text-sm text-muted-foreground">
              <span className="block sm:inline">Duration: {duration}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end mt-4 sm:mt-0">
          <div className="text-lg font-semibold">${price.toFixed(2)}</div>
          <div className={`text-xs ${disabled ? 'text-red-500' : 'text-green-600'}`}>{availability}</div>
          {isAvailable && (
            <Button size="sm" className="mt-2 bg-rail-primary hover:bg-rail-primary/90">
              Select
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookTicket;
