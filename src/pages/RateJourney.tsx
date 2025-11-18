import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ticketsApi, type TicketRecord } from "@/lib/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

const RateJourney = () => {
  const [params] = useSearchParams();
  const pnrParam = params.get("pnr") || "";
  const { data: tickets = [] } = useQuery<TicketRecord[]>({
    queryKey: ["tickets", "rate"],
    queryFn: () => ticketsApi.list(),
    staleTime: 15_000,
  });
  const latest = tickets[0];
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [feedback, setFeedback] = useState("");

  const active = tickets.find(t => t.pnr === pnrParam) || latest;

  return (
    <div className="container mx-auto space-y-8 pb-10 animate-enter">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Rate Your Journey</h1>
        <p className="text-gray-600">Share feedback for your recent trip</p>
      </header>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!active && <div className="text-sm text-gray-600">No recent trips to rate.</div>}
          {active && (
            <div className="space-y-2 text-sm text-gray-800">
              <div><span className="font-medium">PNR:</span> <span className="font-mono">{active.pnr}</span></div>
              <div><span className="font-medium">Route:</span> {active.from} → {active.to}</div>
              <div><span className="font-medium">Train:</span> {active.trainName} ({active.trainNumber})</div>
              <div><span className="font-medium">Date:</span> {active.date} {active.departureTime ? `• ${active.departureTime}` : ""}</div>
            </div>
          )}

          {active && (
            <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); alert("Thanks for your feedback!");}}>
              <div className="flex items-center gap-2">
                <Label className="mr-2">Rating</Label>
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Rate ${n} star${n>1?"s":""}`}
                    className={`p-1 ${rating>=n?"text-yellow-500":"text-gray-400"}`}
                    onClick={()=>setRating(n)}
                  >
                    <Star className={rating>=n?"fill-yellow-500":""} />
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Great trip!" />
                </div>
                <div>
                  <Label htmlFor="name">Passenger</Label>
                  <Input id="name" value={active.passengerName} readOnly />
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea id="feedback" value={feedback} onChange={(e)=>setFeedback(e.target.value)} placeholder="Tell us more..." />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Submit</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RateJourney;
