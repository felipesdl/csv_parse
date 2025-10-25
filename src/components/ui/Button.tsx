"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({ variant = "primary", size = "md", isLoading = false, children, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`
        flex items-center gap-2 rounded font-medium transition
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
    >
      {isLoading && <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />}
      {children}
    </button>
  );
}
