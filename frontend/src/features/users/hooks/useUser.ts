
import { useState, useEffect, useCallback } from "react";
import { userService } from "../services/user.service";
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from "../types";
import { Booking } from "../../admin/types";
import { useAuthStore } from "../../../store/auth.store";
import { handleApiError, handleApiSuccess } from "../../../shared/utils/errorHandler";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateUser } = useAuthStore();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      const updated = await userService.updateProfile(data);
      setProfile(updated);
      updateUser(updated as any);
      handleApiSuccess("Profile updated successfully!");
      return true;
    } catch (err: any) {
      handleApiError(err);
      return false;
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    try {
      await userService.changePassword(data);
      handleApiSuccess("Password changed successfully!");
      return true;
    } catch (err: any) {
      handleApiError(err);
      return false;
    }
  };

  return { profile, loading, error, updateProfile, changePassword, refresh: fetchProfile };
}

export function useUserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getBookings();
      setBookings(data);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refresh: fetchBookings };
}
