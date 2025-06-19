import { Booking } from "@/interfaces/booking/booking.interface";
import { CreateBookingDto } from "@/interfaces/booking/dto.interface";
import api from "./api";

interface UpdateBookingDto {
  status?: string;
  totalPrice?: number;
}

// Fonction utilitaire pour valider une réservation
function isValidBooking(booking: unknown): booking is Booking {
  if (!booking || typeof booking !== "object" || booking === null) {
    return false;
  }

  const b = booking as Record<string, unknown>;

  return (
    typeof b.id === "string" &&
    typeof b.toolId === "string" &&
    typeof b.userId === "string" &&
    typeof b.startDate === "string" &&
    typeof b.endDate === "string" &&
    typeof b.status === "string" &&
    typeof b.totalPrice === "number"
  );
}

class BookingService {
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    const response = await api.post<Booking>("/bookings", data);
    return response.data;
  }

  async getBookings(): Promise<Booking[]> {
    try {
      console.log("Fetching bookings...");
      const response = await api.get<Booking[]>("/bookings");
      console.log("Bookings response:", response.data);

      if (!Array.isArray(response.data)) {
        console.error("Response data is not an array:", response.data);
        return [];
      }

      const validBookings = response.data.filter((booking) => {
        // Accepter soit toolId soit tool (l'API peut retourner l'un ou l'autre)
        const bookingData = booking as unknown as Record<string, unknown>;
        const toolId = bookingData.toolId || bookingData.tool;
        const isValid = booking && toolId && typeof toolId === "string";

        if (!isValid) {
          console.warn("Invalid booking found:", booking);
        } else {
          // Normaliser la structure en s'assurant que toolId existe
          if (!bookingData.toolId && bookingData.tool) {
            bookingData.toolId = bookingData.tool;
          }
        }
        return isValid;
      });

      console.log("Valid bookings:", validBookings);
      return validBookings;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}`);
    if (!isValidBooking(response.data)) {
      throw new Error("Format de réservation invalide");
    }
    return response.data;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(`/bookings/user/${userId}`);
    return response.data.filter(isValidBooking);
  }

  async getReceivedBookings(): Promise<Booking[]> {
    const response = await api.get<{ bookings: Booking[] }>("/bookings/owner");
    return response.data.bookings.filter(isValidBooking);
  }

  async updateBooking(id: string, data: UpdateBookingDto): Promise<Booking> {
    const response = await api.put<Booking>(`/bookings/${id}`, data);
    return response.data;
  }

  async confirmBooking(id: string): Promise<Booking> {
    const response = await api.put<Booking>(`/bookings/${id}/confirm`);
    return response.data;
  }

  async rejectBooking(id: string): Promise<Booking> {
    const response = await api.put<Booking>(`/bookings/${id}/reject`);
    return response.data;
  }

  async cancelBooking(id: string): Promise<Booking> {
    const response = await api.put<Booking>(`/bookings/${id}/cancel`);
    return response.data;
  }

  async completeBooking(id: string): Promise<Booking> {
    const response = await api.put<Booking>(`/bookings/${id}/complete`);
    return response.data;
  }

  async getBookedDates(toolId: string) {
    const response = await api.get<{ startDate: string; endDate: string }[]>(
      `/tools/${toolId}/booked-dates`
    );
    return response.data;
  }
}

export const bookingService = new BookingService();
