"use client";

import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className = "", ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>}
      <select
        {...props}
        className={`
          w-full px-3 py-2 border rounded text-sm
          text-gray-900 bg-white
          border-gray-300 hover:border-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          ${error ? "border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
