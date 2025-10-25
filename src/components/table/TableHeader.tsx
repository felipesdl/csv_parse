"use client";

import React from "react";
import { Copy } from "lucide-react";

interface TableHeaderProps {
  columns: string[];
  visibleColumns: string[];
  sortColumn: string | null;
  sortOrder: "asc" | "desc" | null;
  selectedCount: number;
  totalCount: number;
  onSort: (column: string) => void;
  onSelectAll: (selected: boolean) => void;
  onCopyColumn: (column: string) => void;
  getSortIndicator: (column: string) => React.ReactNode;
}

export function TableHeader({
  columns,
  visibleColumns,
  sortColumn,
  sortOrder,
  selectedCount,
  totalCount,
  onSort,
  onSelectAll,
  onCopyColumn,
  getSortIndicator,
}: TableHeaderProps) {
  return (
    <thead className="bg-gray-100 border-b border-gray-300">
      <tr>
        <th className="w-12 px-4 py-3">
          <input
            type="checkbox"
            checked={selectedCount === totalCount && totalCount > 0}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="cursor-pointer"
          />
        </th>
        {columns.map((col) => {
          if (!visibleColumns.includes(col)) return null;
          return (
            <th key={col} onClick={() => onSort(col)} className="px-4 py-3 font-semibold text-gray-900 bg-gray-100 cursor-pointer hover:bg-gray-200 border-r">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {col}
                  {getSortIndicator(col)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyColumn(col);
                  }}
                  className="p-1 hover:bg-gray-300 rounded transition cursor-pointer"
                  title="Copiar coluna"
                >
                  <Copy size={16} />
                </button>
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
