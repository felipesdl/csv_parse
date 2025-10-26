"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useComparisonStore } from "@/store/comparisonStore";
import { ParsedRow, ColumnSettings, FormatSettings } from "@/types";
import { formatValue } from "@/utils";
import { ChevronUp, ChevronDown, Copy, Download, Filter, X, Settings } from "lucide-react";
import { exportToCSV, getVisibleColumns } from "@/lib/exportUtils";
import { useCopyToClipboard } from "@/hooks/useCSVOperations";
import type { ColumnFilter } from "../filters/types";

export function CompleteDataView() {
  const { comparedFiles } = useComparisonStore();

  // Format settings
  const [formatSettings, setFormatSettings] = useState<FormatSettings>({
    dateFormat: "full",
    showNegativeAsPositive: false,
    splitByPosNeg: false,
  });

  // Column settings
  const [columnSettings, setColumnSettings] = useState<ColumnSettings[]>([]);

  // Table state
  const [filterValue, setFilterValue] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<ColumnFilter[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Consolidate all data from all files
  const consolidatedData = useMemo(() => {
    if (!comparedFiles || comparedFiles.length === 0) {
      return { rows: [], columns: [], banks: [] };
    }

    // Collect all unique columns
    const allColumns = new Set<string>();
    const banks: string[] = [];

    comparedFiles.forEach((file) => {
      banks.push(file.bankName);
      file.columns.forEach((col) => allColumns.add(col));
    });

    // Consolidate rows: add bank info
    const consolidatedRows: ParsedRow[] = [];
    comparedFiles.forEach((file) => {
      file.data.forEach((row) => {
        consolidatedRows.push({
          ...row,
          Banco: file.bankName,
        });
      });
    });

    return {
      rows: consolidatedRows,
      columns: ["Banco", ...Array.from(allColumns)],
      banks,
    };
  }, [comparedFiles]);

  // Initialize column settings
  useMemo(() => {
    if (consolidatedData.columns.length > 0 && columnSettings.length === 0) {
      setColumnSettings(
        consolidatedData.columns.map((col, idx) => ({
          name: col,
          visible: true, // All columns visible including Banco
          order: idx,
        }))
      );
    }
  }, [consolidatedData.columns]);

  // Apply filters and sorting
  const processedRows = useMemo(() => {
    let data = consolidatedData.rows.map((row, idx) => ({ row, originalIndex: idx }));

    // Global search
    if (filterValue.trim()) {
      data = data.filter(({ row }) =>
        consolidatedData.columns.some((col) => {
          const value = String(row[col] || "").toLowerCase();
          return value.includes(filterValue.toLowerCase());
        })
      );
    }

    // Advanced filters
    if (advancedFilters.length > 0) {
      data = data.filter(({ row }) => {
        return advancedFilters.every((filter) => {
          const value = String(row[filter.column] || "");
          if (filter.type === "text") {
            return value.toLowerCase().includes(String(filter.value || "").toLowerCase());
          }
          if (filter.type === "number") {
            const num = parseFloat(value);
            const filterVal = parseFloat(String(filter.value || "0"));
            // Sem operador específico, apenas verificar igualdade
            return num === filterVal;
          }
          return true;
        });
      });
    }

    // Sorting
    if (sortColumn && sortOrder) {
      data.sort(({ row: a }, { row: b }) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        const comparison = String(aVal).localeCompare(String(bVal), "pt-BR", { numeric: true });
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return data;
  }, [consolidatedData.rows, consolidatedData.columns, filterValue, advancedFilters, sortColumn, sortOrder]);

  // Format rows
  const formattedRows = useMemo(() => {
    return processedRows.map(({ row, originalIndex }) => {
      const formatted: ParsedRow = {};
      consolidatedData.columns.forEach((col) => {
        const value = row[col];
        if (col === "Banco") {
          // Banco é uma string, não formatar
          formatted[col] = value;
        } else if (value !== undefined && value !== null) {
          formatted[col] = formatValue(String(value), formatSettings);
        } else {
          formatted[col] = value;
        }
      });
      return { formatted, originalIndex };
    });
  }, [processedRows, consolidatedData.columns, formatSettings]);

  // Copy and export
  const { mutate: copyWithQuery } = useCopyToClipboard();

  const visibleColumns = useMemo(() => getVisibleColumns(consolidatedData.columns, columnSettings), [consolidatedData.columns, columnSettings]);

  const handleCopyToClipboard = useCallback(() => {
    const rowsToExport = formattedRows.map(({ formatted }) => formatted);
    const lines = rowsToExport.map((row) => {
      return visibleColumns
        .map((col) => {
          const value = row[col] ?? "";
          const strValue = String(value);
          if (strValue.includes("\t") || strValue.includes('"') || strValue.includes("\n")) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        })
        .join("\t");
    });
    const fullText = lines.join("\n");
    copyWithQuery(fullText, { onSuccess: () => alert("Copiado para área de transferência!") });
  }, [formattedRows, visibleColumns, copyWithQuery]);

  const handleExportCSV = useCallback(() => {
    const rowsToExport = formattedRows.map(({ formatted }) => formatted);
    const filename = `dados_completos_${Date.now()}.csv`;
    exportToCSV(rowsToExport, visibleColumns, filename, ";", formatSettings);
  }, [formattedRows, visibleColumns, formatSettings]);

  if (!comparedFiles || comparedFiles.length === 0) {
    return <div className="text-center text-gray-600">Nenhum arquivo carregado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-1">Arquivos</p>
          <p className="text-2xl font-bold text-gray-900">{comparedFiles.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-1">Total de Registros</p>
          <p className="text-2xl font-bold text-gray-900">{consolidatedData.rows.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-1">Filtrados</p>
          <p className="text-2xl font-bold text-gray-900">{formattedRows.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-1">Colunas</p>
          <p className="text-2xl font-bold text-gray-900">{visibleColumns.length}</p>
        </div>
      </div>

      {/* Formatting Controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-gray-900" />
          <h3 className="font-semibold text-gray-900">Formatação de Dados</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Data</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateFormat"
                  value="full"
                  checked={formatSettings.dateFormat === "full"}
                  onChange={() => setFormatSettings({ ...formatSettings, dateFormat: "full" })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Completo (dd/mm/yyyy hh:mm)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateFormat"
                  value="date-only"
                  checked={formatSettings.dateFormat === "date-only"}
                  onChange={() => setFormatSettings({ ...formatSettings, dateFormat: "date-only" })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Apenas data (dd/mm/yyyy)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateFormat"
                  value="day-only"
                  checked={formatSettings.dateFormat === "day-only"}
                  onChange={() => setFormatSettings({ ...formatSettings, dateFormat: "day-only" })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Apenas dia</span>
              </label>
            </div>
          </div>

          {/* Negative Values */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valores Negativos</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formatSettings.showNegativeAsPositive}
                onChange={() => setFormatSettings({ ...formatSettings, showNegativeAsPositive: !formatSettings.showNegativeAsPositive })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Mostrar como positivos</span>
            </label>
          </div>

          {/* Split by Pos/Neg */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visualização</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formatSettings.splitByPosNeg}
                onChange={() => setFormatSettings({ ...formatSettings, splitByPosNeg: !formatSettings.splitByPosNeg })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Dividir em Créditos/Débitos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Buscar em todos os dados..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium cursor-pointer"
            >
              <Copy size={18} />
              Copiar
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium cursor-pointer"
            >
              <Download size={18} />
              Exportar CSV
            </button>
            <button
              onClick={() => {
                // Simple inline filter - could be expanded with modal later
                const col = prompt("Nome da coluna:");
                if (col) setAdvancedFilters([...advancedFilters, { id: Date.now().toString(), column: col, type: "text", value: "" }]);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium cursor-pointer ${
                advancedFilters.length > 0 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`}
            >
              <Filter size={18} />
              Filtros {advancedFilters.length > 0 && `(${advancedFilters.length})`}
            </button>
            {advancedFilters.length > 0 && (
              <button
                onClick={() => setAdvancedFilters([])}
                className="px-3 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 cursor-pointer"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Applied */}
      {advancedFilters.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-900 text-sm mb-2">
            <strong>Filtros aplicados:</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {advancedFilters.map((filter, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-medium">
                {filter.column} {filter.type === "text" ? "contém" : "="} {String(filter.value)}
                <button onClick={() => setAdvancedFilters(advancedFilters.filter((_, i) => i !== idx))} className="text-blue-600 hover:text-blue-700">
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={Object.values(rowSelection).every(Boolean)}
                    onChange={(e) => {
                      const newSelection: Record<string, boolean> = {};
                      formattedRows.forEach(({ originalIndex }) => {
                        newSelection[originalIndex] = e.target.checked;
                      });
                      setRowSelection(newSelection);
                    }}
                    className="w-4 h-4"
                  />
                </th>
                {visibleColumns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortColumn === col) {
                        setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc");
                        if (sortOrder === "desc") setSortColumn(null);
                      } else {
                        setSortColumn(col);
                        setSortOrder("asc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {col}
                      {sortColumn === col && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formattedRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="px-4 py-6 text-center text-gray-600">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                formattedRows.map(({ formatted, originalIndex }) => (
                  <tr key={originalIndex} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={rowSelection[originalIndex] || false}
                        onChange={(e) => {
                          setRowSelection({ ...rowSelection, [originalIndex]: e.target.checked });
                        }}
                        className="w-4 h-4"
                      />
                    </td>
                    {visibleColumns.map((col) => (
                      <td key={col} className="px-4 py-3 text-gray-700">
                        {formatted[col] !== undefined ? String(formatted[col]) : "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters Modal - Removed, using inline filters only */}
    </div>
  );
}
