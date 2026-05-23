
import { apiClient } from "../../../shared/api/client";
import { Car } from "../../cars/types";
import { Booking, DashboardStats } from "../types";
import { User } from "../../../store/auth.store";

export const adminService = {
  getStats: async (): Promise<DashboardStats> => {
    return apiClient<DashboardStats>("/api/admin/stats");
  },

  getCars: async (): Promise<Car[]> => {
    return apiClient<Car[]>("/api/admin/cars");
  },

  createCar: async (carData: any): Promise<Car> => {
    return apiClient<Car>("/api/admin/cars", {
      method: "POST",
      body: JSON.stringify(carData),
    });
  },

  updateCar: async (id: number, carData: any): Promise<Car> => {
    return apiClient<Car>(`/api/admin/cars/${id}`, {
      method: "PUT",
      body: JSON.stringify(carData),
    });
  },

  deleteCar: async (id: number): Promise<void> => {
    return apiClient(`/api/admin/cars/${id}`, {
      method: "DELETE",
    });
  },

  getBookings: async (): Promise<Booking[]> => {
    return apiClient<Booking[]>("/api/admin/bookings");
  },

  disputeBooking: async (id: number): Promise<void> => {
    return apiClient(`/api/admin/bookings/${id}/dispute`, {
      method: "POST",
    });
  },

  cancelBooking: async (id: number): Promise<void> => {
    return apiClient(`/api/admin/bookings/${id}/cancel`, {
      method: "POST",
    });
  },

  getUsers: async (): Promise<User[]> => {
    return apiClient<User[]>("/api/admin/users");
  },

  changePassword: async (passwordData: any): Promise<void> => {
    return apiClient("/api/admin/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  },

  getDiscounts: async (): Promise<any[]> => {
    return apiClient<any[]>("/api/admin/discounts");
  },

  createDiscount: async (discountData: any): Promise<any> => {
    return apiClient("/api/admin/discounts", {
      method: "POST",
      body: JSON.stringify(discountData),
    });
  },

  updateDiscount: async (id: number, discountData: any): Promise<any> => {
    return apiClient(`/api/admin/discounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(discountData),
    });
  },

  deleteDiscount: async (id: number): Promise<void> => {
    return apiClient(`/api/admin/discounts/${id}`, {
      method: "DELETE",
    });
  },

  getServices: async (): Promise<any[]> => {
    return apiClient<any[]>("/api/admin/services");
  },

  createService: async (serviceData: any): Promise<any> => {
    return apiClient("/api/admin/services", {
      method: "POST",
      body: JSON.stringify(serviceData),
    });
  },

  updateService: async (id: number, serviceData: any): Promise<any> => {
    return apiClient(`/api/admin/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(serviceData),
    });
  },

  deleteService: async (id: number): Promise<void> => {
    return apiClient(`/api/admin/services/${id}`, {
      method: "DELETE",
    });
  },

  updateSettings: async (settings: any): Promise<any> => {
    return apiClient("/api/admin/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  },

  uploadCarPhoto: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient<{ url: string }>("/api/admin/cars/upload", {
      method: "POST",
      body: formData,
    });
    return response.url;
  },
};
