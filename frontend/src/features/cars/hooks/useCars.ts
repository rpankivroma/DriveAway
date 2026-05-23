
import { useState, useEffect, useCallback, useRef } from "react";
import { carService } from "../services/car.service";
import { Car, CarFilters } from "../types";
import { handleApiError } from "../../../shared/utils/errorHandler";

export function useCars(initialFilters: CarFilters = {}) {
  const [cars, setCars] = useState<Car[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CarFilters>(initialFilters);
  
  const appendRef = useRef(false);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Capture the current value of appendRef and reset it
    const isAppend = appendRef.current;
    appendRef.current = false;

    try {
      const data = await carService.getCars(filters);
      if (isAppend) {
        setCars((prev) => {
          const existingIds = new Set(prev.map(c => c.id));
          const newItems = data.items.filter(c => !existingIds.has(c.id));
          return [...prev, ...newItems];
        });
      } else {
        setCars(data.items);
      }
      setTotalPages(data.total_pages);
      setTotalItems(data.total_items);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const updateFilters = (newFilters: Partial<CarFilters>, append = false) => {
    appendRef.current = append;
    setFilters((prev) => {
      // If we are changing something other than the page, we should probably NOT append
      const isOnlyPageChanging = Object.keys(newFilters).length === 1 && "page" in newFilters;
      if (!isOnlyPageChanging && !append) {
        // Reset to page 1 if filters change
        return { ...prev, ...newFilters, page: 1 };
      }
      return { ...prev, ...newFilters };
    });
  };

  const resetFilters = () => {
    appendRef.current = false;
    setFilters(initialFilters);
  };

  const setPage = (page: number, append = false) => {
    updateFilters({ page }, append);
  };

  const loadMore = () => {
    const nextPage = (filters.page || 1) + 1;
    if (nextPage <= totalPages) {
      setPage(nextPage, true);
    }
  };

  return {
    cars,
    totalPages,
    totalItems,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    setPage,
    loadMore,
    refresh: fetchCars,
  };
}

export function useCarDetails(id: number) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await carService.getCarById(id);
        setCar(data);
      } catch (err: any) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCar();
  }, [id]);

  return { car, loading, error };
}
