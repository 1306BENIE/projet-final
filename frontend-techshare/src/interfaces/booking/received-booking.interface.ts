export interface ReceivedBookingTool {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
}

export interface ReceivedBookingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  fullName: string;
}

export interface ReceivedBookingOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}

export interface ReceivedBooking {
  id: string;
  tool: ReceivedBookingTool;
  renter: ReceivedBookingUser;
  owner: ReceivedBookingOwner;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  paymentStatus:
    | "pending"
    | "paid"
    | "partially_refunded"
    | "refunded"
    | "failed";
  totalPrice: number;
  depositAmount: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  cancellationFee: number;
  refundAmount: number;
}

export interface ReceivedBookingsResponse {
  bookings: ReceivedBooking[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
