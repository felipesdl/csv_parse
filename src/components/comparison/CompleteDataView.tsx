"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useComparisonStore } from "@/store/comparisonStore";
import { ParsedRow, ColumnSettings, FormatSettings } from "@/types";
import { formatValue, isNumericValue, extractNumericValue } from "@/utils";
import { ChevronUp, ChevronDown, Copy, Download, Eye, EyeOff, Settings } from "lucide-react";
import { exportToCSV, getVisibleColumns } from "@/lib/exportUtils";
import { useCopyToClipboard } from "@/hooks/useCSVOperations";
import { useToast } from "@/hooks/useToast";
import { formatBankReference } from "@/utils/referenceFormatter";
import type { ColumnFilter } from "../filters/types";

export function CompleteDataView() {
  const { comparedFiles, columnMappings } = useComparisonStore();
  const { success } = useToast();

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

  // Helper function to get the mapped column name for a file
  const getMappedColumnName = useCallback(
    (fileId: string, columnName: string): string | null => {
      // Check if this column is part of a mapping and return the standardName
      for (const [mappedName, fileMap] of Object.entries(columnMappings)) {
        if (fileMap[fileId] === columnName) {
          return mappedName;
        }
      }
      return null;
    },
    [columnMappings]
  );

  // Get list of all mapped columns for a file (to exclude them from unmatched columns)
  const getMappedColumnsForFile = useCallback(
    (fileId: string): Set<string> => {
      const mapped = new Set<string>();
      for (const fileMap of Object.values(columnMappings)) {
        if (fileMap[fileId]) {
          mapped.add(fileMap[fileId]);
        }
      }
      return mapped;
    },
    [columnMappings]
  );

  // Consolidate all data from all files using column mappings
  const consolidatedData = useMemo(() => {
    if (!comparedFiles || comparedFiles.length === 0) {
      return { rows: [], columns: [], banks: [] };
    }

    // Collect all columns: mapped names from columnMappings + unmapped columns
    const allColumns = new Set<string>();
    const banks: string[] = [];

    // Add mapped column names (standardNames)
    Object.keys(columnMappings).forEach((mappedName) => {
      allColumns.add(mappedName);
    });

    // Add unmapped columns from each file
    comparedFiles.forEach((file) => {
      banks.push(formatBankReference(file.bankId, file.month || ""));
      const mappedCols = getMappedColumnsForFile(file.id);

      file.columns.forEach((col) => {
        if (!mappedCols.has(col)) {
          // This column is not mapped, add it as is
          allColumns.add(col);
        }
      });
    });

    // Consolidate rows: map column names and add bank info
    const consolidatedRows: ParsedRow[] = [];
    comparedFiles.forEach((file) => {
      file.data.forEach((row) => {
        const mappedRow: ParsedRow = { Banco: formatBankReference(file.bankId, file.month || "") };

        // Map each value to its mapped column name or original name
        file.columns.forEach((col) => {
          const mappedName = getMappedColumnName(file.id, col);
          if (mappedName) {
            // This column is mapped
            mappedRow[mappedName] = row[col];
          } else {
            // This column is not mapped, use original name
            mappedRow[col] = row[col];
          }
        });

        consolidatedRows.push(mappedRow);
      });
    });

    return {
      rows: consolidatedRows,
      columns: ["Banco", ...Array.from(allColumns).sort()],
      banks,
    };
  }, [comparedFiles, columnMappings, getMappedColumnName, getMappedColumnsForFile]);

  // Initialize column settings
  useMemo(() => {
    if (consolidatedData.columns.length > 0 && columnSettings.length === 0) {
      setColumnSettings(
        consolidatedData.columns.map((col, idx) => ({
          name: col,
          visible: true,
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

  // Format rows (no in-row split here) — formattedRows contains formatted values per row
  const formattedRows = useMemo(() => {
    return processedRows.map(({ row, originalIndex }) => {
      const formatted: ParsedRow = {};
      consolidatedData.columns.forEach((col) => {
        const value = row[col];
        if (col === "Banco") {
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

  // Base visible columns (before any split presentation)
  const baseDisplayColumns = useMemo(() => getVisibleColumns(consolidatedData.columns, columnSettings), [consolidatedData.columns, columnSettings]);

  // Identify the main value column used to split positive/negative (if any)
  const valorColumnKey = useMemo(() => {
    return consolidatedData.columns.find((col) => col.toLowerCase().includes("valor") || col.toLowerCase().includes("amount"));
  }, [consolidatedData.columns]);

  // When splitByPosNeg is enabled and we have a valor column, split rows into positive/negative sets
  const { positiveRows, negativeRows } = useMemo(() => {
    const pos: Array<{ formatted: ParsedRow; originalIndex: number }> = [];
    const neg: Array<{ formatted: ParsedRow; originalIndex: number }> = [];

    if (!formatSettings.splitByPosNeg || !valorColumnKey) {
      return { positiveRows: [], negativeRows: [] };
    }

    formattedRows.forEach(({ formatted, originalIndex }) => {
      const rawVal = String(consolidatedData.rows[originalIndex]?.[valorColumnKey] ?? "");
      const num = extractNumericValue(rawVal);
      if (num > 0) pos.push({ formatted, originalIndex });
      else if (num < 0) neg.push({ formatted, originalIndex });
    });

    return { positiveRows: pos, negativeRows: neg };
  }, [formatSettings.splitByPosNeg, valorColumnKey, formattedRows, consolidatedData.rows]);

  // Copy and export
  const { mutate: copyWithQuery } = useCopyToClipboard();

  const handleCopyToClipboard = useCallback(() => {
    const rowsToExport = formattedRows.map(({ formatted }) => formatted);
    const lines = rowsToExport.map((row) => {
      return baseDisplayColumns
        .map((col: string) => {
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
    copyWithQuery(fullText, { onSuccess: () => success("Copiado para área de transferência!") });
  }, [formattedRows, baseDisplayColumns, copyWithQuery, success]);

  const handleExportCSV = useCallback(() => {
    const rowsToExport = formattedRows.map(({ formatted }) => formatted);
    const filename = `dados_completos_${Date.now()}.csv`;
    exportToCSV(rowsToExport, baseDisplayColumns, filename, ";", formatSettings);
  }, [formattedRows, baseDisplayColumns, formatSettings]);

  const handleColumnSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc");
      if (sortOrder === "desc") setSortColumn(null);
    } else {
      setSortColumn(columnName);
      setSortOrder("asc");
    }
  };

  const toggleColumnVisibility = (columnName: string) => {
    setColumnSettings((prev) => prev.map((col) => (col.name === columnName ? { ...col, visible: !col.visible } : col)));
  };

  // Calculate consolidated macros (totals based on visible/filtered data)
  const macros = useMemo(() => {
    const result = {
      totalRecords: formattedRows.length,
      recordsByBank: {} as Record<string, number>,
      totalCredits: 0,
      totalDebits: 0,
      totalValue: 0,
    };

    // Count records by bank
    formattedRows.forEach(({ formatted }) => {
      const bank = String(formatted.Banco || "");
      result.recordsByBank[bank] = (result.recordsByBank[bank] || 0) + 1;
    });

    // Calculate totals by looking for "Valor" column or similar
    const valorColumn = consolidatedData.columns.find((col) => col.toLowerCase().includes("valor") || col.toLowerCase().includes("amount"));

    if (valorColumn) {
      formattedRows.forEach(({ formatted }) => {
        const value = String(formatted[valorColumn] || "");
        if (value && value !== "—") {
          const numValue = parseFloat(value.replace(/R\$/g, "").trim().replace(/\./g, "").replace(",", "."));

          if (!isNaN(numValue)) {
            result.totalValue += numValue;
            if (numValue > 0) {
              result.totalCredits += numValue;
            } else {
              result.totalDebits += numValue;
            }
          }
        }
      });
    }

    return result;
  }, [formattedRows, consolidatedData.columns]);

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
          <p className="text-xs text-gray-600 mb-1">Colunas Consolidadas</p>
          <p className="text-2xl font-bold text-gray-900">{baseDisplayColumns.length}</p>
        </div>
      </div>

      {/* Macros - Consolidated Totals */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">💰 Totais Consolidados</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Total de Registros</p>
            <p className="text-lg font-bold text-gray-900">{macros.totalRecords}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-medium text-green-700 mb-1">Créditos</p>
            <p className="text-lg font-bold text-green-900">R$ {macros.totalCredits.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-medium text-red-700 mb-1">Débitos</p>
            <p className="text-lg font-bold text-red-900">R$ {Math.abs(macros.totalDebits).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>

          <div
            className="rounded-lg p-3 border"
            style={{
              backgroundColor: macros.totalValue >= 0 ? "#f0fdf4" : "#fef2f2",
              borderColor: macros.totalValue >= 0 ? "#dcfce7" : "#fee2e2",
            }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: macros.totalValue >= 0 ? "#166534" : "#991b1b" }}>
              Saldo Total
            </p>
            <p className="text-lg font-bold" style={{ color: macros.totalValue >= 0 ? "#166534" : "#991b1b" }}>
              R$ {macros.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Records by Bank */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(macros.recordsByBank).map(([bank, count]) => (
            <div key={bank} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-700 mb-1 truncate">{bank}</p>
              <p className="text-lg font-bold text-blue-900">{count} registros</p>
            </div>
          ))}
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
            {advancedFilters.length > 0 && (
              <button
                onClick={() => setAdvancedFilters([])}
                className="px-3 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 cursor-pointer"
              >
                Limpar Filtros ({advancedFilters.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Column Visibility Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-gray-900" />
          <h3 className="font-semibold text-gray-900">Visibilidade de Colunas</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {consolidatedData.columns.map((col) => {
            const setting = columnSettings.find((s) => s.name === col);
            const isVisible = setting?.visible ?? true;
            return (
              <button
                key={col}
                onClick={() => toggleColumnVisibility(col)}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium cursor-pointer transition ${
                  isVisible ? "bg-gray-700 text-white" : "bg-gray-300 text-gray-700"
                }`}
              >
                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                {col}
              </button>
            );
          })}
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
      {formatSettings.splitByPosNeg && valorColumnKey ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive (Créditos) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b">
              <h4 className="font-semibold text-gray-900">Créditos</h4>
              <p className="text-xs text-gray-600">{positiveRows.length} registros</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={positiveRows.length > 0 && positiveRows.every(({ originalIndex }) => rowSelection[originalIndex])}
                        onChange={(e) => {
                          const next = { ...rowSelection } as Record<string, boolean>;
                          positiveRows.forEach(({ originalIndex }) => {
                            next[originalIndex] = e.target.checked;
                          });
                          setRowSelection(next);
                        }}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    {baseDisplayColumns.map((col) => (
                      <th key={col} className="px-4 py-3 text-left font-semibold text-gray-900">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positiveRows.length === 0 ? (
                    <tr>
                      <td colSpan={baseDisplayColumns.length + 1} className="px-4 py-6 text-center text-gray-600">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  ) : (
                    positiveRows.map(({ formatted, originalIndex }) => (
                      <tr key={originalIndex} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={rowSelection[originalIndex] || false}
                            onChange={(e) => setRowSelection({ ...rowSelection, [originalIndex]: e.target.checked })}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        {baseDisplayColumns.map((col) => (
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

          {/* Negative (Débitos) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b">
              <h4 className="font-semibold text-gray-900">Débitos</h4>
              <p className="text-xs text-gray-600">{negativeRows.length} registros</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={negativeRows.length > 0 && negativeRows.every(({ originalIndex }) => rowSelection[originalIndex])}
                        onChange={(e) => {
                          const next = { ...rowSelection } as Record<string, boolean>;
                          negativeRows.forEach(({ originalIndex }) => {
                            next[originalIndex] = e.target.checked;
                          });
                          setRowSelection(next);
                        }}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    {baseDisplayColumns.map((col) => (
                      <th key={col} className="px-4 py-3 text-left font-semibold text-gray-900">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {negativeRows.length === 0 ? (
                    <tr>
                      <td colSpan={baseDisplayColumns.length + 1} className="px-4 py-6 text-center text-gray-600">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  ) : (
                    negativeRows.map(({ formatted, originalIndex }) => (
                      <tr key={originalIndex} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={rowSelection[originalIndex] || false}
                            onChange={(e) => setRowSelection({ ...rowSelection, [originalIndex]: e.target.checked })}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        {baseDisplayColumns.map((col) => (
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
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={Object.values(rowSelection).filter(Boolean).length === formattedRows.length && formattedRows.length > 0}
                      onChange={(e) => {
                        const newSelection: Record<string, boolean> = {};
                        formattedRows.forEach(({ originalIndex }) => {
                          newSelection[originalIndex] = e.target.checked;
                        });
                        setRowSelection(newSelection);
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  {baseDisplayColumns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleColumnSort(col)}
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
                    <td colSpan={baseDisplayColumns.length + 1} className="px-4 py-6 text-center text-gray-600">
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
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      {baseDisplayColumns.map((col) => (
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
      )}
    </div>
  );
}
