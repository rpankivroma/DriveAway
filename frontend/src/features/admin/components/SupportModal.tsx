"use client";

import { X, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui/Button";

interface SupportModalProps {
  onClose: () => void;
}

export function SupportModal({ onClose }: SupportModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-3xl font-black tracking-tight mb-4">Contact Support</h3>
          <p className="text-gray-500 font-medium leading-relaxed mb-8">
            If you are experiencing issues or have questions about the platform, 
            the best way to get help is through our Discord community. 
            Describe your problem there and our team will assist you.
          </p>

          <div className="space-y-4">
            <a 
              href="https://discord.gg/aR9hKUsR" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-[#5865F2] text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#4752C4] transition-all shadow-lg shadow-indigo-200"
            >
              <img src="https://assets-global.website-files.com/6257ade0c7a6944c92d908d9/636e0a2249442208611936d5_icon_clyde_white_RGB.svg" alt="Discord" className="w-6 h-6" />
              Join Discord Server
            </a>
            <Button 
              variant="ghost"
              onClick={onClose}
              className="w-full py-5 text-gray-400 font-bold hover:text-black transition-colors"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
