
import React, { useState, useEffect } from "react";
import { X, CreditCard, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, UserMe } from "@/types";
import { bookingService } from "@/features/bookings/services/booking.service";
import CardModal from "../profile/CardModal";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  totalPrice: number;
  user: UserMe;
  onSuccess: () => void;
  onCancel: () => void;
  onCardAdded: () => void;
}

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  totalPrice,
  user,
  onSuccess,
  onCancel,
  onCardAdded
}) => {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(
    (user?.cards?.length ?? 0) > 0 ? user.cards[0].id : null
  );
  
  useEffect(() => {
    if (!selectedCardId && (user?.cards?.length ?? 0) > 0) {
      setSelectedCardId(user.cards[0].id);
    }
  }, [user?.cards, selectedCardId]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePay = async () => {
    if (!selectedCardId) return;
    setIsProcessing(true);
    setError(null);
    try {
      await bookingService.confirmBooking(bookingId);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      await bookingService.cancelBooking(bookingId);
      onCancel();
    } catch (err: any) {
      if (err.status !== 401) {
        console.error("Failed to cancel booking", err);
      }
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold">Booking Confirmation</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Time remaining to pay</span>
            </div>
            <span className="text-lg font-bold text-blue-600 font-mono">{formatTime(timeLeft)}</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Select Payment Method</h3>
              <button 
                onClick={() => setShowAddCard(true)}
                className="text-sm text-blue-600 font-bold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>

            {(user?.cards?.length ?? 0) > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {user.cards.map((card) => (
                  <label 
                    key={card.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedCardId === card.id 
                        ? "border-blue-600 bg-blue-50" 
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">•••• •••• •••• {card.card_number.slice(-4)}</div>
                        <div className="text-xs text-gray-500">Expires {card.expires}</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      className="hidden" 
                      checked={selectedCardId === card.id}
                      onChange={() => setSelectedCardId(card.id)}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedCardId === card.id ? "border-blue-600 bg-blue-600" : "border-gray-300"
                    }`}>
                      {selectedCardId === card.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No payment methods found</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleCancel}
                disabled={isProcessing}
                className="py-4 rounded-2xl font-bold border-2 border-gray-100 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handlePay}
                disabled={!selectedCardId || isProcessing}
                className="py-4 rounded-2xl font-bold bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50 shadow-lg shadow-black/10"
              >
                {isProcessing ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CardModal 
        isOpen={showAddCard} 
        onClose={() => setShowAddCard(false)} 
        onSuccess={() => {
          setShowAddCard(false);
          onCardAdded();
        }} 
      />
    </div>
  );
};

export default BookingConfirmationModal;
