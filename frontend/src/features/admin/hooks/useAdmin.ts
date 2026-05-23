
import { useState, useEffect, useCallback } from "react";
import { adminService } from "../services/admin.service";
import { DashboardStats, Booking, Discount, AdditionalService } from "../types";
import { Car } from "../../cars/types";
import { User } from "../../../store/auth.store";
import { handleApiError, handleApiSuccess } from "../../../shared/utils/errorHandler";

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

export function useAdminCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getCars();
      setCars(data);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const createCar = async (carData: any) => {
    try {
      await adminService.createCar(carData);
      handleApiSuccess("Car created successfully!");
      fetchCars();
      return true;
    } catch (err: any) {
      handleApiError(err);
      return false;
    }
  };

  const updateCar = async (id: number, carData: any) => {
    try {
      await adminService.updateCar(id, carData);
      handleApiSuccess("Car updated successfully!");
      fetchCars();
      return true;
    } catch (err: any) {
      handleApiError(err);
      return false;
    }
  };

  const deleteCar = async (id: number) => {
    try {
      await adminService.deleteCar(id);
      handleApiSuccess("Car deleted successfully!");
      fetchCars();
      return true;
    } catch (err: any) {
      handleApiError(err);
      return false;
    }
  };

  return { cars, loading, error, createCar, updateCar, deleteCar, refresh: fetchCars };
}

export function useAdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getBookings();
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

  const disputeBooking = async (id: number) => {
    try {
      await adminService.disputeBooking(id);
      handleApiSuccess("Booking disputed successfully!");
      fetchBookings();
      return true;
    } catch (err: any) {
      handleApiError(err);
      return false;
    }
  };

  const cancelBooking = async (id: number) => {
    try {
      await adminService.cancelBooking(id);
      handleApiSuccess("Booking cancelled successfully!");
      fetchBookings();
      return true;
    } catch (err: any) {
      handleApiError(err);
      return false;
    }
  };

  return { bookings, loading, error, refresh: fetchBookings, disputeBooking, cancelBooking };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refresh: fetchUsers };
}

export function useAdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDiscounts();
      setDiscounts(data);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const deleteDiscount = async (id: number) => {
    try {
      await adminService.deleteDiscount(id);
      handleApiSuccess("Discount deleted successfully!");
      fetchDiscounts();
      return true;
    } catch (err: any) {
      handleApiError(err);
      return false;
    }
  };

  return { discounts, loading, error, refresh: fetchDiscounts, deleteDiscount };
}

export function useAdminServices() {
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getServices();
      setServices(data);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const deleteService = async (id: number) => {
    try {
      await adminService.deleteService(id);
      handleApiSuccess("Service deleted successfully!");
      fetchServices();
      return true;
    } catch (err: any) {
      handleApiError(err);
      return false;
    }
  };

  return { services, loading, error, refresh: fetchServices, deleteService };
}
