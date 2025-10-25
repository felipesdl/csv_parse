"use client";

import React from "react";
import { X } from "lucide-react";
import { Badge } from "../ui";
import type { ColumnFilter } from "./types";

interface FilterBadgeListProps {
  filters: ColumnFilter[];
  onRemove: (filterId: string) => void;
  onClearAll: () => void;
}

export function FilterBadgeList({ filters, onRemove, onClearAll }: FilterBadgeListProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-900 rounded text-sm border border-purple-300">
          <span className="font-medium">
            {filter.column}: {filter.values?.join(", ") || filter.value}
          </span>
          <button onClick={() => onRemove(filter.id)} className="p-0.5 hover:bg-purple-200 rounded cursor-pointer">
            <X size={14} />
          </button>
        </div>
      ))}
      <button onClick={onClearAll} className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 cursor-pointer">
        Limpar todos
      </button>
    </div>
  );
}
