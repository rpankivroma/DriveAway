
"use client";

import { useState, useEffect } from "react";
import { Car, User, LogOut, Menu, X, ChevronDown, Settings, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../features/auth/hooks/useAuth";
import AuthModal from "../../features/auth/components/AuthModal";
import { Button } from "../ui/Button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-sm py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <Car className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter">
              DRIVE<span className="text-gray-400">AWAY</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold hover:text-gray-500 transition-colors">Catalog</Link>
            <Link href="/about" className="text-sm font-bold hover:text-gray-500 transition-colors">About</Link>
            <Link href="/contact" className="text-sm font-bold hover:text-gray-500 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 pl-4 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all group"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black leading-none mb-1">{user?.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 leading-none uppercase tracking-widest">
                      {user?.role}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <User className="text-white w-5 h-5" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl shadow-black/10 border border-gray-100 p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 mb-2 bg-gray-50 rounded-2xl sm:hidden">
                      <p className="text-sm font-black">{user?.name}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{user?.role}</p>
                    </div>
                    
                    {user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold">Admin Dashboard</span>
                      </Link>
                    )}
                    
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="p-2 bg-gray-100 rounded-xl text-gray-600 group-hover:bg-gray-200 transition-colors">
                        <Settings className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">Account Settings</span>
                    </Link>

                    <div className="h-px bg-gray-100 my-2 mx-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-red-600 transition-colors group"
                    >
                      <div className="p-2 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={() => setShowAuthModal(true)}>
                Sign In
              </Button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 p-6 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-lg font-bold p-4 bg-gray-50 rounded-2xl">Catalog</Link>
              <Link href="/about" className="text-lg font-bold p-4 bg-gray-50 rounded-2xl">About</Link>
              <Link href="/contact" className="text-lg font-bold p-4 bg-gray-50 rounded-2xl">Contact</Link>
            </nav>
          </div>
        )}
      </header>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={() => setShowAuthModal(false)} 
        />
      )}
    </>
  );
}
