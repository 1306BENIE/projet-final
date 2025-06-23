import { Booking } from "@/interfaces/booking/booking.interface";
import { CreateBookingDto } from "@/interfaces/booking/dto.interface";
import api from "@/services/api";
import {
  ReceivedBooking,
  ReceivedBookingsResponse,
} from "@/interfaces/booking/received-booking.interface";

interface UpdateBookingDto {
  status?: string;
  totalPrice?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface BookingsResponse {
  bookings: Booking[];
  pagination: PaginationInfo;
}

interface CancellationInfo {
  canCancel: boolean;
  reason: string;
  fee: number;
  refundAmount: number;
  hoursUntilStart: number;
  daysUntilStart: number;
}

// Interface pour la réponse de paiement Stripe
interface StripePaymentResponse {
  message: string;
  clientSecret?: string;
  paymentIntent?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
}

// Définir l'interface pour la réponse de l'API
export interface BookedDatesResponse {
  bookedDates: {
    startDate: string;
    endDate: string;
    status: string;
  }[];
  totalActiveBookings: number;
  currentDate: string;
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
    const response = await api.post<{ booking: Booking }>("/bookings", data);
    const booking = response.data.booking;
    // Map _id vers id si nécessaire
    if (
      booking &&
      (booking as unknown as { _id?: string })._id &&
      !booking.id
    ) {
      booking.id = (booking as unknown as { _id: string })._id;
    }
    return booking;
  }

