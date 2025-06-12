export interface ReceivedBooking {
  id: string;
  tool: { name: string; image: string };
  renter: { name: string; email: string };
  startDate: string;
  endDate: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}
