"use client";

import { useState } from "react";
import { useCars, CarCard } from "@/features/cars";
import Filter, { FiltersState } from "@/components/catalog/Filter";
import Sort from "@/components/catalog/Sort";
import { Button } from "@/shared/ui/Button";
import { Pagination } from "@/shared/ui/Pagination";
import { Search, MapPin, Calendar } from "lucide-react";

export default function Home() {
  const { cars, totalPages, totalItems, loading, filters, updateFilters, setPage, resetFilters, loadMore } = useCars({ 
    sort: "recommended",
    page: 1,
    page_size: 6
  });
  
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [filterKey, setFilterKey] = useState(0);

  const handleFilterChange = (newFilters: FiltersState) => {
    updateFilters({
      min_price: newFilters.priceRange[0],
      max_price: newFilters.priceRange[1],
      transmission: newFilters.transmission.join(","),
      fuel_type: newFilters.fuel_type.join(","),
      passengers: newFilters.passengers.join(","),
      category: newFilters.category.join(","),
      luggage: newFilters.luggage.join(","),
      features: newFilters.features.join(","),
    });
  };

  const handleSearch = () => {
    updateFilters({ search: location });
  };

  const handleSortChange = (newSort: string) => {
    updateFilters({ sort: newSort });
  };

  const handleClearFilters = () => {
    resetFilters();
    setLocation("");
    setPickupDate("");
    setReturnDate("");
    setFilterKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative min-h-[700px] py-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1920" 
            alt="Driving background" 
            className="w-full h-full object-cover brightness-[0.4]"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4 drop-shadow-2xl">
            Your Journey Starts Here
          </h1>
          <p className="text-xl text-white/90 mb-12 font-medium">
            Premium car rentals for every destination
          </p>
          
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-[32px] shadow-2xl flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 w-full text-left space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pick-up Location</label>
              <div className="flex items-center px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-black transition-all">
                <input
                  type="text"
                  placeholder="City, Airport, or Ad"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent text-gray-900 outline-none w-full font-bold placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="flex-1 w-full text-left space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pick-up Date</label>
              <div className="flex items-center px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-black transition-all">
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="bg-transparent text-gray-900 outline-none w-full font-bold uppercase text-xs"
                />
                <Calendar className="w-4 h-4 text-gray-400 ml-2" />
              </div>
            </div>

            <div className="flex-1 w-full text-left space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Return Date</label>
              <div className="flex items-center px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-black transition-all">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="bg-transparent text-gray-900 outline-none w-full font-bold uppercase text-xs"
                />
                <Calendar className="w-4 h-4 text-gray-400 ml-2" />
              </div>
            </div>

            <Button 
              onClick={handleSearch}
              className="w-full md:w-auto bg-black hover:bg-gray-800 text-white px-10 py-5 rounded-2xl font-black transition-all h-[54px]"
            >
              Search Cars
            </Button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR FILTERS */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide flex flex-col">
              <h2 className="text-xl font-black text-gray-900 mb-8">Filters</h2>
              
              <div className="flex-1">
                <Filter key={filterKey} onFilterChange={handleFilterChange} />
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center">
                <Button 
                  variant="ghost" 
                  onClick={handleClearFilters}
                  className="text-gray-400 hover:text-black font-black text-sm"
                >
                  Clear all filters
                </Button>
              </div>
            </div>
          </aside>

          {/* CAR GRID */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-black text-gray-900">
                  {loading && cars.length === 0 ? "Loading..." : `${totalItems} Vehicles Available`}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500">Sort by:</span>
                <Sort onSortChange={handleSortChange} currentSort={filters.sort || "recommended"} />
              </div>
            </div>

            {loading && cars.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                   <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : cars.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
                
                <div className="flex flex-col items-center gap-8 mt-12">
                  {(filters.page || 1) < totalPages && (
                    <Button 
                      variant="secondary" 
                      onClick={loadMore}
                      loading={loading}
                      className="px-12 py-4 rounded-2xl font-black"
                    >
                      Show More
                    </Button>
                  )}
                  
                  <Pagination 
                    currentPage={filters.page || 1}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white py-20 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No cars found</h3>
                <p className="text-gray-500 mb-8">Try adjusting your filters to find what you're looking for.</p>
                <div className="flex justify-center w-full">
                  <Button variant="outline" onClick={handleClearFilters} className="mx-auto">
                    Clear all filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
