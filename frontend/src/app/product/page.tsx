"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Star, Users, Briefcase, Gauge, Fuel,
  Check, Shield, Navigation, Baby, Wifi, MapPin,
  Calendar, Clock
} from "lucide-react";
import type { AdditionalService, Discount } from "@/types";
import type { Car } from "@/features/cars/types";
import { bookingService } from "@/features/bookings/services/booking.service";
import type { CreateBookingRequest } from "@/features/bookings/types";
import BookingConfirmationModal from "@/components/bookings/BookingConfirmationModal";
import { UserMe } from "@/types";
import { useAuthStore } from "@/store/auth.store";

import { apiClient } from "@/shared/api/client";
import { toast } from "sonner";

function ProductPageFallback() {
  return (
    <main className="container mx-auto px-4 max-w-7xl py-8">
      <p className="text-gray-600">Loading car details...</p>
    </main>
  );
}

function ProductPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carIdParam = searchParams.get("id");
  const carId = carIdParam ? Number(carIdParam) : NaN;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [services, setServices] = useState<AdditionalService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [pickUpLocation, setPickUpLocation] = useState('Kyiv');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(true);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);
  const [fullUser, setFullUser] = useState<UserMe | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      apiClient<UserMe>("/api/users/me")
        .then(data => setFullUser(data))
        .catch(err => {
          // Silent fail for 401 as apiClient handles logout
          if (err.status !== 401) {
            console.error("Failed to fetch user profile", err);
          }
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!Number.isInteger(carId) || carId <= 0) {
      setLoading(false);
      setError("Invalid car ID in URL.");
      return;
    }

    const controller = new AbortController();

    async function loadCar() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/cars/${carId}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Car not found.");
          }
          throw new Error("Failed to load car details.");
        }

        const payload: Car = await response.json();
        setCar(payload);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "Unexpected error.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadCar();
    return () => controller.abort();
  }, [carId]);

  useEffect(() => {
    async function fetchServices() {
      try {
        setServicesLoading(true);
        setServicesError(null);
        const data = await apiClient<AdditionalService[]>('/api/services');
        setServices(data);
      } catch (err: any) {
        setServicesError(err.message);
      } finally {
        setServicesLoading(false);
      }
    }
    fetchServices();
  }, []);

  useEffect(() => {
    async function fetchDiscounts() {
      try {
        setDiscountsLoading(true);
        const data = await apiClient<Discount[]>('/api/discounts');
        setDiscounts(data);
      } catch (err: any) {
        if (err.status !== 401) {
          console.error('Error fetching discounts:', err);
        }
      } finally {
        setDiscountsLoading(false);
      }
    }
    fetchDiscounts();
  }, []);

  const iconMap: Record<string, React.ComponentType<any>> = {
    Shield,
    Navigation,
    Baby,
    Wifi
  };

  function getIconComponent(iconName: string) {
    return iconMap[iconName] || Check; // Fallback to Check icon
  }

  const featureList = useMemo(() => {
    if (!car?.features) return [];
    if (Array.isArray(car.features)) return car.features;
    return String(car.features)
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean);
  }, [car]);

  const pickUpLocations = ["Kyiv", "Lviv", "Odesa"];

  function PickUpDateInputField({ date, setDate }: { date: string; setDate: (date: string) => void }) {
    // Formats to 'YYYY-MM-DD'
    const today = new Date().toISOString().slice(0, 10);

    return (
      <input 
        type="date"
        value={date}
        min={today}
        onChange={(e) => setDate(e.target.value)} 
        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm"
      />
    );
  }

  function ReturnDateInputField({ date, setDate, pickUpDate }: { date: string; setDate: (date: string) => void; pickUpDate: string }) {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      // Validation: ensure return date is always after pick-up date
      if (newDate > pickUpDate) {
        setDate(newDate);
      }
    };

    return (
      <input 
        type="date"
        value={date} 
        onChange={handleDateChange}
        min={pickUpDate}
        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm"
      />
    );
  }

  // Date state management
  const todayDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const tomorrowDate = useMemo(() => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10), []);
  const [pickUpDate, setPickUpDate] = useState(todayDate);
  const [returnDate, setReturnDate] = useState(tomorrowDate);
  
  // Calculate number of days between pick-up and return dates
  const daysNumber = useMemo(() => {
    const pickUp = new Date(pickUpDate);
    const returnDateObj = new Date(returnDate);
    const diffInTime = returnDateObj.getTime() - pickUp.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
    return Math.max(1, diffInDays); // at least 1 day
  }, [pickUpDate, returnDate]);

  const additionalServicesPrice = useMemo(() => {
    let total = 0;
    for (let service of services) {
      if (selectedServices.includes(service.id)) {
        total += Number(service.price) * daysNumber;
      }
    }
    return total;
  }, [services, selectedServices, daysNumber]);

  const totalPriceWithoutDiscounts = useMemo(() => {
    let total = Number(car?.price_per_day || 0) * daysNumber + additionalServicesPrice;
    return total;
  }, [car, daysNumber, additionalServicesPrice]);

  const discountAmount = useMemo(() => {
    const applicableDiscounts = discounts.filter(d => d.min_days <= daysNumber && (d.max_days === null || daysNumber <= d.max_days));
    if (applicableDiscounts.length === 0) return 0;
    
    // Find highest discount percentage
    const maxDiscount = Math.max(...applicableDiscounts.map(d => d.discount_percent));
    return (totalPriceWithoutDiscounts * maxDiscount) / 100;
  }, [discounts, daysNumber, totalPriceWithoutDiscounts]);

  const capitalizeText = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 max-w-7xl py-8">
        <p className="text-gray-600">Loading car details...</p>
      </main>
    );
  }

  if (error || !car) {
    return (
      <main className="container mx-auto px-4 max-w-7xl py-8">
        <div className="mb-6">
          <Link href="/" className="text-gray-600 flex items-center gap-2 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to All Cars
          </Link>
        </div>
        <p className="text-red-600 font-medium">{error ?? "Car not found."}</p>
      </main>
    );
  }

  const carTitle = `${car.make} ${car.model}`;
  const formattedPrice = Number(car.price_per_day).toFixed(2);

  const handleBookNow = async () => {
    console.log("Book Now clicked. isAuthenticated:", isAuthenticated);
    console.log("Auth Store State:", useAuthStore.getState());
    
    if (!isAuthenticated) {
      toast.error("Please login to book a car");
      return;
    }
    
    setBookingLoading(true);
    const bookingData: CreateBookingRequest = {
      car_id: carId,
      start_time: pickUpDate,
      end_time: returnDate,
      pick_up_location: pickUpLocation,
      additional_services: selectedServices,
    };

    try {
      const response = await bookingService.createBooking(bookingData);
      setPendingBookingId(response.id);
      setShowBookingModal(true);
    } catch (error: any) {
      toast.error(`Booking failed: ${error?.message || 'An unknown error occurred.'}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCardAdded = async () => {
    try {
      const data = await apiClient<UserMe>("/api/users/me");
      setFullUser(data);
    } catch (err: any) {
      if (err.status !== 401) {
        console.error("Failed to refresh user profile", err);
      }
    }
  };

  return (
    <main className="container mx-auto px-4 max-w-7xl py-8">
      {/* BREADCRUMB */}
      <div className="mb-6">
        <Link href="/" className="text-gray-600 flex items-center gap-2 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to All Cars
        </Link>
      </div>

      <div className="product-layout grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        {/* LEFT COLUMN */}
        <div className="product-main">
          {/* MAIN IMAGE */}
          <div className="car-hero-image mb-8">
            <img
              src={car.image_url || `https://picsum.photos/seed/${car.id}/800/600`}
              alt={carTitle}
              className="rounded-2xl w-full shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* CAR INFO HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            <div>
              <span className="bg-gray-800 text-white px-3 py-1 rounded-md text-xs font-semibold">
                {car.is_available ? "Available" : "Rented"}
              </span>
              <h1 className="text-4xl font-bold mt-2">{carTitle}</h1>
              <div className="flex items-center gap-2 mt-2 text-yellow-500">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">(4.8 rating • 127 reviews)</span>
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-3xl font-bold">${formattedPrice}</div>
              <div className="text-gray-500">per day</div>
            </div>
          </div>

          <hr className="mb-8 border-gray-200" />

          {/* DESCRIPTION */}
          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed">
              {car.description || "No description available for this car yet."}
            </p>
          </div>

          {/* SPECS GRID */}
          <div className="specs-grid grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Users, label: "Passengers", value: String(car.passengers) },
              { icon: Briefcase, label: "Luggage", value: `${car.luggage} Bags` },
              { icon: Gauge, label: "Transmission", value: capitalizeText(car.transmission) },
              { icon: Fuel, label: "Fuel Type", value: capitalizeText(car.fuel_type) },
            ].map((spec, i) => (
              <div key={i} className="spec-item bg-white p-4 rounded-xl flex items-center gap-3 border border-gray-100">
                <spec.icon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-500">{spec.label}</div>
                  <div className="font-semibold">{spec.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* FEATURES */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-6">Features & Amenities</h3>
            <div className="features-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featureList.length > 0 ? (
                featureList.map((feature, i) => (
                  <div key={i} className="feature-item flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" /> {feature}
                  </div>
                ))
              ) : (
                <div className="feature-item text-sm text-gray-500">No feature details available.</div>
              )}
            </div>
          </div>

          {/* ADDITIONAL SERVICES */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-6">Additional Services</h3>
            <div className="services-list flex flex-col gap-4">
              {servicesLoading ? (
                <p className="text-gray-600">Loading services...</p>
              ) : servicesError ? (
                <p className="text-red-600">Failed to load services: {servicesError}</p>
              ) : services.length > 0 ? (
                services.map((service) => {
                  const IconComponent = getIconComponent(service.icon);
                  return (
                    <label key={service.id} className="service-card cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="hidden peer"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices(prev => [...prev, service.id]);
                          } else {
                            setSelectedServices(prev => prev.filter(id => id !== service.id));
                          }
                        }}
                      />
                      <div className="service-content bg-white border border-gray-200 rounded-xl p-5 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50 group-hover:border-gray-300">
                        <div className="flex items-center gap-4">
                          <div className="checkbox-custom w-5 h-5 border-2 border-gray-300 rounded relative peer-checked:bg-blue-600 peer-checked:border-blue-600">
                            {/* Custom checkmark handled by peer-checked in CSS or just use a lucide icon if easier */}
                          </div>
                          <IconComponent className="w-6 h-6 text-gray-700" />
                          <div className="flex-1">
                            <div className="font-bold">{service.name}</div>
                            <div className="text-sm text-gray-500">{service.desc || "No description available"}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${service.price}</div>
                            <div className="text-xs text-gray-500">per day</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })
              ) : (
                <p className="text-gray-500">No additional services available.</p>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR BOOKING */}
        <div className="product-sidebar lg:order-last order-first">
          <div className="booking-card bg-white p-8 rounded-2xl shadow-md sticky top-24">
            <h3 className="text-lg font-bold mb-6">Book This Car</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Pick-up Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select 
                    value={pickUpLocation}
                    onChange={(e) => setPickUpLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm"
                  >
                    {pickUpLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Pick-up Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <PickUpDateInputField date={pickUpDate} setDate={setPickUpDate} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Return Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <ReturnDateInputField date={returnDate} setDate={setReturnDate} pickUpDate={pickUpDate} />
                </div>
              </div>
            </div>

            <hr className="mb-6 border-gray-100" />

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>${formattedPrice} × {daysNumber} day{daysNumber > 1 ? 's' : ''}</span>
                <span>${(Number(formattedPrice) * daysNumber).toFixed(2)}</span>
              </div>
              
              {selectedServices.length > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Additional Services:</span>
                  <span>
                    ${additionalServicesPrice.toFixed(2)}
                  </span>
                </div>
              )}

              { discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">
                  ${(totalPriceWithoutDiscounts - discountAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {!discountsLoading && discounts.length > 0 && (
              <div className="discount-box bg-blue-50 rounded-xl p-4 mb-6">
                <div className="font-semibold mb-2 text-sm">Available Discounts:</div>
                <ul className="text-xs text-gray-500 space-y-1">
                  {discounts.map((d) => {
                    const range = d.max_days
                      ? `${d.min_days}-${d.max_days} days`
                      : `${d.min_days}+ days`;
                    return (
                      <li key={d.id}>
                        • {d.discount_percent}% off for {range}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <button 
              onClick={handleBookNow}
              disabled={bookingLoading}
              className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {bookingLoading ? 'Booking...' : 'Book Now'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Free cancellation up to 48 hours before pick-up
            </p>
          </div>
        </div>
      </div>

      {showBookingModal && pendingBookingId && fullUser && (
        <BookingConfirmationModal 
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          bookingId={pendingBookingId}
          totalPrice={totalPriceWithoutDiscounts - discountAmount}
          user={fullUser}
          onSuccess={() => {
            setShowBookingModal(false);
            router.push('/profile?tab=bookings');
          }}
          onCancel={() => {
            setShowBookingModal(false);
            router.push('/profile?tab=bookings');
          }}
          onCardAdded={handleCardAdded}
        />
      )}
    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<ProductPageFallback />}>
      <ProductPageContent />
    </Suspense>
  );
}