"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>}
      <input
        {...props}
        className={`
          w-full px-3 py-2 border rounded text-sm
          text-gray-900 placeholder:text-gray-600
          border-gray-300 hover:border-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
}
