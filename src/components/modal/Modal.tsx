"use client";

import React from "react";
import { X } from "lucide-react";
import type { ModalProps } from "./types";

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-full max-w-sm",
    md: "w-full max-w-md",
    lg: "w-full max-w-lg",
    xl: "w-full max-w-2xl",
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 cursor-pointer"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}
      onClick={handleBackdropClick}
    >
      <div className={`${sizeClasses[size]} bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto cursor-default`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition cursor-pointer" title="Fechar">
            <X size={24} className="text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
