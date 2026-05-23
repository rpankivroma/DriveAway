
import { useState } from "react";
import { bookingService } from "../services/booking.service";
import { CreateBookingRequest } from "../types";
import { handleApiError, handleApiSuccess } from "../../../shared/utils/errorHandler";

export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (data: CreateBookingRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.createBooking(data);
      handleApiSuccess("Booking created successfully!");
      return response;
    } catch (err: any) {
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading, error };
}

export function useCancelBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBooking = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await bookingService.cancelBooking(id);
      handleApiSuccess("Booking cancelled successfully!");
      return true;
    } catch (err: any) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { cancelBooking, loading, error };
}
