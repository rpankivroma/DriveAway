
export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price_per_day: number;
  transmission: string;
  fuel_type: string;
  passengers: number;
  image_url?: string;
  is_available: boolean;
  category?: string;
  description?: string;
  license_plate?: string;
  color?: string;
  luggage?: number;
  features?: string | string[];
}

export interface CarFilters {
  make?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  transmission?: string;
  fuel_type?: string;
  passengers?: string;
  luggage?: string;
  features?: string;
  search?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}

export interface CarsResponse {
  items: Car[];
  total_pages: number;
  total_items: number;
}
