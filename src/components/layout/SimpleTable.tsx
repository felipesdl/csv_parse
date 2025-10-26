"use client";

import React, { useState, useCallback, useMemo } from "react";
import { AlertCircle, Eye, EyeOff, Trash2, Copy, ChevronUp, ChevronDown } from "lucide-react";
import { ParsedRow } from "@/types";
import { formatValue } from "@/utils/formatUtils";
import { ColumnSettings } from "@/types";

interface SimpleTableProps {
  data: ParsedRow[];
  columns: string[];
  columnSettings: ColumnSettings[];
  formatSettings: {
    dateFormat: "full" | "date-only" | "day-only";
    showNegativeAsPositive: boolean;
    splitByPosNeg: boolean;
  };
  selectedRows: Record<string, boolean>;
  onRowSelectionChange: (selection: Record<string, boolean>) => void;
  onColumnVisibilityChange: (column: string, visible: boolean) => void;
  onCopyColumn: (column: string) => void;
  onDeleteSelected: () => void;
  tableId?: string; // Identificador único para a tabela (usado em modo dividido)
  sortColumn?: string | null;
  sortOrder?: "asc" | "desc" | null;
  onColumnSort?: (columnName: string) => void;
}

/**
 * Componente reutilizável para renderizar tabelas
 * Mantém a lógica de renderização separada da lógica de filtragem
 */
export function SimpleTable({
  data,
  columns,
  columnSettings,
  formatSettings,
  selectedRows,
  onRowSelectionChange,
  onColumnVisibilityChange,
  onCopyColumn,
  onDeleteSelected,
  tableId = "main",
  sortColumn,
  sortOrder,
  onColumnSort,
}: SimpleTableProps) {
  // Criar chave para os índices com prefixo do tableId
  const makeRowKey = (idx: number) => `${tableId}_${idx}`;
  const parseRowKey = (key: string) => {
    const [_, idxStr] = key.split("_");
    return Number(idxStr);
  };

  const selectedRowIndices = useMemo(() => {
    return Object.entries(selectedRows)
      .filter(([key, selected]) => key.startsWith(`${tableId}_`) && selected)
      .map(([key]) => parseRowKey(key))
      .filter((idx) => idx < data.length);
  }, [selectedRows, data.length, tableId]);

  const handleSelectAll = useCallback(() => {
    if (selectedRowIndices.length === data.length && data.length > 0) {
      // Deselecionar todas as linhas desta tabela
      const newSelection = { ...selectedRows };
      Object.keys(newSelection).forEach((key) => {
        if (key.startsWith(`${tableId}_`)) {
          delete newSelection[key];
        }
      });
      onRowSelectionChange(newSelection);
    } else {
      // Selecionar todas as linhas desta tabela
      const newSelection = { ...selectedRows };
      data.forEach((_, idx) => {
        newSelection[makeRowKey(idx)] = true;
      });
      onRowSelectionChange(newSelection);
    }
  }, [selectedRowIndices.length, data.length, onRowSelectionChange, tableId, selectedRows, makeRowKey]);

  const handleRowToggle = useCallback(
    (idx: number) => {
      const key = makeRowKey(idx);
      onRowSelectionChange({
        ...selectedRows,
        [key]: !selectedRows[key],
      });
    },
    [selectedRows, onRowSelectionChange, tableId, makeRowKey]
  );

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-900">Nenhum dado para exibir</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-300">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={selectedRowIndices.length === data.length && data.length > 0}
                onChange={handleSelectAll}
                className="cursor-pointer"
              />
            </th>
            {columns.map((col) => {
              const isVisible = columnSettings.find((s) => s.name === col)?.visible ?? true;
              if (!isVisible) return null;
              const isSorted = sortColumn === col;
              return (
                <th key={col} className="px-4 py-3 font-semibold text-gray-900 bg-gray-100 cursor-pointer hover:bg-gray-200 border-r">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => onColumnSort?.(col)}>
                      {col}
                      {isSorted && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
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
        <tbody>
          {data.map((row, idx) => {
            const isDuplicate = (row as any).isDuplicate;
            const rowKey = makeRowKey(idx);
            return (
              <tr key={idx} className={`border-b hover:bg-gray-50 ${selectedRows[rowKey] ? "bg-blue-50" : isDuplicate ? "bg-red-50" : ""}`}>
                <td className="w-12 px-4 py-3">
                  <input type="checkbox" checked={selectedRows[rowKey] || false} onChange={() => handleRowToggle(idx)} className="cursor-pointer" />
                </td>
                {columns.map((col) => {
                  const isVisible = columnSettings.find((s) => s.name === col)?.visible ?? true;
                  if (!isVisible) return null;
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
          })}
        </tbody>
      </table>
    </div>
  );
}
