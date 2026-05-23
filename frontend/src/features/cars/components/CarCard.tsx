
"use client";

import { Car } from "../types";
import { Users, Fuel, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../shared/ui/Button";

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <div className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={car.image_url || `https://picsum.photos/seed/${car.id}/800/600`}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
            {car.category || "Standard"}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-gray-100">
            {car.fuel_type}
          </span>
        </div>

        {!car.is_available && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em]">
              Rented
            </span>
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-black text-gray-900 leading-tight line-clamp-1">
              {car.make} {car.model} {car.category}
            </h3>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold">{car.passengers} Seats</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Settings className="w-4 h-4" />
                <span className="text-xs font-bold capitalize">{car.transmission}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gray-900">${car.price_per_day}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Per Day</div>
          </div>
        </div>

        <div className="mt-auto">
          <Link href={`/product?id=${car.id}`} className="block w-full">
            <Button 
              className="w-full py-4 rounded-2xl bg-black hover:bg-gray-800 text-white font-black transition-all"
              disabled={!car.is_available}
            >
              {car.is_available ? "Rent Now" : "Details"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
