"use client";

import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { ParsedRow } from "@/types";

interface ColumnFilter {
  id: string;
  column: string;
  type: "text" | "number" | "select";
  values?: string[];
  value?: string | number;
}

interface ValueDistributionChartProps {
  data: (ParsedRow & { isDuplicate?: boolean })[];
  advancedFilters: ColumnFilter[];
}

export function ValueDistributionChart({ data, advancedFilters }: ValueDistributionChartProps) {
  const [chartType, setChartType] = useState<"positive_negative" | "custom">("positive_negative");
  const [customColumn, setCustomColumn] = useState<string | null>(null);

  // Detectar colunas numéricas
  const numericColumns = useMemo(() => {
    if (data.length === 0) return [];

    const columns: string[] = [];
    const firstRow = data[0];

    for (const column in firstRow) {
      if (column === "isDuplicate") continue;

      const sample = data.slice(0, 10).map((row) => {
        const val = row[column];
        if (val === null || val === undefined) return null;

        const strValue = String(val);

        // Detecta se é negativo (pode ter - em qualquer lugar)
        const isNegative = strValue.includes("-");

        // Remove símbolos monetários e espaços
        let cleaned = strValue.replace(/[R$€£¥\s]/g, "");

        // Remove o sinal negativo (será replicado depois)
        cleaned = cleaned.replace("-", "");

        // Formato brasileiro: remove pontos (milhares) e converte vírgula em ponto
        cleaned = cleaned
          .replace(/\./g, "") // Remove pontos (separadores de milhar)
          .replace(/,/g, "."); // Converte vírgula em ponto (separador decimal)

        let num = Number(cleaned) || 0;

        // Reaplica o sinal negativo se existia
        if (isNegative && num > 0) {
          num = -num;
        }

        return isNaN(num) ? null : num;
      });

      if (sample.some((v) => v !== null)) {
        columns.push(column);
      }
    }

    return columns;
  }, [data]);

  // Calcular distribuição de valores
  const chartData = useMemo(() => {
    if (chartType === "positive_negative") {
      // Considerar a primeira coluna numérica ou a coluna "Valor"
      let targetColumn = "Valor";
      if (!data[0]?.[targetColumn]) {
        targetColumn = numericColumns[0] || "";
      }

      if (!targetColumn || data.length === 0) return [];

      let positives = 0;
      let negatives = 0;
      let zero = 0;

      data.forEach((row) => {
        const val = row[targetColumn];
        if (val === null || val === undefined) return;

        const strValue = String(val);

        // Detecta se é negativo (pode ter - em qualquer lugar)
        const isNegative = strValue.includes("-");

        // Remove símbolos monetários e espaços
        let cleaned = strValue.replace(/[R$€£¥\s]/g, "");

        // Remove o sinal negativo (será replicado depois)
        cleaned = cleaned.replace("-", "");

        // Formato brasileiro: remove pontos (milhares) e converte vírgula em ponto
        cleaned = cleaned
          .replace(/\./g, "") // Remove pontos (separadores de milhar)
          .replace(/,/g, "."); // Converte vírgula em ponto (separador decimal)

        let num = Number(cleaned) || 0;

        // Reaplica o sinal negativo se existia
        if (isNegative && num > 0) {
          num = -num;
        }

        if (!isNaN(num)) {
          if (num > 0) positives += num;
          else if (num < 0) negatives += Math.abs(num);
          else zero += num;
        }
      });

      const total = positives + negatives + zero;
      if (total === 0) return [];

      return [
        {
          name: "Positivos",
          value: Math.round((positives / total) * 100),
          amount: positives,
        },
        {
          name: "Negativos",
          value: Math.round((negatives / total) * 100),
          amount: negatives,
        },
        ...(zero > 0
          ? [
              {
                name: "Zero",
                value: Math.round((zero / total) * 100),
                amount: zero,
              },
            ]
          : []),
      ].filter((item) => item.value > 0);
    } else if (chartType === "custom" && customColumn) {
      // Distribuição por valores únicos de uma coluna
      const distribution: Record<string, number> = {};

      data.forEach((row) => {
        const val = String(row[customColumn] || "Sem valor");
        distribution[val] = (distribution[val] || 0) + 1;
      });

      return Object.entries(distribution)
        .map(([name, count]) => ({
          name,
          value: count,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }

    return [];
  }, [data, chartType, customColumn, numericColumns]);

  const COLORS = [
    "#10b981", // green
    "#ef4444", // red
    "#f59e0b", // amber
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
    "#06b6d4", // cyan
    "#84cc16", // lime
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          {chartType === "positive_negative" && data.amount ? (
            <p className="text-sm text-gray-700">
              {data.amount > 0
                ? `R$ ${data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                : `R$ -${Math.abs(data.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </p>
          ) : (
            <p className="text-sm text-gray-700">{data.value} item(s)</p>
          )}
          <p className="text-xs text-gray-500">{data.value}%</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200 p-4">
        <p className="text-gray-500 text-sm text-center">Nenhum dado disponível para gráfico</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Seletores */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setChartType("positive_negative")}
          className={`px-3 py-1.5 rounded text-sm font-medium transition cursor-pointer whitespace-nowrap ${
            chartType === "positive_negative" ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Pos/Neg
        </button>

        {numericColumns.length > 0 && (
          <button
            onClick={() => {
              setChartType("custom");
              if (!customColumn && numericColumns.length > 0) {
                setCustomColumn(numericColumns[0]);
              }
            }}
            className={`px-3 py-1.5 rounded text-sm font-medium transition cursor-pointer whitespace-nowrap ${
              chartType === "custom" ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Por Coluna
          </button>
        )}
      </div>

      {/* Seletor de Coluna para Custom */}
      {chartType === "custom" && numericColumns.length > 0 && (
        <div className="mb-4">
          <select
            value={customColumn || ""}
            onChange={(e) => setCustomColumn(e.target.value || null)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {numericColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Gráfico */}
      <div className="flex-1 flex items-center justify-center min-h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-xs text-center">Nenhum dado para exibir</p>
        )}
      </div>
    </div>
  );
}
