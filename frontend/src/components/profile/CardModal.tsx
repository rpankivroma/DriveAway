"use client";

import { useState } from "react";
import { X, CreditCard } from "lucide-react";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CardModal({ isOpen, onClose, onSuccess }: CardModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expires, setExpires] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (!/^\d{16}$/.test(cleanCardNumber)) {
      setError("Card number must be exactly 16 digits");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          card_number: cleanCardNumber,
          expires: expires,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to add card");
      }

      onSuccess();
      onClose();
      setCardNumber("");
      setExpires("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-10">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-black mb-2">Add New Card</h2>
          <p className="text-gray-500 mb-8 font-medium">Enter your card details securely.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Card Number</label>
              <input
                type="text"
                required
                placeholder="0000 0000 0000 0000"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-mono"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Expiration Date</label>
              <input
                type="text"
                required
                placeholder="MM/YY"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-mono"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-900 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Card"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
