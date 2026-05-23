
import { apiClient } from "../../../shared/api/client";
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from "../types";
import { Booking } from "../../admin/types";

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    return apiClient<UserProfile>("/api/users/me");
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    return apiClient<UserProfile>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    return apiClient("/api/users/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getBookings: async (): Promise<Booking[]> => {
    return apiClient<Booking[]>("/api/users/bookings");
  },
};
