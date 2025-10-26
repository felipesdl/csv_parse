"use client";

import React, { useMemo, useState, useCallback } from "react";
import { AlertCircle, ChevronUp, ChevronDown, Trash2, Copy, Download, Filter, Eye, EyeOff } from "lucide-react";
import { ParsedRow } from "@/types";
import { useDataStore } from "@/store/dataStore";
import { exportToCSV, copyColumnToClipboard, getVisibleColumns } from "@/lib/exportUtils";
import { formatValue } from "@/utils/formatUtils";
import { AdvancedFiltersModal } from "../filters";
import { FormattingPanel } from "../formatting";
import { ValueDistributionChart } from "../chart";
import { useCopyToClipboard } from "@/hooks/useCSVOperations";
import { useToast } from "@/hooks/useToast";
import { SortIndicator, ColumnVisibility, TableControls, FilterBadgeList, TableHeader, TableBody, SplitTableView, type ColumnFilter } from "../table";
import { SimpleTable, DualTableWrapper } from "./";

interface ExtendedColumnFilter extends ColumnFilter {
  id: string;
}

export function DataTable() {
  const { tableData, columnSettings, deleteRows, updateColumnVisibility, formatSettings } = useDataStore();
  const { success, error } = useToast();
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

  // Seleção: indices referentes à tabela principal (tableId === 'main')
  const selectedMainRowIndices = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([key, selected]) => selected && key.startsWith("main_"))
      .map(([key]) => Number(key.split("_")[1]))
      .filter((idx) => !Number.isNaN(idx) && idx < filteredData.length);
  }, [rowSelection, filteredData.length]);

  // Total de linhas selecionadas em qualquer tabela (main, positive, negative)
  const totalSelectedCount = useMemo(() => Object.values(rowSelection).filter(Boolean).length, [rowSelection]);

  // Handlers
  const handleExportCSV = useCallback(() => {
    const filename = `dados_${tableData.bank}_${Date.now()}.csv`;
    const rowsToExport = selectedMainRowIndices.length > 0 ? selectedMainRowIndices.map((idx) => filteredData[idx]) : filteredData;
    exportToCSV(rowsToExport, visibleColumns, filename, ";", formatSettings);
  }, [selectedMainRowIndices, filteredData, tableData.bank, visibleColumns, formatSettings]);

  // TanStack Query mutation para clipboard
  const { mutate: copyWithQuery } = useCopyToClipboard();

  // Copy helper used in both split and non-split modes
  const makeClipboardText = useCallback(
    (rows: Record<string, any>[]) => {
      const lines = rows.map((row) => {
        return visibleColumns
          .map((col) => {
            const value = row[col] ?? "";
            const strValue = formatValue(String(value), formatSettings);

            if (strValue.includes("\t") || strValue.includes('"') || strValue.includes("\n")) {
              return `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
          })
          .join("\t");
      });
      return lines.join("\n");
    },
    [visibleColumns, formatSettings]
  );

  // Non-split copy (tableId = main)
  const handleCopyNonSplit = useCallback(() => {
    const rowsToExport = selectedMainRowIndices.length > 0 ? selectedMainRowIndices.map((idx) => filteredData[idx]) : filteredData;
    const fullText = makeClipboardText(rowsToExport);
    copyWithQuery(fullText, {
      onSuccess: () => {
        success("Dados copiados para a área de transferência!");
      },
      onError: () => {
        error("Erro ao copiar para clipboard");
      },
    });
  }, [selectedMainRowIndices, filteredData, makeClipboardText, copyWithQuery, success, error]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedMainRowIndices.length > 0 && confirm(`Deletar ${selectedMainRowIndices.length} linha(s)?`)) {
      const originalIndices = selectedMainRowIndices
        .map((filteredIdx: number) => filteredDataWithMap[filteredIdx]?.originalIndex)
        .filter((idx: number | undefined): idx is number => idx !== undefined)
        .sort((a: number, b: number) => b - a);
      deleteRows(originalIndices as number[]);
      setRowSelection({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMainRowIndices, filteredDataWithMap]);

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
    (columnName: string) => {
      const values = filteredData.map((row) => {
        const value = row[columnName] ?? "";
        return formatValue(String(value), formatSettings);
      });

      const fullText = values.join("\n");

      copyWithQuery(fullText, {
        onSuccess: () => {
          success(`Coluna "${columnName}" copiada para a área de transferência!`);
        },
        onError: () => {
          error("Erro ao copiar coluna");
        },
      });
    },
    [filteredData, formatSettings, copyWithQuery, success, error]
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

  return (
    <>
      <div className="space-y-4">
        {/* Layout 60/40: Info + Filtros (60%) + Gráfico (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Info e Filtros - 60% (3 colunas de 5) */}
          <div className="lg:col-span-3 space-y-4">
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
                {selectedMainRowIndices.length > 0 && (
                  <div className="flex gap-2 items-center px-3 py-2 bg-blue-50 rounded text-sm text-blue-800 border border-blue-200">
                    <span className="font-medium">{selectedMainRowIndices.length} linha(s)</span>
                    <button onClick={handleDeleteSelected} className="ml-2 p-1 hover:bg-blue-200 rounded cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium cursor-pointer"
                >
                  <Download size={18} />
                  Exportar CSV
                </button>
                <button
                  onClick={() => setShowFiltersModal(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium cursor-pointer ${
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
                      <button onClick={() => removeAdvancedFilter(filter.id)} className="p-0.5 hover:bg-purple-200 rounded cursor-pointer">
                        ✕
                      </button>
                    </div>
                  ))}
                  <button onClick={clearAllFilters} className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 cursor-pointer">
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
                      className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium cursor-pointer ${
                        isVisible ? "bg-gray-700 text-white" : "bg-gray-400 text-white"
                      }`}
                    >
                      {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Gráfico - 40% (2 colunas de 5) */}
          <div className="lg:col-span-2">
            <ValueDistributionChart data={filteredData as (ParsedRow & { isDuplicate?: boolean })[]} advancedFilters={advancedFilters} />
          </div>
        </div>

        {/* Tabela - 100% de largura abaixo */}
        {formatSettings.splitByPosNeg ? (
          <SplitTableView data={filteredData} columns={tableData.columns}>
            {({ positiveData, negativeData }) => {
              const [copyTarget, setCopyTarget] = React.useState<"both" | "positive" | "negative">("both");

              const handleCopySplit = () => {
                // If any rows selected across either table, copy those
                const selectedKeys = Object.entries(rowSelection)
                  .filter(([, v]) => v)
                  .map(([k]) => k);
                let rowsToCopy: Record<string, any>[] = [];

                if (selectedKeys.length > 0) {
                  // Collect selected rows from positive/negative arrays based on keys like 'positive_3'
                  selectedKeys.forEach((key) => {
                    if (key.startsWith("positive_")) {
                      const idx = Number(key.split("_")[1]);
                      if (!Number.isNaN(idx) && idx < positiveData.length) rowsToCopy.push(positiveData[idx]);
                    } else if (key.startsWith("negative_")) {
                      const idx = Number(key.split("_")[1]);
                      if (!Number.isNaN(idx) && idx < negativeData.length) rowsToCopy.push(negativeData[idx]);
                    } else if (key.startsWith("main_")) {
                      const idx = Number(key.split("_")[1]);
                      if (!Number.isNaN(idx) && idx < filteredData.length) rowsToCopy.push(filteredData[idx]);
                    }
                  });
                } else {
                  // No selection: use copyTarget to decide
                  if (copyTarget === "both") rowsToCopy = [...positiveData, ...negativeData];
                  if (copyTarget === "positive") rowsToCopy = [...positiveData];
                  if (copyTarget === "negative") rowsToCopy = [...negativeData];
                }

                const fullText = makeClipboardText(rowsToCopy);
                copyWithQuery(fullText, {
                  onSuccess: () => success("Dados copiados para a área de transferência!"),
                  onError: () => error("Erro ao copiar para clipboard"),
                });
              };

              return (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-900">Ao copiar (sem seleção):</label>
                    <select
                      value={copyTarget}
                      onChange={(e) => setCopyTarget(e.target.value as any)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                    >
                      <option value="both">Ambas as tabelas</option>
                      <option value="positive">Apenas positivos</option>
                      <option value="negative">Apenas negativos</option>
                    </select>
                    <button
                      onClick={handleCopySplit}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer"
                    >
                      <Copy size={16} /> Copiar
                    </button>
                  </div>
                  <DualTableWrapper
                    positiveData={positiveData}
                    negativeData={negativeData}
                    renderTable={(data, label) => (
                      <SimpleTable
                        data={data}
                        columns={tableData.columns}
                        columnSettings={columnSettings}
                        formatSettings={formatSettings}
                        selectedRows={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        onColumnVisibilityChange={updateColumnVisibility}
                        onCopyColumn={handleCopyColumn}
                        onDeleteSelected={handleDeleteSelected}
                        tableId={label}
                        sortColumn={sortColumn}
                        sortOrder={sortOrder}
                        onColumnSort={handleColumnSort}
                      />
                    )}
                  />
                </div>
              );
            }}
          </SplitTableView>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-end">
              <button onClick={handleCopyNonSplit} className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm">
                <Copy size={16} /> Copiar
              </button>
            </div>
            <SimpleTable
              data={filteredData}
              columns={tableData.columns}
              columnSettings={columnSettings}
              formatSettings={formatSettings}
              selectedRows={rowSelection}
              onRowSelectionChange={setRowSelection}
              onColumnVisibilityChange={updateColumnVisibility}
              onCopyColumn={handleCopyColumn}
              onDeleteSelected={handleDeleteSelected}
              tableId="main"
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onColumnSort={handleColumnSort}
            />
          </div>
        )}
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
