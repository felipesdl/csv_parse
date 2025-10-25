"use client";

import React from "react";

type BadgeVariant = "default" | "success" | "danger" | "warning" | "info";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-900",
  success: "bg-green-100 text-green-900",
  danger: "bg-red-100 text-red-900",
  warning: "bg-yellow-100 text-yellow-900",
  info: "bg-blue-100 text-blue-900",
};

export function Badge({ variant = "default", children, className = "", ...props }: BadgeProps) {
  return (
    <span {...props} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
