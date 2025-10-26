"use client";

import { useDataStore } from "@/store/dataStore";
import { Settings } from "lucide-react";

export function FormattingPanel() {
  const { formatSettings, setFormatSettings, tableData } = useDataStore();

  // Check if there are date or numeric columns
  // More robust check: looks for dates, numbers in Brazilian format, or just has data with a Valor column
  const hasDateOrNumericColumns = tableData?.rows.some((row) => {
    return Object.entries(row).some(([colName, value]) => {
      if (!value) return false;
      const strValue = String(value).trim();

      // Check if it looks like a date (DD/MM/YYYY or D/M/YYYY)
      if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(strValue)) return true;

      // Check if it's a number (including negative, Brazilian format with comma)
      if (!isNaN(Number(strValue))) return true;

      // Check for Brazilian currency format (1.250,00 or -245,50)
      if (/^-?\d+(\.\d{3})*,\d{2}$/.test(strValue)) return true;

      return false;
    });
  });

  // Show panel if there's data with dates/numbers, or if there are any rows (fallback)
  if (!tableData?.rows || tableData.rows.length === 0) return null;

  // Always show if there's a Valor column (standard for our format) or if we detected dates/numbers
  const hasValorColumn = tableData?.columns?.includes("Valor");
  if (!hasDateOrNumericColumns && !hasValorColumn) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
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
              onChange={(e) => setFormatSettings({ showNegativeAsPositive: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Mostrar valores negativos como positivos</span>
          </label>
          <p className="text-xs text-gray-700 mt-2">
            {formatSettings.showNegativeAsPositive ? "Exemplo: -100 será exibido como 100" : "Exemplo: -100 será exibido como -100"}
          </p>

          {/* Split by Positive/Negative */}
          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded mt-3">
            <input
              type="checkbox"
              checked={formatSettings.splitByPosNeg}
              onChange={(e) => setFormatSettings({ splitByPosNeg: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Dividir tabela em positivos e negativos</span>
          </label>
          <p className="text-xs text-gray-700 mt-2">
            {formatSettings.splitByPosNeg ? "Tabela será exibida em duas seções" : "Tabela será exibida normalmente"}
          </p>
        </div>
      </div>
    </div>
  );
}
