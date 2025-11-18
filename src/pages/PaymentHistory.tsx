import { useQuery } from "@tanstack/react-query";
import { ticketsApi, type TicketRecord } from "@/lib/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PaymentHistory = () => {
  const { data: tickets = [], isLoading } = useQuery<TicketRecord[]>({
    queryKey: ["tickets", "payments"],
    queryFn: () => ticketsApi.list(),
    staleTime: 15_000,
  });

  return (
    <div className="container mx-auto space-y-8 pb-10 animate-enter">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600">Your bookings and payments</p>
      </header>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="text-sm text-gray-600">Loading payments…</div>}
          {!isLoading && tickets.length === 0 && (
            <div className="text-sm text-gray-600">No payments found.</div>
          )}
          {!isLoading && tickets.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>PNR</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Train</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id || t.pnr}>
                      <TableCell>{t.created_at ? new Date(t.created_at).toLocaleString() : t.date}</TableCell>
                      <TableCell className="font-mono">{t.pnr}</TableCell>
                      <TableCell>
                        <span className="font-medium">{t.from}</span>
                        <span className="mx-2 text-gray-500">→</span>
                        <span className="font-medium">{t.to}</span>
                      </TableCell>
                      <TableCell className="truncate max-w-[220px]" title={t.trainName}>{t.trainName}</TableCell>
                      <TableCell className="text-right">₹{Number(t.fare || 0).toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "Confirmed" ? "default" : t.status === "Cancelled" ? "destructive" : "secondary"}>
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
