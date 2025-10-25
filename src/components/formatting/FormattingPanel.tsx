"use client";

import { useDataStore } from "@/store/dataStore";
import { Settings } from "lucide-react";

export function FormattingPanel() {
  const { formatSettings, setFormatSettings, tableData } = useDataStore();

  // Check if there are date or numeric columns
  const hasDateOrNumericColumns = tableData?.rows.some((row) => {
    return Object.entries(row).some(([colName, value]) => {
      if (!value) return false;
      const strValue = String(value).trim();
      // Check if it looks like a date
      if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(strValue)) return true;
      // Check if it's a number (including negative)
      if (!isNaN(Number(strValue))) return true;
      return false;
    });
  });

  if (!hasDateOrNumericColumns) return null;

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
        </div>
      </div>
    </div>
  );
}
