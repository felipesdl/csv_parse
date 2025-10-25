"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui";

interface ColumnVisibilityProps {
  columns: string[];
  visibility: Record<string, boolean>;
  onToggle: (column: string) => void;
}

export function ColumnVisibility({ columns, visibility, onToggle }: ColumnVisibilityProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {columns.map((col) => {
        const isVisible = visibility[col] ?? true;
        return (
          <Button key={col} variant={isVisible ? "primary" : "secondary"} size="sm" onClick={() => onToggle(col)} className="!px-3 !py-1">
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            {col}
          </Button>
        );
      })}
    </div>
  );
}
