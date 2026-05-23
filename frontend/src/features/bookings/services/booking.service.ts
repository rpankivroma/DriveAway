
import { apiClient } from "../../../shared/api/client";
import { CreateBookingRequest, BookingResponse } from "../types";

export const bookingService = {
  createBooking: async (data: CreateBookingRequest): Promise<BookingResponse> => {
    return apiClient<BookingResponse>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getBookingById: async (id: number): Promise<BookingResponse> => {
    return apiClient<BookingResponse>(`/api/bookings/${id}`);
  },

  cancelBooking: async (id: number): Promise<void> => {
    return apiClient(`/api/bookings/${id}/cancel`, {
      method: "POST",
    });
  },

  confirmBooking: async (id: number): Promise<void> => {
    return apiClient(`/api/bookings/${id}/confirm`, {
      method: "POST",
    });
  },
};
