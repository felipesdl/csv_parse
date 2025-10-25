"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SortIndicatorProps {
  column: string;
  sortColumn: string | null;
  sortOrder: "asc" | "desc" | null;
}

export function SortIndicator({ column, sortColumn, sortOrder }: SortIndicatorProps) {
  if (sortColumn !== column) return null;
  return sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
}
