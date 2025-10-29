"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { AIChat } from "./AIChat";

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700 hover:scale-110"
        }`}
        title={isOpen ? "Fechar Chat" : "Abrir Chat IA"}
      >
        {isOpen ? <X size={28} className="text-white" /> : <MessageCircle size={28} className="text-white" />}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[480px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] shadow-2xl rounded-lg overflow-hidden animate-slideIn">
          <AIChat onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setIsOpen(false)} />}
    </>
  );
}
