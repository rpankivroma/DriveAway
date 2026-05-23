"use client";

import { useState, useEffect } from "react";
import { X, Save, PlusCircle, LucideIcon, Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { AdditionalService } from "../types";
import { adminService } from "../services/admin.service";
import { Button } from "@/shared/ui/Button";
import { toast } from "sonner";

interface ServiceModalProps {
  service?: AdditionalService;
  onClose: () => void;
  onSave: () => void;
}

const COMMON_ICONS = ["Shield", "Wifi", "Coffee", "Map", "Users", "Music", "Wind", "Zap", "Star", "Heart", "Briefcase", "Baby"];

export function ServiceModal({ service, onClose, onSave }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    icon: "Shield",
    name: "",
    desc: "",
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (service) {
      setFormData({
        icon: service.icon,
        name: service.name,
        desc: service.desc || "",
        price: service.price
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (service) {
        await adminService.updateService(service.id, formData);
        toast.success("Service updated successfully");
      } else {
        await adminService.createService(formData);
        toast.success("Service created successfully");
      }
      onSave();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                {service ? "Edit Service" : "Add New Service"}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Icon</label>
              <div className="grid grid-cols-6 gap-2 p-4 bg-gray-50 rounded-2xl">
                {COMMON_ICONS.map((iconName) => {
                  const IconComponent = (LucideIcons as any)[iconName] as LucideIcon;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        formData.icon === iconName ? "bg-black text-white" : "bg-white text-gray-400 hover:text-black"
                      }`}
                    >
                      {IconComponent && <IconComponent className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Service Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-black transition-all font-bold" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</label>
              <textarea 
                rows={3}
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-black transition-all font-bold resize-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Price ($)</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                value={isNaN(formData.price) ? "" : formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value === "" ? NaN : parseFloat(e.target.value) })}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-black transition-all font-bold" 
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1 py-5 rounded-2xl font-black text-gray-400 hover:text-black transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 py-5 rounded-2xl font-black flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {service ? "Update Service" : "Save Service"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
