"use client";

import React, { useMemo, useState, useCallback } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Trash2, Copy, Download, AlertCircle, Filter } from "lucide-react";
import { ParsedRow } from "@/types";
import { useDataStore } from "@/store/dataStore";
import { exportToCSV, copyToClipboardWithoutHeaders, copyColumnToClipboard, getVisibleColumns } from "@/lib/exportUtils";
import { formatValue } from "@/utils/formatUtils";
import { AdvancedFiltersModal } from "./AdvancedFiltersModal";
import { FormattingPanel } from "./FormattingPanel";

interface ColumnFilter {
  id: string;
  column: string;
  type: "text" | "number" | "select";
  values?: string[];
  value?: string | number;
}

export function DataTable() {
  const { tableData, columnSettings, deleteRows, updateColumnVisibility, formatSettings } = useDataStore();
  const [filterValue, setFilterValue] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<ColumnFilter[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  if (!tableData) {
    return null;
  }

  // Dados processados com filtros
  const filteredDataWithMap = useMemo(() => {
    let data = tableData.rows.map((row, idx) => ({ row, originalIndex: idx }));

    // Aplicar filtros avançados
    if (advancedFilters.length > 0) {
      // Group filters by column for OR logic within each column
      const filtersByColumn: Record<string, ColumnFilter[]> = {};
      advancedFilters.forEach((filter) => {
        if (!filtersByColumn[filter.column]) {
          filtersByColumn[filter.column] = [];
        }
        filtersByColumn[filter.column].push(filter);
      });

      data = data.filter(({ row }) => {
        // Each column's filters are combined with OR, columns are combined with AND
        return Object.entries(filtersByColumn).every(([column, filters]) => {
          return filters.some((filter) => {
            const value = String(row[column] ?? "").toLowerCase();
            if (filter.type === "text" && filter.value) {
              return value.includes(String(filter.value).toLowerCase());
            }
            if (filter.type === "select") {
              // Check both filter.values (array) and filter.value (single string)
              const valuesToCheck = filter.values || (filter.value ? [filter.value] : []);
              return valuesToCheck.some((v) => value.includes(String(v).toLowerCase()));
            }
            if (filter.type === "number" && filter.value) {
              const numValue = parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
              const filterNum = parseFloat(String(filter.value));
              return Math.abs(numValue) === Math.abs(filterNum);
            }
            return true;
          });
        });
      });
    }

    // Aplicar filtro global
    if (filterValue) {
      const searchLower = filterValue.toLowerCase();
      data = data.filter(({ row }) => {
        return Object.values(row).some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(searchLower)
        );
      });
    }

    // Aplicar sorting
    if (sortColumn && sortOrder) {
      data = [...data].sort((a, b) => {
        const aVal = String(a.row[sortColumn] ?? "");
        const bVal = String(b.row[sortColumn] ?? "");
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [advancedFilters, filterValue, sortColumn, sortOrder, tableData.rows]);

  const filteredData = filteredDataWithMap.map(({ row }) => row);
  const visibleColumns = getVisibleColumns(tableData.columns, columnSettings);

  // Seleção
  const selectedRowIndices = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([_, selected]) => selected)
      .map(([idx]) => Number(idx))
      .filter((idx) => idx < filteredData.length);
  }, [rowSelection, filteredData.length]);

  // Handlers
  const handleExportCSV = useCallback(() => {
    const filename = `dados_${tableData.bank}_${Date.now()}.csv`;
    const rowsToExport = selectedRowIndices.length > 0 ? selectedRowIndices.map((idx) => filteredData[idx]) : filteredData;
    exportToCSV(rowsToExport, visibleColumns, filename, ";", formatSettings);
  }, [selectedRowIndices, filteredData, tableData.bank, visibleColumns, formatSettings]);

  const handleCopyToClipboard = useCallback(async () => {
    const rowsToExport = selectedRowIndices.length > 0 ? selectedRowIndices.map((idx) => filteredData[idx]) : filteredData;
    const success = await copyToClipboardWithoutHeaders(rowsToExport, visibleColumns, "\t", formatSettings);
    if (success) {
      alert("Dados copiados para a área de transferência!");
    }
  }, [selectedRowIndices, filteredData, visibleColumns, formatSettings]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedRowIndices.length > 0 && confirm(`Deletar ${selectedRowIndices.length} linha(s)?`)) {
      const originalIndices = selectedRowIndices
        .map((filteredIdx) => filteredDataWithMap[filteredIdx]?.originalIndex)
        .filter((idx) => idx !== undefined)
        .sort((a: number, b: number) => b - a);
      deleteRows(originalIndices as number[]);
      setRowSelection({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowIndices, filteredDataWithMap]);

  const addAdvancedFilter = useCallback((column: string, type: "text" | "number" | "select", value?: string | string[]) => {
    setAdvancedFilters((prev) => {
      const id = `${column}_${Date.now()}_${Math.random()}`;
      return [...prev, { id, column, type, values: Array.isArray(value) ? value : undefined, value: !Array.isArray(value) ? value : undefined }];
    });
  }, []);

  const removeAdvancedFilter = useCallback((filterId: string) => {
    setAdvancedFilters((prev) => prev.filter((f) => f.id !== filterId));
  }, []);

  const clearAllFilters = useCallback(() => {
    setAdvancedFilters([]);
  }, []);

  const handleCopyColumn = useCallback(
    async (columnName: string) => {
      const success = await copyColumnToClipboard(filteredData, columnName, formatSettings);
      if (success) {
        alert(`Coluna "${columnName}" copiada para a área de transferência!`);
      }
    },
    [filteredData, formatSettings]
  );

  const duplicateRows = filteredData.filter((row: any) => row.isDuplicate);

  const handleColumnSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc");
      if (sortOrder === "desc") setSortColumn(null);
    } else {
      setSortColumn(columnName);
      setSortOrder("asc");
    }
  };

  const getSortIndicator = (columnName: string) => {
    if (sortColumn !== columnName) return null;
    return sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-gray-300 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-700 font-medium">Banco</p>
              <p className="font-semibold text-lg text-gray-900">{tableData.bank}</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Período</p>
              <p className="font-semibold text-lg text-gray-900">{tableData.month}</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Total de linhas</p>
              <p className="font-semibold text-lg text-gray-900">{filteredData.length}</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Duplicatas</p>
              <p className={`font-semibold text-lg ${duplicateRows.length > 0 ? "text-red-600" : "text-green-600"}`}>{duplicateRows.length}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedRowIndices.length > 0 && (
              <div className="flex gap-2 items-center px-3 py-2 bg-blue-50 rounded text-sm text-blue-800 border border-blue-200">
                <span className="font-medium">{selectedRowIndices.length} linha(s)</span>
                <button onClick={handleDeleteSelected} className="ml-2 p-1 hover:bg-blue-200 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              <Copy size={18} />
              Copiar
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
            >
              <Download size={18} />
              Exportar CSV
            </button>
            <button
              onClick={() => setShowFiltersModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium ${
                advancedFilters.length > 0 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`}
            >
              <Filter size={18} />
              Filtros {advancedFilters.length > 0 && `(${advancedFilters.length})`}
            </button>
          </div>

          <input
            type="text"
            placeholder="Filtrar dados..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 placeholder:text-gray-600"
          />

          <FormattingPanel />

          {advancedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {advancedFilters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-900 rounded text-sm border">
                  <span className="font-medium">
                    {filter.column}: {filter.values?.join(", ") || filter.value}
                  </span>
                  <button onClick={() => removeAdvancedFilter(filter.id)} className="p-0.5 hover:bg-purple-200 rounded">
                    ✕
                  </button>
                </div>
              ))}
              <button onClick={clearAllFilters} className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600">
                Limpar todos
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {tableData.columns.map((col) => {
              const setting = columnSettings.find((s) => s.name === col);
              const isVisible = setting?.visible ?? true;
              return (
                <button
                  key={col}
                  onClick={() => updateColumnVisibility(col, !isVisible)}
                  className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${isVisible ? "bg-gray-700 text-white" : "bg-gray-400 text-white"}`}
                >
                  {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  {col}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg border border-gray-300">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRowIndices.length === filteredData.length && filteredData.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const sel: Record<string, boolean> = {};
                        filteredData.forEach((_, i) => (sel[i] = true));
                        setRowSelection(sel);
                      } else {
                        setRowSelection({});
                      }
                    }}
                    className="cursor-pointer"
                  />
                </th>
                {tableData.columns.map((col) => {
                  const isVisible = columnSettings.find((s) => s.name === col)?.visible ?? true;
                  if (!isVisible) return null;
                  return (
                    <th
                      key={col}
                      onClick={() => handleColumnSort(col)}
                      className="px-4 py-3 font-semibold text-gray-900 bg-gray-100 cursor-pointer hover:bg-gray-200 border-r"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {col}
                          {getSortIndicator(col)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyColumn(col);
                          }}
                          className="p-1 hover:bg-gray-300 rounded transition"
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
              {filteredData.map((row, idx) => {
                const isDuplicate = (row as any).isDuplicate;
                return (
                  <tr key={idx} className={`border-b hover:bg-gray-50 ${rowSelection[idx] ? "bg-blue-50" : isDuplicate ? "bg-red-50" : ""}`}>
                    <td className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={rowSelection[idx] || false}
                        onChange={() => setRowSelection((p) => ({ ...p, [idx]: !p[idx] }))}
                        className="cursor-pointer"
                      />
                    </td>
                    {tableData.columns.map((col) => {
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
          {filteredData.length === 0 && <div className="text-center py-8 text-gray-900">Nenhum dado para exibir</div>}
        </div>
      </div>

      <AdvancedFiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        tableData={tableData}
        advancedFilters={advancedFilters}
        onAddFilter={addAdvancedFilter}
        onRemoveFilter={removeAdvancedFilter}
        onClearFilters={clearAllFilters}
      />
    </>
  );
}
