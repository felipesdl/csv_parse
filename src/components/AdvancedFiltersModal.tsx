"use client";

import React, { useState, useCallback } from "react";
import { Modal } from "./Modal";
import { X, ChevronDown, ChevronUp } from "lucide-react";
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

// Helper: Extrair valores únicos de uma coluna (simples e sem memory leak)
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
  // Estado MUITO SIMPLES - sem Set, sem objetos complexos
  const [localInputValues, setLocalInputValues] = useState<Record<string, string | string[]>>({});
  const [expandedColumnNames, setExpandedColumnNames] = useState<string[]>([]); // Array simples, não Set!

  // Callbacks SIMPLES - ANTES de qualquer conditional return!
  const handleLocalChange = useCallback((col: string, value: string | string[]) => {
    setLocalInputValues((prev) => ({ ...prev, [col]: value }));
  }, []);

  const toggleColumn = useCallback((col: string) => {
    setExpandedColumnNames((prev) => {
      if (prev.includes(col)) {
        return prev.filter((c) => c !== col); // Remove
      } else {
        return [...prev, col]; // Adiciona
      }
    });
  }, []);

  // Se modal não está aberto ou sem dados, retorna null APÓS os hooks
  if (!isOpen || !tableData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtros Avançados" size="lg">
      <div className="space-y-4">
        {/* Filtros Ativos - Somente aqui! */}
        {advancedFilters.length > 0 && (
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-purple-900">Filtros Ativos ({advancedFilters.length})</h3>
              <button onClick={onClearFilters} className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                Limpar todos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {advancedFilters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-2 px-3 py-1 bg-purple-200 text-purple-900 rounded text-sm font-medium">
                  <span>
                    {filter.column}: {filter.values?.join(", ") || filter.value}
                  </span>
                  <button onClick={() => onRemoveFilter(filter.id)} className="p-0.5 hover:bg-purple-300 rounded">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Filtros */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 sticky top-0 bg-white py-2">Adicionar Filtro por Coluna</h3>

          {tableData.columns.map((col) => {
            const isExpanded = expandedColumnNames.includes(col);
            const filtersForColumn = advancedFilters.filter((f) => f.column === col);
            const currentValue = localInputValues[col] || [];
            const { values, isNumeric } = getColumnValues(tableData, col);

            return (
              <div key={col} className="border border-gray-300 rounded bg-gray-50">
                {/* Header do filtro com toggle */}
                <button onClick={() => toggleColumn(col)} className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{col}</span>
                    {filtersForColumn.length > 0 && (
                      <span className="inline-block px-2 py-0.5 bg-purple-600 text-white text-xs rounded">{filtersForColumn.length}</span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Conteúdo expandido */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-gray-300 space-y-2">
                    <label className="block font-medium text-sm text-gray-900 mb-2">Adicionar novo filtro para {col}</label>

                    {isNumeric ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Digite o valor"
                          value={typeof currentValue === "string" ? currentValue : ""}
                          onChange={(e) => handleLocalChange(col, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-600"
                        />
                        <button
                          onClick={() => {
                            const val = localInputValues[col];
                            if (val) {
                              onAddFilter(col, "number", val);
                              handleLocalChange(col, "");
                            }
                          }}
                          className="px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600"
                        >
                          Adicionar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <select
                          multiple
                          size={Math.min(6, values.length + 1)}
                          value={Array.isArray(currentValue) ? currentValue : []}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                            handleLocalChange(col, selected);
                            if (selected.length > 0) {
                              onAddFilter(col, "select", selected[selected.length - 1]);
                              handleLocalChange(col, []);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                        >
                          {values.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-700">Clique nos valores para adicionar como filtro</p>
                      </div>
                    )}
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
