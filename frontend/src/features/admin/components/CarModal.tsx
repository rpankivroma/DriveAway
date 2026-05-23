"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Trash2, Camera, Loader2 } from "lucide-react";
import { Car } from "@/features/cars/types";
import { adminService } from "../services/admin.service";
import { Button } from "@/shared/ui/Button";
import { toast } from "sonner";

interface CarModalProps {
  car?: Car;
  onClose: () => void;
  onSave: () => void;
}

export function CarModal({ car, onClose, onSave }: CarModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<any>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    category: "Standard",
    license_plate: "",
    color: "",
    passengers: 5,
    luggage: 2,
    transmission: "automatic",
    fuel_type: "gasoline",
    features: "",
    description: "",
    image_url: "",
    price_per_day: 0,
    is_available: true
  });

  useEffect(() => {
    if (car) {
      setFormData({
        make: car.make || "",
        model: car.model || "",
        year: car.year || new Date().getFullYear(),
        category: car.category || "Standard",
        license_plate: car.license_plate || "",
        color: car.color || "",
        passengers: car.passengers || 5,
        luggage: car.luggage || 2,
        transmission: car.transmission || "automatic",
        fuel_type: car.fuel_type || "gasoline",
        features: Array.isArray(car.features) ? car.features.join(", ") : car.features || "",
        description: car.description || "",
        image_url: car.image_url || "",
        price_per_day: car.price_per_day || 0,
        is_available: car.is_available ?? true
      });
    }
  }, [car]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const url = await adminService.uploadCarPhoto(file);
      setFormData((prev: any) => ({ ...prev, image_url: url }));
      toast.success("Photo uploaded successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const dataToSave = {
        brand: formData.make,
        model: formData.model,
        year: formData.year,
        category: formData.category,
        license_plate: formData.license_plate,
        color: formData.color,
        passengers: formData.passengers,
        luggage: formData.luggage,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        features: formData.features.split(",").map((f: string) => f.trim()).filter(Boolean),
        description: formData.description,
        images: formData.image_url,
        price_per_day: formData.price_per_day,
        status: formData.is_available ? "available" : "inactive"
      };

      if (car) {
        await adminService.updateCar(car.id, dataToSave);
        toast.success("Vehicle updated successfully");
      } else {
        await adminService.createCar(dataToSave);
        toast.success("Vehicle created successfully");
      }

      onSave();
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to save car");
      toast.error(err.message || "Failed to save car");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-black tracking-tight">
            {car ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">
              {typeof error === 'string' ? error : (
                <ul className="list-disc list-inside">
                  {Array.isArray(error) ? (error as any[]).map((err, i) => (
                    <li key={i}>{err.msg || JSON.stringify(err)}</li>
                  )) : JSON.stringify(error)}
                </ul>
              )}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700">Vehicle Photo</label>
            <div className="flex flex-col gap-4">
              {formData.image_url && (
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-gray-100 border border-gray-100">
                  <img src={formData.image_url} alt="Car preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, image_url: "" })}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-lg"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-2xl font-bold hover:border-black hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                  {uploading ? "Uploading..." : "Upload Physical Photo"}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Or provide Image URL</label>
                <input 
                  type="text" 
                  name="image_url" 
                  value={formData.image_url} 
                  onChange={handleChange} 
                  placeholder="https://..." 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Make</label>
              <input type="text" name="make" value={formData.make} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Model</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Year</label>
              <input type="number" name="year" value={isNaN(formData.year as number) ? "" : formData.year} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">License Plate</label>
              <input type="text" name="license_plate" value={formData.license_plate} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Color</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5">
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Sports">Sports</option>
                <option value="Electric">Electric</option>
                <option value="Compact">Compact</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Price Per Day ($)</label>
              <input type="number" name="price_per_day" value={isNaN(formData.price_per_day as number) ? "" : formData.price_per_day} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Transmission</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5">
                <option value="automatic">Automatic</option>
                <option value="mechanic">Mechanic</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Fuel Type</label>
              <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5">
                <option value="gasoline">Gasoline</option>
                <option value="gas">Gas</option>
                <option value="electricity">Electricity</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Passengers</label>
              <input type="number" name="passengers" value={isNaN(formData.passengers as number) ? "" : formData.passengers} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Luggage</label>
              <input type="number" name="luggage" value={isNaN(formData.luggage as number) ? "" : formData.luggage} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Status</label>
              <select 
                name="is_available" 
                value={formData.is_available ? "true" : "false"} 
                onChange={(e) => setFormData({ ...formData, is_available: e.target.value === "true" })} 
                className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5"
              >
                <option value="true">Available</option>
                <option value="false">Rented / Maintenance</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Features (comma separated)</label>
            <input type="text" name="features" value={formData.features} onChange={handleChange} placeholder="GPS, Bluetooth, Leather Seats..." className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5 resize-none" />
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white z-10">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-4 rounded-2xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? "Saving..." : "Save Vehicle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
