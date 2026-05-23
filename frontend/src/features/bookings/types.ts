
export interface CreateBookingRequest {
  car_id: number;
  start_time: string;
  end_time: string;
  pick_up_location: string;
  additional_services: number[];
}

export interface BookingResponse {
  id: number;
  car_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
}