  async getBookings(page = 1, limit = 10): Promise<BookingsResponse> {
    try {
      console.log("Fetching bookings with pagination...", { page, limit });
      const response = await api.get<BookingsResponse>("/bookings", {
        params: { page, limit },
      });
      console.log("Bookings response:", response.data);

      if (!response.data.bookings || !Array.isArray(response.data.bookings)) {
        console.error("Invalid bookings response:", response.data);
        return {
          bookings: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      // Validate and filter bookings
      const validBookings = response.data.bookings.filter((booking) => {
        if (!booking || typeof booking !== "object") {
          console.warn("Invalid booking found:", booking);
          return false;
        }

        const bookingData = booking as unknown as Record<string, unknown>;

        // Handle different ID field names (_id vs id)
        const id = bookingData.id || bookingData._id;

        // Handle tool ID extraction
        let toolId: string | undefined;
        if (bookingData.toolId) {
          toolId = bookingData.toolId as string;
        } else if (bookingData.tool) {
          if (
            typeof bookingData.tool === "object" &&
            bookingData.tool !== null
          ) {
            const toolObj = bookingData.tool as Record<string, unknown>;
            toolId = (toolObj._id || toolObj.id) as string;
            console.log("Extracted toolId from tool object:", toolId);
          } else if (typeof bookingData.tool === "string") {
            toolId = bookingData.tool;
          }
        }

        // Check if we have the essential fields
        const hasId = id && typeof id === "string";
        const hasToolId = toolId && typeof toolId === "string";
        const hasStartDate =
          bookingData.startDate && typeof bookingData.startDate === "string";
        const hasEndDate =
          bookingData.endDate && typeof bookingData.endDate === "string";
        const hasStatus =
          bookingData.status && typeof bookingData.status === "string";
        const hasTotalPrice = typeof bookingData.totalPrice === "number";

        const isValid =
          hasId &&
          hasToolId &&
          hasStartDate &&
          hasEndDate &&
          hasStatus &&
          hasTotalPrice;

        if (!isValid) {
          console.warn("Invalid booking found:", booking);
          console.log("Validation details:", {
            hasId,
            hasToolId,
            hasStartDate,
            hasEndDate,
            hasStatus,
            hasTotalPrice,
            id: bookingData.id || bookingData._id,
            toolId,
            toolObject: bookingData.tool,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            status: bookingData.status,
            totalPrice: bookingData.totalPrice,
          });
        } else {
          // Normalize the structure for frontend use
          if (!bookingData.id && bookingData._id) {
            bookingData.id = bookingData._id;
          }
          if (!bookingData.toolId && toolId) {
            bookingData.toolId = toolId;
          }
        }
        return isValid;
      });

      console.log("Valid bookings:", validBookings);

      return {
        bookings: validBookings,
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return {
        bookings: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
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

  async getReceivedBookings(): Promise<ReceivedBooking[]> {
    try {
      console.log("Fetching received bookings...");
      const response = await api.get<ReceivedBookingsResponse>(
        "/bookings/owner"
      );
      console.log("Received bookings response:", response.data);

      if (response.data.bookings && Array.isArray(response.data.bookings)) {
        console.log("Found bookings:", response.data.bookings.length);
        return response.data.bookings;
      } else {
        console.error("Unexpected response structure:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching received bookings:", error);
      throw error;
    }
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

  async cancelBooking(
    id: string,
    reason?: string
  ): Promise<{ booking: Booking; cancellationInfo: CancellationInfo }> {
    const response = await api.post<{
      booking: Booking;
      cancellationInfo: CancellationInfo;
    }>(`/bookings/${id}/cancel`, {
      reason,
    });
    return response.data;
  }

  async getCancellationEligibility(id: string): Promise<{
    booking: Record<string, unknown>;
    cancellationInfo: CancellationInfo;
  }> {
    console.log(
      "bookingService.getCancellationEligibility called with id:",
      id
    );
    console.log("Making API call to:", `/bookings/${id}/cancel-eligibility`);

    // Test simple pour vérifier si l'API répond
    try {
      console.log("Testing basic API connectivity...");
      const testResponse = await api.get("/bookings", { timeout: 5000 });
      console.log("Basic API test successful:", testResponse.status);
    } catch (testError) {
      console.error("Basic API test failed:", testError);
      throw new Error("Backend API is not responding");
    }

    // Test de l'endpoint de booking simple
    try {
      console.log("Testing booking routes...");
      const bookingTestResponse = await api.get("/bookings/test", {
        timeout: 5000,
      });
      console.log("Booking routes test successful:", bookingTestResponse.data);
    } catch (bookingTestError) {
      console.error("Booking routes test failed:", bookingTestError);
      throw new Error("Booking routes are not working");
    }

    try {
      const response = await api.get<{
        booking: Record<string, unknown>;
        cancellationInfo: CancellationInfo;
      }>(`/bookings/${id}/cancel-eligibility`, {
        timeout: 10000, // 10 secondes de timeout
      });

      console.log("API response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getCancellationEligibility:", error);
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ECONNABORTED"
      ) {
        console.error("Request timed out after 10 seconds");
      }
      throw error;
    }
  }

  async completeBooking(id: string): Promise<Booking> {
    const response = await api.put<Booking>(`/bookings/${id}/complete`);
    return response.data;
  }

  async getBookedDates(toolId: string): Promise<BookedDatesResponse> {
    const response = await api.get<BookedDatesResponse>(
      `/bookings/booked-dates/${toolId}`
    );
    return response.data;
  }

  // Méthode pour créer une réservation et récupérer immédiatement le clientSecret
  async createBookingWithPayment(data: CreateBookingDto): Promise<{
    booking: Booking;
  }> {
    try {
      // Créer la réservation
      const booking = await this.createBooking(data);
      // Retourner simplement le booking, le paiement sera géré dans le PaymentModal
      return { booking };
    } catch (error) {
      console.error(
        "Erreur lors de la création de la réservation avec paiement:",
        error
      );
      throw error;
    }
  }

  // Nouvelle méthode pour créer un PaymentIntent Stripe
  async createPaymentIntent({
    amount,
    currency = "xof",
    rentalId,
    paymentMethodId,
  }: {
    amount: number;
    currency?: string;
    rentalId: string;
    paymentMethodId: string;
  }): Promise<StripePaymentResponse> {
    try {
      // Log du body envoyé
      console.log("Body envoyé à /api/payments/create-intent :", {
        amount,
        currency,
        rentalId,
        paymentMethodId,
      });
      const response = await api.post<StripePaymentResponse>(
        "/payments/create-intent",
        {
          amount,
          currency,
          rentalId,
          paymentMethodId,
        }
      );
      return response.data;
    } catch (error: unknown) {
      // Log du détail de l'erreur backend
      type AxiosErrorLike = { response?: { data?: unknown } };
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as AxiosErrorLike).response
      ) {
        const err = error as AxiosErrorLike;
        console.error(
          "Erreur API paiement (détail complet) :",
          JSON.stringify(err.response, null, 2)
        );
      } else {
        console.error("Erreur lors de la création du payment intent:", error);
      }
      throw new Error("Impossible de créer le paiement");
    }
  }
}

export const bookingService = new BookingService();
