import { Booking } from "@/interfaces/booking/booking.interface";
import { CreateBookingDto } from "@/interfaces/booking/dto.interface";
import api from "./api";

interface UpdateBookingDto {
  status?: string;
  totalPrice?: number;
}

class BookingService {
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    const response = await api.post<Booking>("/bookings", data);
    return response.data;
  }

  async getBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>("/bookings");
    return response.data;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(`/bookings/user/${userId}`);
    return response.data;
  }

  async getReceivedBookings(): Promise<Booking[]> {
    const response = await api.get<{ bookings: Booking[] }>("/bookings/owner");
    return response.data.bookings;
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
