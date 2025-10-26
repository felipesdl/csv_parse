"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorAlertProps {
  error: string | null;
  onClose: () => void;
}

export function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <h3 className="font-medium text-red-900">Erro</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
      </div>
      <button onClick={onClose} className="text-red-600 hover:text-red-700 flex-shrink-0 cursor-pointer">
        <X size={20} />
      </button>
    </div>
  );
}
