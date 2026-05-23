
import { Car } from "../cars/types";
import { User } from "../../store/auth.store";

export interface Booking {
  id: number;
  car_id: number;
  user_id: number;
  customer_name?: string;
  car_name?: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  car?: Car;
  user?: User;
}

export interface DashboardStats {
  total_cars: number;
  total_bookings: number;
  total_users: number;
  total_revenue: number;
  revenue_trend: { date: string; value: number }[];
  bookings_trend: { date: string; value: number }[];
  fleet_by_category: { category: string; count: number }[];
}

export interface Discount {
  id: number;
  min_days: number;
  max_days: number;
  discount_percent: number;
}

export interface AdditionalService {
  id: number;
  icon: string;
  name: string;
  desc: string;
  price: number;
}
