"use client";

import React from "react";
import { ParsedRow } from "@/types";
import { type FormatSettings } from "@/utils/formatUtils";
import { TableRow } from "./TableRow";

interface TableBodyProps {
  rows: ParsedRow[];
  columns: string[];
  visibleColumns: string[];
  rowSelection: Record<string, boolean>;
  formatSettings: FormatSettings;
  onSelectRow: (index: number) => void;
  emptyMessage?: string;
}

export function TableBody({
  rows,
  columns,
  visibleColumns,
  rowSelection,
  formatSettings,
  onSelectRow,
  emptyMessage = "Nenhum dado para exibir",
}: TableBodyProps) {
  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length + 1} className="text-center py-8 text-gray-900">
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {rows.map((row, idx) => (
        <TableRow
          key={idx}
          row={row as ParsedRow & { isDuplicate?: boolean }}
          index={idx}
          columns={columns}
          visibleColumns={visibleColumns}
          isSelected={rowSelection[idx] || false}
          onSelect={onSelectRow}
          formatSettings={formatSettings}
        />
      ))}
    </tbody>
  );
}
