"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { ParsedRow } from "@/types";
import { formatValue, type FormatSettings } from "@/utils/formatUtils";

interface TableRowProps {
  row: ParsedRow & { isDuplicate?: boolean };
  index: number;
  columns: string[];
  visibleColumns: string[];
  isSelected: boolean;
  onSelect: (index: number) => void;
  formatSettings: FormatSettings;
}

export function TableRow({ row, index, columns, visibleColumns, isSelected, onSelect, formatSettings }: TableRowProps) {
  const isDuplicate = row.isDuplicate;

  return (
    <tr className={`border-b hover:bg-gray-50 ${isSelected ? "bg-blue-50" : isDuplicate ? "bg-red-50" : ""}`}>
      <td className="w-12 px-4 py-3">
        <input type="checkbox" checked={isSelected} onChange={() => onSelect(index)} className="cursor-pointer" />
      </td>
      {columns.map((col) => {
        if (!visibleColumns.includes(col)) return null;
        const cellValue = String(row[col] ?? "");
        const formattedValue = formatValue(cellValue, formatSettings);
        return (
          <td key={col} className="px-4 py-3 border-r text-gray-800">
            {isDuplicate && (
              <div className="flex gap-1 items-center mb-1">
                <AlertCircle size={14} className="text-red-600" />
                <span className="text-xs font-medium text-red-600">Duplicada</span>
              </div>
            )}
            {formattedValue}
          </td>
        );
      })}
    </tr>
  );
}
