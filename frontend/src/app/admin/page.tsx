"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { 
  LayoutDashboard, Car, Calendar, Users, Settings, 
  DollarSign, Search, Plus, Pencil, Trash2,
  TrendingUp, PieChart, Save, HelpCircle, Lock, RefreshCw,
  Edit2, Eye, AlertCircle
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { cn } from "@/shared/utils/cn";
import { 
  useAdminDashboard, useAdminCars, useAdminBookings, useAdminUsers, useAdminDiscounts, useAdminServices,
  CarModal, CustomerDetailModal, ChangePasswordModal, SupportModal, DiscountModal, ServiceModal,
  Discount, AdditionalService
} from "@/features/admin";
import { Button } from "@/shared/ui/Button";
import { Car as CarType } from "@/features/cars/types";
import { User } from "@/features/users/types";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("adminDashboard");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);
  
  const { stats, loading: statsLoading, refresh: refreshStats } = useAdminDashboard();
  const { cars, loading: carsLoading, deleteCar, refresh: refreshCars } = useAdminCars();
  const { bookings, loading: bookingsLoading, refresh: refreshBookings, disputeBooking, cancelBooking } = useAdminBookings();
  const { users, loading: usersLoading, refresh: refreshUsers } = useAdminUsers();
  const { discounts, loading: discountsLoading, refresh: refreshDiscounts, deleteDiscount } = useAdminDiscounts();
  const { services, loading: servicesLoading, refresh: refreshServices, deleteService } = useAdminServices();

  const [fleetSearch, setFleetSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Modal states
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState<CarType | undefined>(undefined);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | undefined>(undefined);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<AdditionalService | undefined>(undefined);

  const loading = statsLoading || carsLoading || bookingsLoading || usersLoading || discountsLoading || servicesLoading;

  const handleRefreshAll = () => {
    refreshStats();
    refreshCars();
    refreshBookings();
    refreshUsers();
    refreshDiscounts();
    refreshServices();
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredFleet = cars.filter(car => 
    `${car.make} ${car.model}`.toLowerCase().includes(fleetSearch.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.id.toString().includes(bookingSearch);
    const matchesStatus = bookingStatus === "" || b.status === bookingStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = users.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <main className="container mx-auto px-6 max-w-7xl py-12">
      {/* MODALS */}
      {showCarModal && (
        <CarModal 
          car={editingCar} 
          onClose={() => { setShowCarModal(false); setEditingCar(undefined); }} 
          onSave={() => { setShowCarModal(false); setEditingCar(undefined); refreshCars(); }} 
        />
      )}
      {showCustomerModal && selectedCustomer && (
        <CustomerDetailModal 
          customer={selectedCustomer} 
          onClose={() => { setShowCustomerModal(false); setSelectedCustomer(null); }} 
        />
      )}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
      {showSupportModal && (
        <SupportModal onClose={() => setShowSupportModal(false)} />
      )}
      {showDiscountModal && (
        <DiscountModal 
          discount={selectedDiscount}
          onClose={() => { setShowDiscountModal(false); setSelectedDiscount(undefined); }} 
          onSave={() => { setShowDiscountModal(false); setSelectedDiscount(undefined); handleRefreshAll(); }} 
        />
      )}
      {showServiceModal && (
        <ServiceModal 
          service={selectedService}
          onClose={() => { setShowServiceModal(false); setSelectedService(undefined); }} 
          onSave={() => { setShowServiceModal(false); setSelectedService(undefined); handleRefreshAll(); }} 
        />
      )}

      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Control center for DriveAway operations</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-xs">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Live Operations
          </div>
        </div>
      </div>

      {/* ADMIN TABS */}
      <div className="bg-gray-100/50 p-1 rounded-xl inline-flex flex-wrap gap-1 mb-12 border border-gray-200">
        {[
          { id: "adminDashboard", icon: LayoutDashboard, label: "Overview" },
          { id: "adminFleet", icon: Car, label: "Fleet" },
          { id: "adminBookings", icon: Calendar, label: "Bookings" },
          { id: "adminCustomers", icon: Users, label: "Customers" },
          { id: "adminFeatures", icon: TrendingUp, label: "Features & Discounts" },
          { id: "adminSettings", icon: Settings, label: "Settings" },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2",
              activeTab === tab.id 
                ? "bg-white text-black shadow-sm border border-gray-200" 
                : "text-gray-500 hover:text-black hover:bg-white/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "adminDashboard" && stats && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Revenue", value: `$${(stats.total_revenue || 0).toLocaleString()}`, trend: "Live", icon: DollarSign, color: "blue" },
              { label: "Bookings", value: (stats.total_bookings || 0).toString(), trend: "Active", icon: Calendar, color: "green" },
              { label: "Fleet Size", value: (stats.total_cars || 0).toString(), trend: "Vehicles", icon: Car, color: "purple" },
              { label: "User Base", value: (stats.total_users || 0).toString(), trend: "Verified", icon: Users, color: "orange" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                    stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                    stat.color === "green" ? "bg-green-50 text-green-600" :
                    stat.color === "purple" ? "bg-purple-50 text-purple-600" :
                    "bg-orange-50 text-orange-600"
                  )}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {stat.trend}
                  </span>
                </div>
                <div className="text-3xl font-bold tracking-tight mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Growth Analytics
                </h3>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.revenue_trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '16px' }}
                      itemStyle={{ fontWeight: 600, fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="value" name="Revenue" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: 'white', strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold tracking-tight mb-8 flex items-center gap-3">
                <PieChart className="w-6 h-6 text-purple-600" />
                Fleet Mix
              </h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={stats.fleet_by_category}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="category"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '16px' }}
                    />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLEET TAB */}
      {activeTab === "adminFleet" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative flex-1 max-w-xl w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search fleet by make, model..." 
                value={fleetSearch}
                onChange={(e) => setFleetSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium shadow-sm focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCarModal(true)}
                className="bg-black text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </Button>
              <Button 
                variant="ghost"
                onClick={handleRefreshAll}
                className="p-2.5 rounded-lg text-gray-400 hover:text-black transition-colors"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFleet.length > 0 ? (
              filteredFleet.map((car) => (
                <div key={car.id} className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row gap-6 shadow-sm border border-gray-200 hover:shadow-md transition-all group">
                  <div className="w-full sm:w-48 h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={car.image_url || `https://picsum.photos/seed/${car.id}/800/600`} 
                      alt={car.model} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold tracking-tight">{car.make} {car.model}</h4>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{car.year} • {car.category}</div>
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        car.is_available ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      )}>
                        {car.is_available ? 'Available' : 'Rented'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xl font-bold tracking-tight">${car.price_per_day} <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">/ day</span></div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setEditingCar(car); setShowCarModal(true); }}
                          className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteCar(car.id)}
                          className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Car className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">No Vehicles Found</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  {fleetSearch ? "No vehicles match your search criteria." : "Your fleet is currently empty. Add your first vehicle to get started."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === "adminBookings" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative flex-1 max-w-xl w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by customer name or booking ID..." 
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium shadow-sm focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
            <select 
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value)}
              className="px-6 py-3 rounded-xl border border-gray-200 bg-white outline-none text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer hover:border-gray-300 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-gray-400">ID</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Customer</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Vehicle</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Dates</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="p-5 font-bold text-gray-400 text-sm">#{b.id}</td>
                        <td className="p-5">
                          <div className="font-bold text-sm">{b.customer_name || "Customer"}</div>
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-sm">{b.car_name || `Vehicle #${b.car_id}`}</div>
                        </td>
                        <td className="p-5 text-gray-500 font-medium text-xs">
                          {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
                        </td>
                        <td className="p-5 font-bold text-lg tracking-tight">${b.total_price}</td>
                        <td className="p-5">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                            b.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                            b.status === 'active' ? 'bg-blue-50 text-blue-600' :
                            b.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                            b.status === 'disputed' ? 'bg-orange-50 text-orange-600' :
                            'bg-gray-100 text-gray-500'
                          )}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex gap-2">
                            {["pending", "confirmed", "active"].includes(b.status) && (
                              <>
                                <button 
                                  onClick={() => {
                                    if (confirm("Dispute this booking?")) disputeBooking(b.id);
                                  }}
                                  className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                                  title="Dispute"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm("Cancel this booking?")) cancelBooking(b.id);
                                  }}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Cancel"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                          <Calendar className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                          {bookingSearch || bookingStatus ? "No bookings match your filters." : "You haven't received any bookings yet."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === "adminCustomers" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative max-w-xl w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search customers by name or email..." 
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium shadow-sm focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {c.name.charAt(0)}
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">Verified</span>
                  </div>
                  <h4 className="text-lg font-bold tracking-tight mb-1">{c.name}</h4>
                  <p className="text-xs text-gray-400 font-medium mb-8 truncate">{c.email}</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Role</span>
                      <span className="font-bold uppercase tracking-wider text-[10px]">{c.role}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Status</span>
                      <span className="font-bold text-emerald-600 text-[10px] uppercase tracking-wider">Active</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => { setSelectedCustomer(c); setShowCustomerModal(true); }}
                    className="w-full rounded-xl py-3 text-sm font-semibold"
                  >
                    View Details
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Users className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">No Customers Found</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  {customerSearch ? "No customers match your search criteria." : "You don't have any registered customers yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FEATURES & DISCOUNTS TAB */}
      {activeTab === "adminFeatures" && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Available Discounts</h2>
              </div>
              <Button 
                onClick={() => { setSelectedDiscount(undefined); setShowDiscountModal(true); }}
                className="bg-black text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Discount
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {discounts.map((d) => (
                <div key={d.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative group">
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setSelectedDiscount(d); setShowDiscountModal(true); }}
                      className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-black transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteDiscount(d.id)}
                      className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-4xl font-black text-blue-600 mb-6">{d.discount_percent}%</div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration Range</div>
                    <div className="text-lg font-black">{d.min_days} - {d.max_days} Days</div>
                  </div>
                </div>
              ))}
              {discounts.length === 0 && !discountsLoading && (
                <div className="col-span-full p-12 bg-gray-50 rounded-[32px] text-center">
                  <p className="text-gray-400 font-black">No discounts available yet.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Additional Services</h2>
              </div>
              <Button 
                onClick={() => { setSelectedService(undefined); setShowServiceModal(true); }}
                className="bg-black text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Service
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((s) => {
                const IconComponent = (LucideIcons as any)[s.icon] || HelpCircle;
                return (
                  <div key={s.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative group">
                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedService(s); setShowServiceModal(true); }}
                        className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-black transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteService(s.id)}
                        className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black mb-1">{s.name}</h4>
                    <p className="text-sm text-gray-400 font-bold mb-8">{s.desc}</p>
                    <div className="flex justify-between items-end">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</div>
                      <div className="text-2xl font-black">${s.price}</div>
                    </div>
                  </div>
                );
              })}
              {services.length === 0 && !servicesLoading && (
                <div className="col-span-full p-12 bg-gray-50 rounded-[32px] text-center">
                  <p className="text-gray-400 font-black">No services available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "adminSettings" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black">
                <Settings className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Business Information</h3>
            </div>
            
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
                  <div className="px-6 py-4 bg-gray-50 rounded-2xl font-black text-sm">Roman Pankiv</div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Email</label>
                  <div className="px-6 py-4 bg-gray-50 rounded-2xl font-black text-sm">pankiv.roma@gmail.com</div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Phone</label>
                  <div className="px-6 py-4 bg-gray-50 rounded-2xl font-black text-sm">+380952473114555555</div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Address</label>
                  <div className="px-6 py-4 bg-gray-50 rounded-2xl font-black text-sm">Lviv, Ukraine, 79003</div>
                </div>
              </div>
              
              <Button className="bg-black text-white rounded-2xl px-8 py-4 font-black flex items-center gap-2 h-auto">
                <Save className="w-5 h-5" /> Save Business Profile
              </Button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Security</h3>
              </div>
              <p className="text-sm text-gray-500 font-bold mb-8 leading-relaxed">
                Keep your admin account secure by regularly updating your password.
              </p>
              <Button 
                variant="outline"
                onClick={() => setShowPasswordModal(true)}
                className="w-full rounded-2xl py-4 font-black border-gray-100 hover:bg-gray-50 h-auto"
              >
                Change Admin Password
              </Button>
            </div>

            <div className="bg-black p-10 rounded-[32px] shadow-xl text-white">
              <h3 className="text-2xl font-black mb-4">Need Help?</h3>
              <p className="text-sm text-white/60 font-bold mb-8 leading-relaxed">
                If you encounter any issues with the admin panel or need technical assistance, please contact our support team.
              </p>
              <Button 
                onClick={() => setShowSupportModal(true)}
                className="w-full bg-white text-black hover:bg-gray-100 rounded-2xl py-4 font-black h-auto"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
