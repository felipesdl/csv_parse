"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useComparisonStore } from "@/store/comparisonStore";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";
import { Eye, EyeOff, Settings } from "lucide-react";
import { formatBankReference } from "@/utils/referenceFormatter";
import { formatValue as formatUtilValue, FormatSettings as UtilFormatSettings } from "@/utils/formatUtils";
import { extractNumericValue } from "@/utils/formatUtils";

// Função para limpar e parsear valores em formato brasileiro
function parseValueBR(valor: string | number): number {
  if (valor === null || valor === undefined || valor === "") return 0;

  let cleaned = String(valor).replace(/R\$/g, "").trim().replace(/\s+/g, "").replace(/\./g, "").replace(",", ".");

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

interface FormatSettings {
  dateFormat: "full" | "date-only" | "day-only";
  showNegativeAsPositive: boolean;
}

const DEFAULT_FORMAT_SETTINGS: FormatSettings = {
  dateFormat: "date-only",
  showNegativeAsPositive: false,
};

export function ExtractTablesView() {
  const { comparedFiles } = useComparisonStore();
  const [searchValue, setSearchValue] = useState("");
  const [formatSettings, setFormatSettings] = useState<FormatSettings>(DEFAULT_FORMAT_SETTINGS);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, Record<string, boolean>>>({});

  if (!comparedFiles || comparedFiles.length === 0) {
    return <div className="text-center text-gray-600">Nenhum arquivo carregado</div>;
  }

  // Se 2 ou mais arquivos, mostrar lado a lado
  const showSideBySide = comparedFiles.length >= 2;

  // Inicializar visibleColumns para cada arquivo
  const initializeVisibleColumns = useCallback(
    (fileId: string, columns: string[]) => {
      if (!visibleColumns[fileId]) {
        const newVisible: Record<string, boolean> = {};
        columns.forEach((col) => {
          newVisible[col] = true;
        });
        setVisibleColumns((prev) => ({
          ...prev,
          [fileId]: newVisible,
        }));
      }
    },
    [visibleColumns]
  );

  const toggleColumnVisibility = useCallback((fileId: string, column: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        [column]: !prev[fileId]?.[column],
      },
    }));
  }, []);

  // Função para formatar valor usando a função centralizada
  const formatValue = useCallback(
    (valor: string | number, columnName?: string): string => {
      const strValue = String(valor).trim();

      // Se a coluna é Data, nunca formatar como monetário
      if (columnName === "Data" || columnName === "Data Lançamento" || columnName === "Data de Lançamento") {
        // Tratar como data
        const utilSettings: UtilFormatSettings = {
          dateFormat: formatSettings.dateFormat,
          showNegativeAsPositive: false, // Datas nunca devem ser mostradas como positivas
        };
        return formatUtilValue(strValue, utilSettings);
      }

      // Usar a função de formatação centralizada que suporta todos os formatos
      const utilSettings: UtilFormatSettings = {
        dateFormat: formatSettings.dateFormat,
        showNegativeAsPositive: formatSettings.showNegativeAsPositive,
      };

      // Usa a função centralizada que já trata datas, números, etc
      return formatUtilValue(strValue, utilSettings);
    },
    [formatSettings]
  );

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
        {/* Formatação Panel Local */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-gray-900" />
            <h3 className="font-semibold text-gray-900">Formatação de Dados</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onChange={(e) =>
                      setFormatSettings({
                        ...formatSettings,
                        dateFormat: e.target.value as "full" | "date-only" | "day-only",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Data Completa (15/09/2025 23:59)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dateFormat"
                    value="date-only"
                    checked={formatSettings.dateFormat === "date-only"}
                    onChange={(e) =>
                      setFormatSettings({
                        ...formatSettings,
                        dateFormat: e.target.value as "full" | "date-only" | "day-only",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Data + Hora (15/09/2025)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dateFormat"
                    value="day-only"
                    checked={formatSettings.dateFormat === "day-only"}
                    onChange={(e) =>
                      setFormatSettings({
                        ...formatSettings,
                        dateFormat: e.target.value as "full" | "date-only" | "day-only",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Apenas o Dia (15)</span>
                </label>
              </div>
            </div>

            {/* Negative Values */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valores Negativos</label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded">
                <input
                  type="checkbox"
                  checked={formatSettings.showNegativeAsPositive}
                  onChange={(e) =>
                    setFormatSettings({
                      ...formatSettings,
                      showNegativeAsPositive: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Mostrar valores negativos como positivos</span>
              </label>
              <p className="text-xs text-gray-700 mt-2">
                {formatSettings.showNegativeAsPositive ? "Exemplo: -100 será exibido como 100" : "Exemplo: -100 será exibido como -100"}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar dados</label>
          <input
            type="text"
            placeholder="Buscar em todas as colunas..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Tabelas */}
      <div className={showSideBySide ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-8"}>
        {comparedFiles.map((file) => {
          const bankName = formatBankReference(file.bankId, file.month || "");
          const template = BANK_TEMPLATES[file.bankId];
          const valueCol = template?.valueColumn;

          // TODAS as colunas originais do arquivo
          const allColumns = file.columns;

          // Preparar dados para tabela (usando TODOS os dados originais)
          const tableData = file.data;

          // Inicializar se não existir
          if (!visibleColumns[file.id]) {
            initializeVisibleColumns(file.id, allColumns);
          }

          // Colunas visíveis para este arquivo
          const fileVisibleColumns = allColumns.filter((col) => visibleColumns[file.id]?.[col] !== false);

          // Filtrar dados
          const filteredData = useMemo(() => {
            if (!searchValue) return tableData;

            const searchLower = searchValue.toLowerCase();
            return tableData.filter((row: any) =>
              Object.values(row).some((val) =>
                String(val ?? "")
                  .toLowerCase()
                  .includes(searchLower)
              )
            );
          }, [tableData, searchValue]);

          // Calcular totais
          const totals = useMemo(() => {
            let totalCredito = 0;
            let totalDebito = 0;
            let valorInicial = 0;
            let valorFinal = 0;

            tableData.forEach((row: any, idx: number) => {
              if (valueCol && row[valueCol]) {
                const valor = parseValueBR(row[valueCol]);

                // Valor inicial é o primeiro
                if (idx === 0) {
                  valorInicial = valor;
                }

                // Valor final é o último
                if (idx === tableData.length - 1) {
                  valorFinal = valor;
                }

                // Separar créditos e débitos
                if (valor > 0) {
                  totalCredito += valor;
                } else if (valor < 0) {
                  totalDebito += valor;
                }
              }
            });

            return {
              totalCredito,
              totalDebito,
              valorInicial,
              valorFinal,
              saldoLiquido: totalCredito + totalDebito,
            };
          }, [tableData]);

          return (
            <div key={file.id} className={showSideBySide ? "flex flex-col h-full" : ""}>
              {/* Info Macro */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-green-700 mb-1">Créditos</p>
                  <p className="text-sm font-bold text-green-900">R$ {totals.totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">Débitos</p>
                  <p className="text-sm font-bold text-red-900">R$ {Math.abs(totals.totalDebito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">Valor Inicial</p>
                  <p className="text-sm font-bold text-blue-900">R$ {totals.valorInicial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>

                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: totals.valorFinal >= 0 ? "#f0fdf4" : "#fef2f2",
                    borderColor: totals.valorFinal >= 0 ? "#dcfce7" : "#fee2e2",
                  }}
                >
                  <p className="text-xs font-medium mb-1" style={{ color: totals.valorFinal >= 0 ? "#166534" : "#991b1b" }}>
                    Valor Final
                  </p>
                  <p className="text-sm font-bold" style={{ color: totals.valorFinal >= 0 ? "#166534" : "#991b1b" }}>
                    R$ {totals.valorFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📄 {bankName}</h3>
                    <p className="text-sm text-gray-600">
                      {filteredData.length} de {file.rowCount} registros
                    </p>
                  </div>
                </div>

                {/* Column Visibility Toggle */}
                <div className="flex items-center gap-2 flex-wrap bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                  {allColumns.map((col) => (
                    <button
                      key={col}
                      onClick={() => toggleColumnVisibility(file.id, col)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition whitespace-nowrap cursor-pointer ${
                        visibleColumns[file.id]?.[col] !== false
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-gray-200 text-gray-600 border border-gray-300"
                      }`}
                    >
                      {visibleColumns[file.id]?.[col] !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col ${showSideBySide ? "flex-1" : ""}`}>
                <div className={showSideBySide ? "overflow-y-auto" : "overflow-x-auto"}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        {fileVisibleColumns.map((col) => (
                          <th key={col} className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.slice(0, 50).map((row: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            {fileVisibleColumns.map((col) => {
                              let cellContent = row[col] || "-";
                              cellContent = formatValue(cellContent, col);

                              return (
                                <td key={`${idx}-${col}`} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                  {cellContent}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={fileVisibleColumns.length} className="px-4 py-3 text-center text-gray-500">
                            Nenhum dado encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredData.length > 50 && (
                <p className="text-xs text-gray-500 mt-2">Mostrando 50 de {filteredData.length} registros. Use a página inicial para visualizar todos.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
