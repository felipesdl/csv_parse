"use client";

import React from "react";

interface InfoGridProps {
  items: Array<{
    label: string;
    value: React.ReactNode;
    color?: "default" | "success" | "danger" | "warning";
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
}

const colorStyles = {
  default: "text-gray-900",
  success: "text-green-600",
  danger: "text-red-600",
  warning: "text-amber-600",
};

const columnStyles = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function InfoGrid({ items, columns = 4, className = "" }: InfoGridProps) {
  return (
    <div className={`grid ${columnStyles[columns]} gap-4 text-sm ${className}`}>
      {items.map((item, idx) => (
        <div key={idx}>
          <p className="text-gray-700 font-medium">{item.label}</p>
          <p className={`font-semibold text-lg ${colorStyles[item.color || "default"]}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
