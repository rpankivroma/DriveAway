"use client";

import { X, Mail, Phone, MapPin, FileText, Calendar, DollarSign } from "lucide-react";
import { User } from "@/features/users/types";
import { Button } from "@/shared/ui/Button";

interface CustomerDetailModalProps {
  customer: User;
  onClose: () => void;
}

export function CustomerDetailModal({ customer, onClose }: CustomerDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="p-10 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-3xl font-black tracking-tight">Customer Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="p-10 overflow-y-auto space-y-12">
          {/* Header Info */}
          <div className="flex gap-10 items-start">
            <div className="w-32 h-32 bg-black rounded-[40px] flex items-center justify-center text-white text-5xl font-black shadow-xl">
              {customer.name.charAt(0)}
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-4xl font-black mb-4">{customer.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-gray-400 font-bold">
                  <Mail className="w-5 h-5" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 font-bold">
                  <Phone className="w-5 h-5" />
                  <span>{customer.phone || "0952473114"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 font-bold">
                  <Calendar className="w-5 h-5" />
                  <span>Member since {new Date(customer.created_at || "2026-03-22").toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100/50">
              <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Bookings</div>
              <div className="text-4xl font-black">0</div>
            </div>
            <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100/50">
              <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Spent</div>
              <div className="text-4xl font-black text-emerald-500">$0</div>
            </div>
            <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100/50">
              <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Reward Points</div>
              <div className="text-4xl font-black text-blue-600">0</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-8">
              <h4 className="font-black text-2xl">Personal Information</h4>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Address</div>
                    <div className="font-black text-gray-900">17 вулиця Академіка Гнатюка</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Driver's License</div>
                    <div className="font-black text-gray-900">AA12345678</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="font-black text-2xl">Payment Methods</h4>
              <div className="p-6 bg-white border border-gray-100 rounded-[32px] flex items-center gap-6 shadow-sm">
                <div className="w-16 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                  💵
                </div>
                <div>
                  <div className="font-black text-lg">Visa ending in 4242</div>
                  <div className="text-sm text-gray-400 font-bold">Expires 12/26</div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div className="space-y-6">
            <h4 className="font-black text-2xl">Booking History</h4>
            <div className="bg-gray-50/30 rounded-[32px] border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking ID</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehicle</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dates</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="text-gray-400 font-black text-lg">No bookings found</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
