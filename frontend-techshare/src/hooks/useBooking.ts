import { useState } from "react";
import { Booking } from "@/interfaces/booking/booking.interface";
import {
  CreateBookingDto,
  UpdateBookingDto,
} from "@/interfaces/booking/dto.interface";
import { bookingService } from "@/services/bookingService";

export function useBooking() {
  const [loadingStates, setLoadingStates] = useState({
    create: false,
    get: false,
    getById: false,
    getUser: false,
    update: false,
    cancel: false,
  });
  const [error, setError] = useState<string | null>(null);

  const setLoading = (
    operation: keyof typeof loadingStates,
    value: boolean
  ) => {
    setLoadingStates((prev) => ({ ...prev, [operation]: value }));
  };

  const createBooking = async (
    data: CreateBookingDto
  ): Promise<Booking | null> => {
    try {
      setLoading("create", true);
      setError(null);
      const booking = await bookingService.createBooking(data);
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return null;
    } finally {
      setLoading("create", false);
    }
  };

  const getBookings = async (): Promise<Booking[]> => {
    try {
      setLoading("get", true);
      setError(null);
      return await bookingService.getBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return [];
    } finally {
      setLoading("get", false);
    }
  };

  const getBookingById = async (id: string): Promise<Booking | null> => {
    try {
      setLoading("getById", true);
      setError(null);
      const booking = await bookingService.getBooking(id);
      return booking || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return null;
    } finally {
      setLoading("getById", false);
    }
  };

  const getUserBookings = async (email: string): Promise<Booking[]> => {
    try {
      setLoading("getUser", true);
      setError(null);
      return await bookingService.getUserBookings(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return [];
    } finally {
      setLoading("getUser", false);
    }
  };

  const updateBooking = async (
    id: string,
    data: UpdateBookingDto
  ): Promise<Booking | null> => {
    try {
      setLoading("update", true);
      setError(null);
      const booking = await bookingService.updateBooking(id, data);
      return booking || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return null;
    } finally {
      setLoading("update", false);
    }
  };

  const cancelBooking = async (id: string): Promise<Booking | null> => {
    try {
      setLoading("cancel", true);
      setError(null);
      const booking = await bookingService.cancelBooking(id);
      return booking || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return null;
    } finally {
      setLoading("cancel", false);
    }
  };

  return {
    loadingStates,
    error,
    createBooking,
    getBookings,
    getBookingById,
    getUserBookings,
    updateBooking,
    cancelBooking,
  };
}
