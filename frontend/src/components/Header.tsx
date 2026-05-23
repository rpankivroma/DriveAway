"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Car } from "lucide-react";
import AuthModal from "./AuthModal";
import { useAuthStore } from "@/store/auth.store";

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [localShowAuthModal, setLocalShowAuthModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Sync store with localStorage on mount if needed
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser && !isAuthenticated) {
      try {
        setAuth(JSON.parse(storedUser), storedToken);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }

    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        try {
          setAuth(JSON.parse(userData), token);
        } catch (e) {
          console.error("Failed to parse user data on auth-change", e);
        }
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [isAuthenticated, setAuth]);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  // Avoid hydration mismatch by not rendering auth-dependent UI until mounted
  const authContent = mounted && isAuthenticated ? (
    <div className="flex items-center gap-4">
      {user?.role === "admin" ? (
        <Link 
          href="/admin" 
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition-colors"
        >
          <User className="w-4 h-4" />
          <span>Admin Dashboard</span>
        </Link>
      ) : (
        <Link 
          href="/profile" 
          className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition-colors"
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </Link>
      )}
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  ) : mounted ? (
    <button 
      onClick={() => setLocalShowAuthModal(true)}
      className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition-colors"
    >
      <User className="w-4 h-4" />
      <span>Log in</span>
    </button>
  ) : (
    <div className="w-24 h-10 bg-gray-100 animate-pulse rounded-xl"></div>
  );

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <Car className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter">DRIVEAWAY</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="font-semibold text-gray-600 hover:text-black transition-colors">Home</Link>
          <Link href="/about" className="font-semibold text-gray-600 hover:text-black transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-4">
          {authContent}
        </div>
      </div>

      {localShowAuthModal && (
        <AuthModal 
          onClose={() => setLocalShowAuthModal(false)} 
          onSuccess={() => {
            setLocalShowAuthModal(false);
            const currentUser = useAuthStore.getState().user;
            if (currentUser?.role === "admin") {
              router.push("/admin");
            } else {
              router.push("/profile");
            }
          }} 
        />
      )}
    </header>
  );
}
