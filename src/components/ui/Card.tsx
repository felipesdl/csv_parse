"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingStyles = {
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
};

export function Card({ children, className = "", padding = "md", ...props }: CardProps) {
  return (
    <div {...props} className={`bg-white rounded-lg border border-gray-300 shadow-sm ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}
