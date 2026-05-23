export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  category?: string;
  license_plate: string;
  color?: string;
  passengers: number;
  luggage: number;
  transmission: 'automatic' | 'mechanic';
  fuel_type: 'gasoline' | 'gas' | 'electricity';
  features?: string[];
  description?: string;
  images?: string;
  image?: string;
  price_per_day: number;
  status: 'available' | 'reserved' | 'in_service' | 'inactive';
  bookings_count: number;
}

export interface PaginatedCars {
  items: Car[];
  total_pages: number;
  total_items: number;
}

export interface Booking {
  id: number;
  customer_name: string;
  car_name: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'disputed';
  total_price: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  bookings_count: number;
  total_spent: number;
  member_since: string;
  phone?: string;
  address?: string;
  drivers_license?: string;
  booking_history?: Booking[];
}

export interface DashboardStats {
  monthly_revenue: number;
  total_bookings: number;
  available_cars: number;
  active_customers: number;
  revenue_trend: { date: string; value: number }[];
  bookings_trend: { date: string; value: number }[];
  fleet_by_category: { category: string; count: number }[];
}

export interface Settings {
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
}

export interface Discount {
  id: number;
  min_days: number;
  max_days: number | null;
  discount_percent: number;
}

export interface AdditionalService {
  id: number;
  icon: string;
  name: string;
  desc?: string;
  price: number;
}

export interface Card {
  id: number;
  card_number: string;
  expires: string;
}

export interface UserStats {
  total_deals: number;
  active_deals: number;
  total_spent: number;
  reward_points: number;
}

export interface UserMe {
  id: number;
  name: string;
  email: string;
  phone?: string;
  drivers_license?: string;
  address?: string;
  created_at: string;
  cards: Card[];
  stats: UserStats;
  booking_history: any[];
  role: string;
}
