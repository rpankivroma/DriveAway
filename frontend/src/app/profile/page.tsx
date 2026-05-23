"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User as UserIcon, Mail, Phone, MapPin, CreditCard, 
  History, LogOut, Plus, ShieldCheck, Trash2 
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserMe, AdditionalService } from "@/types";
import { apiClient } from "@/shared/api/client";
import CardModal from "@/components/profile/CardModal";
import EditProfileModal from "@/components/profile/EditProfileModal";
import BookingConfirmationModal from "@/components/bookings/BookingConfirmationModal";
import { bookingService } from "@/features/bookings/services/booking.service";
import { toast } from "sonner";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab");
  const activeTabValue = activeTabParam == "bookings" ? activeTabParam : "personal";
  const [activeTab, setActiveTab] = useState(activeTabValue);
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [services, setServices] = useState<AdditionalService[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const fetchUserData = async () => {
    try {
      const data = await apiClient<UserMe>("/api/users/me");
      setUser(data);
    } catch (error: any) {
      if (error.status !== 401) {
        console.error("Error fetching user data:", error);
      }
      // apiClient already handles logout for 401
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    fetchUserData();

    // Listen for auth changes
    window.addEventListener("auth-change", fetchUserData);
    return () => window.removeEventListener("auth-change", fetchUserData);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await apiClient<AdditionalService[]>('/api/services');
        setServices(data);
      } catch (error: any) {
        if (error.status !== 401) {
          console.error('Failed to load services', error);
        }
      }
    }
    fetchServices();
  }, []);

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      const response = await fetch(`/api/users/cards/${cardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        fetchUserData();
      }
    } catch (error: any) {
      if (error.status !== 401) {
        console.error("Error deleting card:", error);
      }
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingService.cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      fetchUserData();
    } catch (error: any) {
      toast.error(`Failed to cancel booking: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* PROFILE SIDEBAR */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-gray-50">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
            <p className="text-gray-500 text-sm mb-6">Member since {user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()}</p>
            <div className="flex justify-center gap-2">
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>
          </div>

          <nav className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-2">
            {[
              { id: "personal", icon: UserIcon, label: "Personal Info" },
              { id: "bookings", icon: History, label: "Booking History" },
              { id: "payment", icon: CreditCard, label: "Payment Methods" },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all",
                  activeTab === tab.id ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-50 hover:text-black"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1">
          {activeTab === "personal" && (
            <div className="space-y-8">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-8">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">{user?.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">{user?.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">{user?.phone || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Driver's License</label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <ShieldCheck className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">{user?.drivers_license || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">{user?.address || "Not provided"}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="mt-10 bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-900 transition-all"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Total Bookings", value: user?.stats.total_deals || 0, color: "blue" },
                  { label: "Active Rentals", value: user?.stats.active_deals || 0, color: "emerald" },
                  { label: "Reward Points", value: (user?.stats?.reward_points || 0).toLocaleString(), color: "purple" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500 font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-8">Booking History</h3>
              <div className="space-y-6">
                {user?.booking_history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-medium">No bookings found.</div>
                ) : (
                  user?.booking_history.map((b) => (
                    <div 
                      key={b.id} 
                      className={cn(
                        "flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 gap-4 transition-all",
                        b.status === "pending" && "cursor-pointer hover:border-blue-300 hover:bg-blue-50/30"
                      )}
                      onClick={() => {
                        if (b.status === "pending") {
                          setSelectedBooking(b);
                          setShowBookingModal(true);
                        }
                      }}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm overflow-hidden">
                          <img src={b.car_image} alt={b.car} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase mb-1">#{b.id}</div>
                          <h4 className="font-bold text-lg">{b.car}</h4>
                          <p className="text-sm text-gray-700">Period: {b.date}</p>
                          <p className="text-sm text-gray-700">Location: {b.location}</p>
                          <p className="text-sm text-gray-700">Services: {services.filter(service => b.additional_services.map((serv: string) => +serv).includes(service.id)).map(service => service.name).join(", ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-lg text-center font-bold">{b.price}</div>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                            b.status === 'pending' && "bg-gray-100 text-gray-700",
                            b.status === 'confirmed' && "bg-blue-100 text-blue-700",
                            b.status === 'active' && "bg-emerald-100 text-emerald-700",
                            b.status === 'completed' && "bg-green-100 text-green-700",
                            b.status === 'cancelled' && "bg-red-100 text-red-700",
                            b.status === 'disputed' && "bg-orange-100 text-orange-700"
                          )}>{b.status}</span>
                        </div>
                        
                        {["pending", "confirmed", "active"].includes(b.status) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelBooking(b.raw_id);
                            }}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-red-500 hover:bg-red-50 transition-all shadow-sm"
                            title="Cancel Booking"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">Payment Methods</h3>
                <button 
                  onClick={() => setShowCardModal(true)}
                  className="flex items-center gap-2 text-sm font-bold hover:underline"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user?.cards.map((card) => (
                  <div key={card.id} className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-12">
                        <CreditCard className="w-10 h-10 text-white/50" />
                        <button 
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-2xl font-mono tracking-[0.2em] mb-8">
                        {card.card_number.replace(/\d(?=\d{4})/g, "•")}
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[10px] uppercase opacity-50 font-bold mb-1">Card Holder</div>
                          <div className="font-bold tracking-wide">{user?.name?.toUpperCase()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase opacity-50 font-bold mb-1">Expires</div>
                          <div className="font-bold tracking-wide">{card.expires}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => setShowCardModal(true)}
                  className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-black hover:bg-gray-50 transition-all group min-h-[220px]"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-gray-500 group-hover:text-black">Add New Card</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CardModal 
        isOpen={showCardModal} 
        onClose={() => setShowCardModal(false)} 
        onSuccess={fetchUserData} 
      />

      {user && (
        <EditProfileModal 
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)} 
          onSuccess={fetchUserData} 
          user={user} 
        />
      )}

      {showBookingModal && selectedBooking && user && (
        <BookingConfirmationModal 
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          bookingId={selectedBooking.raw_id}
          totalPrice={selectedBooking.total_price}
          user={user}
          onSuccess={() => {
            setShowBookingModal(false);
            fetchUserData();
          }}
          onCancel={() => {
            setShowBookingModal(false);
            fetchUserData();
          }}
          onCardAdded={fetchUserData}
        />
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
