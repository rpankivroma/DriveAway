
"use client";

import { useState } from "react";
import { X, Key } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface VerifyEmailModalProps {
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VerifyEmailModal({ email, onClose, onSuccess }: VerifyEmailModalProps) {
  const [code, setCode] = useState("");
  const { verifyEmail, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyEmail(email, code);
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight mb-2">Verify Email</h2>
            <p className="text-gray-500">Enter the verification code sent to {email}</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl mb-6 text-sm font-bold bg-red-50 text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Verification Code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-black transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
