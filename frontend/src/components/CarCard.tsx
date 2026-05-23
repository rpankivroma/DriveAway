"use client";

import { useRouter } from "next/navigation";
import { Car } from "@/types";

export default function CarCard({ car }: { car: Car }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-100">
      <div className="relative h-52 overflow-hidden">
        <img 
          src={car.image || car.images || "https://picsum.photos/seed/car/800/600"} 
          alt={`${car.brand} ${car.model}`} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-3 py-1 rounded-full text-[10px] text-white font-bold shadow-sm uppercase tracking-wider">
          {car.category || "Standard"}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm capitalize">
          {car.fuel_type}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{car.brand} {car.model}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">{car.passengers} Seats</span>
              <span className="flex items-center gap-1 capitalize">{car.transmission}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-black">${car.price_per_day}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">per day</div>
          </div>
        </div>
        <button 
          onClick={() => router.push(`/product?id=${car.id}`)}
          className="w-full bg-black text-white py-3.5 rounded-2xl font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
        >
          Rent Now
        </button>
      </div>
    </div>
  );
}
