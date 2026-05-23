
import type { User } from "../../store/auth.store";
export type { User };
import { Booking } from "../admin/types";

export interface UserProfile extends User {
  bookings?: Booking[];
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  drivers_license?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}
