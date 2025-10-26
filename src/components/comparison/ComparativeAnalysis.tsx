"use client";

import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useComparisonStore } from "@/store/comparisonStore";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";
import { parseValueBR, COLORS_GENERIC, COLORS_CREDIT, COLORS_DEBIT } from "@/utils";

interface ComparativeAnalysisProps {
  onOpenColumnMapper: () => void;
}

export function ComparativeAnalysis({ onOpenColumnMapper }: ComparativeAnalysisProps) {
  const { comparedFiles, columnMappings } = useComparisonStore();

  const analysisData = useMemo(() => {
    if (comparedFiles.length < 2) return null;

    // Encontrar coluna "Valor" e "Tipo de Transação" em cada arquivo
    const valueColumnMap: Record<string, string> = {};
    const typeColumnMap: Record<string, string> = {};

    for (const file of comparedFiles) {
      // Procurar pela coluna "Valor"
      const valorCol = file.columns.find((col) => col.toLowerCase().includes("valor"));
      if (valorCol) {
        valueColumnMap[file.id] = valorCol;
      }

      // Procurar por tipo de transação (para separar débito/crédito)
      const typeCol = file.columns.find((col) => col.toLowerCase().includes("tipo") || col.toLowerCase().includes("transação"));
      if (typeCol) {
        typeColumnMap[file.id] = typeCol;
      }
    }

    if (Object.keys(valueColumnMap).length === 0) {
      return null; // Sem coluna de valor
    }

    // Calcular totais separados por banco (geral, créditos, débitos)
    const bankStats: Array<{
      name: string;
      fileId: string;
      totalGeral: number;
      totalCredito: number;
      totalDebito: number;
      countCredito: number;
      countDebito: number;
    }> = [];

    for (const file of comparedFiles) {
      const valorCol = valueColumnMap[file.id];
      const typeCol = typeColumnMap[file.id];
      if (!valorCol) continue;

      let totalGeral = 0;
      let totalCredito = 0;
      let totalDebito = 0;
      let countCredito = 0;
      let countDebito = 0;

      for (const row of file.data) {
        const valorStr = row[valorCol];
        const valor = parseValueBR(valorStr);

        if (valor === 0) continue;

        totalGeral += valor;

        // Determinar se é crédito ou débito
        if (typeCol && row[typeCol]) {
          const tipoStr = String(row[typeCol]).toUpperCase();
          if (tipoStr.includes("CRÉDITO")) {
            totalCredito += valor;
            countCredito++;
          } else if (tipoStr.includes("DÉBITO")) {
            totalDebito += valor;
            countDebito++;
          }
        } else {
          // Se não tem coluna de tipo, usa o sinal do valor
          if (valor > 0) {
            totalCredito += valor;
            countCredito++;
          } else {
            totalDebito += valor;
            countDebito++;
          }
        }
      }

      const bankName = BANK_TEMPLATES[file.bankId]?.name || file.bankId;

      bankStats.push({
        name: bankName,
        fileId: file.id,
        totalGeral,
        totalCredito,
        totalDebito,
        countCredito,
        countDebito,
      });
    }

    // Dados para gráfico comparativo (créditos vs débitos)
    const comparisonChartData = bankStats.map((item) => ({
      name: item.name,
      Créditos: item.totalCredito,
      Débitos: Math.abs(item.totalDebito),
    }));

    // Dados para pie chart de distribuição
    const creditDistributionData = bankStats.map((item) => ({
      name: item.name,
      value: item.totalCredito,
    }));

    const debitDistributionData = bankStats.map((item) => ({
      name: item.name,
      value: Math.abs(item.totalDebito),
    }));

    return {
      bankStats,
      comparisonChartData,
      creditDistributionData,
      debitDistributionData,
      hasData: bankStats.length > 0,
    };
  }, [comparedFiles, columnMappings]);

  if (!analysisData || !analysisData.hasData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-600 mb-4">📊 Nenhuma coluna "Valor" encontrada para comparação</p>
        <button onClick={onOpenColumnMapper} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition">
          Configurar Mapeamento de Colunas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparação Créditos vs Débitos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Comparação: Créditos vs Débitos</h3>
          <button onClick={onOpenColumnMapper} className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition">
            ⚙️ Configurar Colunas
          </button>
        </div>

        {/* Stacked Bar Chart - Créditos vs Débitos */}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analysisData.comparisonChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => (typeof value === "number" ? `R$ ${Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : value)}
            />
            <Legend />
            <Bar dataKey="Créditos" fill="#22c55e" />
            <Bar dataKey="Débitos" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribuição de Créditos e Débitos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição por Banco</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Créditos */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Créditos</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysisData.creditDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => `${name}: R$ ${(value as number).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
                  outerRadius={80}
                  fill="#22c55e"
                  dataKey="value"
                >
                  {analysisData.creditDistributionData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS_CREDIT[index % COLORS_CREDIT.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => (typeof value === "number" ? `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Débitos */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Débitos</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysisData.debitDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => `${name}: R$ ${(value as number).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
                  outerRadius={80}
                  fill="#ef4444"
                  dataKey="value"
                >
                  {analysisData.debitDistributionData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS_DEBIT[index % COLORS_DEBIT.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => (typeof value === "number" ? `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela Detalhada - Créditos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Análise de Créditos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-green-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Banco</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Crédito</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantidade</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor Médio</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.bankStats.map((stat) => {
                const avgCredito = stat.countCredito > 0 ? stat.totalCredito / stat.countCredito : 0;
                return (
                  <tr key={stat.fileId} className="border-b border-gray-100 hover:bg-green-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{stat.name}</td>
                    <td className="text-right py-3 px-4 text-green-700 font-semibold">
                      R$ {stat.totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">{stat.countCredito}</td>
                    <td className="text-right py-3 px-4 text-gray-600">R$ {avgCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela Detalhada - Débitos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📉 Análise de Débitos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-red-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Banco</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Débito</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantidade</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor Médio</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.bankStats.map((stat) => {
                const avgDebito = stat.countDebito > 0 ? Math.abs(stat.totalDebito) / stat.countDebito : 0;
                return (
                  <tr key={stat.fileId} className="border-b border-gray-100 hover:bg-red-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{stat.name}</td>
                    <td className="text-right py-3 px-4 text-red-700 font-semibold">
                      R$ {Math.abs(stat.totalDebito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">{stat.countDebito}</td>
                    <td className="text-right py-3 px-4 text-gray-600">R$ {avgDebito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo Consolidado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Resumo Consolidado</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Banco</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Geral</th>
                <th className="text-right py-3 px-4 font-semibold text-green-700">Créditos</th>
                <th className="text-right py-3 px-4 font-semibold text-red-700">Débitos</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Saldo Líquido</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.bankStats.map((stat) => {
                const saldoLiquido = stat.totalCredito + stat.totalDebito;
                return (
                  <tr key={stat.fileId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{stat.name}</td>
                    <td className="text-right py-3 px-4 text-gray-900 font-semibold">
                      R$ {stat.totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4 text-green-700 font-semibold">
                      R$ {stat.totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4 text-red-700 font-semibold">
                      R$ {Math.abs(stat.totalDebito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold" style={{ color: saldoLiquido >= 0 ? "#16a34a" : "#dc2626" }}>
                      R$ {saldoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
