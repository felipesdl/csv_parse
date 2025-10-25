"use client";

import React, { useState, useCallback } from "react";
import { Modal } from "./Modal";
import { X } from "lucide-react";
import { ParsedRow } from "@/types";

interface ColumnFilter {
  id: string;
  column: string;
  type: "text" | "number" | "select";
  values?: string[];
  value?: string | number;
}

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableData: { rows: (ParsedRow & { isDuplicate?: boolean })[]; columns: string[] } | null;
  advancedFilters: ColumnFilter[];
  onAddFilter: (column: string, type: "text" | "number" | "select", value?: string | string[]) => void;
  onRemoveFilter: (filterId: string) => void;
  onClearFilters: () => void;
}

// Helper: Extrair valores únicos de uma coluna
function getColumnValues(
  tableData: { rows: (ParsedRow & { isDuplicate?: boolean })[]; columns: string[] } | null,
  column: string
): { values: string[]; isNumeric: boolean } {
  if (!tableData) return { values: [], isNumeric: false };

  const values = new Set<string>();
  const rowsToCheck = Math.min(tableData.rows.length, 100);

  for (let i = 0; i < rowsToCheck; i++) {
    const value = tableData.rows[i][column];
    if (value !== null && value !== undefined) {
      values.add(String(value));
    }
  }

  const valuesList = Array.from(values).slice(0, 50);
  const isNumeric = valuesList.length > 0 && valuesList.every((v) => !isNaN(parseFloat(v.replace(/[^\d.-]/g, ""))));

  return { values: valuesList, isNumeric };
}

export function AdvancedFiltersModal({ isOpen, onClose, tableData, advancedFilters, onAddFilter, onRemoveFilter, onClearFilters }: AdvancedFiltersModalProps) {
  // Estado para rastrear qual coluna está com dropdown aberto
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Verificar se um valor já está filtrado
  const isValueFiltered = useCallback(
    (column: string, value: string): boolean => {
      return advancedFilters.some((f) => f.column === column && (f.value === value || f.values?.includes(value)));
    },
    [advancedFilters]
  );

  // Alternar filtro (adiciona se não existe, remove se existe)
  const toggleFilter = useCallback(
    (column: string, value: string) => {
      if (isValueFiltered(column, value)) {
        // Remover filtro
        const filterToRemove = advancedFilters.find((f) => f.column === column && (f.value === value || f.values?.includes(value)));
        if (filterToRemove) {
          onRemoveFilter(filterToRemove.id);
        }
      } else {
        // Adicionar filtro
        onAddFilter(column, "select", value);
      }
    },
    [advancedFilters, onAddFilter, onRemoveFilter, isValueFiltered]
  );

  // Se modal não está aberto ou sem dados, retorna null
  if (!isOpen || !tableData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtros Avançados" size="lg">
      <div className="space-y-4">
        {/* Filtros Ativos como Tags */}
        {advancedFilters.length > 0 && (
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-900">Filtros Ativos ({advancedFilters.length})</h3>
              <button
                onClick={onClearFilters}
                className="text-xs px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer font-medium"
              >
                Limpar todos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {advancedFilters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-full text-sm font-medium shadow-sm">
                  <span>
                    {filter.column}: {filter.values?.join(", ") || filter.value}
                  </span>
                  <button onClick={() => onRemoveFilter(filter.id)} className="p-0.5 hover:bg-purple-700 rounded-full transition cursor-pointer ml-1">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Select Dropdowns por Coluna */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 sticky top-0 bg-white py-2">Filtrar por Coluna</h3>

          {tableData.columns.map((col) => {
            const { values } = getColumnValues(tableData, col);
            const filtersForColumn = advancedFilters.filter((f) => f.column === col);

            return (
              <div key={col} className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">{col}</label>
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === col ? null : col)}
                    className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition flex items-center justify-between"
                  >
                    <span className="text-gray-700">{filtersForColumn.length > 0 ? `${filtersForColumn.length} selecionado(s)` : "Selecione valores"}</span>
                    <span className="text-gray-400">▼</span>
                  </button>

                  {/* Dropdown aberto */}
                  {openDropdown === col && values.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {values.map((value) => {
                        const isSelected = isValueFiltered(col, value);
                        return (
                          <label
                            key={value}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition border-b border-gray-100 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleFilter(col, value)}
                              className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                            />
                            <span className="text-sm text-gray-700">{value}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {values.length === 0 && <div className="text-xs text-gray-500 mt-1">Nenhum valor disponível</div>}
                </div>

                {/* Tags de filtros ativos para esta coluna */}
                {filtersForColumn.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filtersForColumn.map((filter) => (
                      <div key={filter.id} className="flex items-center gap-2 px-2.5 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-medium">
                        <span>{filter.values?.join(", ") || filter.value}</span>
                        <button onClick={() => onRemoveFilter(filter.id)} className="p-0.5 hover:bg-blue-200 rounded-full transition cursor-pointer">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
