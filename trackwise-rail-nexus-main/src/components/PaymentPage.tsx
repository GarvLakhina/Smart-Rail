import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Smartphone, Building2, Wallet, Shield, CheckCircle } from "lucide-react";
import ETicket from "./ETicket";

interface PaymentPageProps {
  selectedTrain: {
    trainNumber: string;
    trainName: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
  };
  bookingDetails: {
    origin: string;
    destination: string;
    date: string;
    passengers: string;
    trainClass: string;
  };
  onBack: () => void;
}

const PaymentPage = ({ selectedTrain, bookingDetails, onBack }: PaymentPageProps) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  const totalFare = selectedTrain.price * parseInt(bookingDetails.passengers);
  const serviceFee = 2.99;
  const totalAmount = totalFare + serviceFee;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate ticket data
    const newTicketData = {
      pnr: `PNR${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      passengerName: "John Traveler",
      trainNumber: selectedTrain.trainNumber,
      trainName: selectedTrain.trainName,
      from: bookingDetails.origin,
      to: bookingDetails.destination,
      date: bookingDetails.date,
      departureTime: selectedTrain.departureTime,
      arrivalTime: selectedTrain.arrivalTime,
      seatNumbers: Array.from({length: parseInt(bookingDetails.passengers)}, (_, i) => `A${i + 15}`),
      class: bookingDetails.trainClass,
      fare: totalAmount,
      status: "Confirmed"
    };
    
    setTicketData(newTicketData);
    setPaymentSuccess(true);
    setIsProcessing(false);
  };

  if (paymentSuccess && ticketData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Ticket Confirmed!</h2>
          <p className="text-muted-foreground">Your booking has been successfully processed</p>
        </div>
        
        <ETicket ticketData={ticketData} />
        
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.print()}>Download Ticket</Button>
          <Button variant="outline" onClick={() => navigator.share && navigator.share({
            title: 'Train Ticket',
            text: `PNR: ${ticketData.pnr}`,
            url: window.location.href
          })}>
            Share Ticket
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{selectedTrain.trainNumber} - {selectedTrain.trainName}</p>
              <p className="text-sm text-muted-foreground">{bookingDetails.origin} → {bookingDetails.destination}</p>
              <p className="text-sm text-muted-foreground">{bookingDetails.date}</p>
            </div>
            <Badge variant="secondary">{bookingDetails.trainClass}</Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tickets ({bookingDetails.passengers}x)</span>
              <span>${totalFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>Choose your preferred payment option</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-3 flex-1 cursor-pointer">
                <CreditCard className="w-5 h-5 text-rail-primary" />
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay accepted</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="flex items-center gap-3 flex-1 cursor-pointer">
                <Smartphone className="w-5 h-5 text-rail-primary" />
                <div>
                  <p className="font-medium">UPI</p>
                  <p className="text-sm text-muted-foreground">Pay using any UPI app</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="netbanking" id="netbanking" />
              <Label htmlFor="netbanking" className="flex items-center gap-3 flex-1 cursor-pointer">
                <Building2 className="w-5 h-5 text-rail-primary" />
                <div>
                  <p className="font-medium">Net Banking</p>
                  <p className="text-sm text-muted-foreground">All major banks supported</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="wallet" id="wallet" />
              <Label htmlFor="wallet" className="flex items-center gap-3 flex-1 cursor-pointer">
                <Wallet className="w-5 h-5 text-rail-primary" />
                <div>
                  <p className="font-medium">Digital Wallets</p>
                  <p className="text-sm text-muted-foreground">Paytm, PhonePe, Google Pay</p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "card" && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "upi" && (
            <div className="mt-6 space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input id="upiId" placeholder="yourname@upi" />
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Your payment information is secured with 256-bit SSL encryption</span>
          </div>

          <div className="mt-6 flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="flex-1 bg-rail-primary hover:bg-rail-primary/90"
            >
              {isProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPage;