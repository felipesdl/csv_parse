"use client";

import React, { useMemo } from "react";
import { useComparisonStore } from "@/store/comparisonStore";
import { useColumnMapping } from "@/hooks/useColumnMapping";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";
import { formatBankReference } from "@/utils/referenceFormatter";
import { parseValueBR } from "@/utils/formatUtils";
import { InactiveFilesAlert } from "./InactiveFilesAlert";

interface ConsolidationStats {
  bankName: string;
  bankId: string;
  totalCredito: number;
  totalDebito: number;
  totalGeral: number;
  saldoLiquido: number;
  countCredito: number;
  countDebito: number;
}

export function ConsolidationView() {
  const { comparedFiles } = useComparisonStore();
  const { getMappedColumn } = useColumnMapping();

  const consolidationData = useMemo(() => {
    // Filtrar apenas arquivos ativos
    const activeFiles = comparedFiles?.filter((f) => f.isActive) || [];

    if (activeFiles.length === 0) return null;

    const stats: ConsolidationStats[] = [];
    let totalCredito = 0;
    let totalDebito = 0;
    let countCredito = 0;
    let countDebito = 0;

    for (const file of activeFiles) {
      const template = BANK_TEMPLATES[file.bankId];
      const typeCol = template?.typeColumn;

      // Get the value column using mappings
      const valueCol = getMappedColumn(file.id, "Valor");

      if (!file.data || file.data.length === 0 || !valueCol) continue;

      let fileCredito = 0;
      let fileDebito = 0;
      let fileCountCredito = 0;
      let fileCountDebito = 0;

      for (const row of file.data) {
        const valor = parseValueBR(row[valueCol]);

        if (valor === 0) continue;

        // Determinar se é crédito ou débito
        if (typeCol && row[typeCol]) {
          const tipoStr = String(row[typeCol]).toUpperCase();
          if (tipoStr.includes("CRÉDITO")) {
            fileCredito += valor;
            fileCountCredito++;
          } else if (tipoStr.includes("DÉBITO")) {
            fileDebito += valor;
            fileCountDebito++;
          }
        } else {
          // Se não tem coluna de tipo, usa o sinal do valor
          if (valor > 0) {
            fileCredito += valor;
            fileCountCredito++;
          } else {
            fileDebito += valor;
            fileCountDebito++;
          }
        }
      }

      const bankName = formatBankReference(file.bankId, file.month || "");
      const saldoLiquido = fileCredito + fileDebito;

      stats.push({
        bankName,
        bankId: file.bankId,
        totalCredito: fileCredito,
        totalDebito: fileDebito,
        totalGeral: fileCredito + fileDebito,
        saldoLiquido,
        countCredito: fileCountCredito,
        countDebito: fileCountDebito,
      });

      totalCredito += fileCredito;
      totalDebito += fileDebito;
      countCredito += fileCountCredito;
      countDebito += fileCountDebito;
    }

    return {
      stats,
      totalCredito,
      totalDebito,
      saldoLiquido: totalCredito + totalDebito,
      countCredito,
      countDebito,
    };
  }, [comparedFiles, getMappedColumn]);

  const inactiveFilesCount = comparedFiles?.filter((f) => !f.isActive).length || 0;

  if (!consolidationData || consolidationData.stats.length === 0) {
    return (
      <div className="text-center text-gray-600">
        <p>Nenhum dado para consolidar</p>
        {inactiveFilesCount > 0 && <p className="text-sm text-gray-500 mt-2">{inactiveFilesCount} arquivo(s) inativo(s) não incluído(s)</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Aviso de arquivos inativos */}
      <InactiveFilesAlert count={inactiveFilesCount} context="consolidação" />
      {/* Conteúdo para exportação */}
      <div id="consolidation-content" className="grid gap-8">
        {/* Resumo Consolidado por Banco */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Consolidação por Banco</h3>
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Banco</th>
                  <th className="text-right px-4 py-3 font-semibold text-green-700">💚 Créditos</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Registros</th>
                  <th className="text-right px-4 py-3 font-semibold text-red-700">❤️ Débitos</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Registros</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Saldo Líquido</th>
                </tr>
              </thead>
              <tbody>
                {consolidationData.stats.map((stat) => (
                  <tr key={stat.bankId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{stat.bankName}</td>
                    <td className="text-right px-4 py-3 text-green-700 font-semibold">
                      R$ {stat.totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right px-4 py-3 text-gray-600">{stat.countCredito}</td>
                    <td className="text-right px-4 py-3 text-red-700 font-semibold">
                      R$ {Math.abs(stat.totalDebito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right px-4 py-3 text-gray-600">{stat.countDebito}</td>
                    <td className="text-right px-4 py-3 font-semibold" style={{ color: stat.saldoLiquido >= 0 ? "#16a34a" : "#dc2626" }}>
                      R$ {stat.saldoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totais Consolidados */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Total Consolidado</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Card Créditos */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-sm font-medium text-green-700 mb-2">💚 Total de Créditos</p>
              <p className="text-2xl font-bold text-green-900">R$ {consolidationData.totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-green-700 mt-2">{consolidationData.countCredito} transações</p>
            </div>

            {/* Card Débitos */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-sm font-medium text-red-700 mb-2">❤️ Total de Débitos</p>
              <p className="text-2xl font-bold text-red-900">
                R$ {Math.abs(consolidationData.totalDebito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-red-700 mt-2">{consolidationData.countDebito} transações</p>
            </div>

            {/* Card Saldo Líquido */}
            <div
              className="rounded-lg p-6 border"
              style={{
                backgroundColor: consolidationData.saldoLiquido >= 0 ? "#f0fdf4" : "#fef2f2",
                borderColor: consolidationData.saldoLiquido >= 0 ? "#dcfce7" : "#fee2e2",
              }}
            >
              <p className="text-sm font-medium mb-2" style={{ color: consolidationData.saldoLiquido >= 0 ? "#166534" : "#991b1b" }}>
                💵 Saldo Líquido
              </p>
              <p className="text-2xl font-bold" style={{ color: consolidationData.saldoLiquido >= 0 ? "#166534" : "#991b1b" }}>
                R$ {consolidationData.saldoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs mt-2" style={{ color: consolidationData.saldoLiquido >= 0 ? "#15803d" : "#b91c1c" }}>
                {consolidationData.saldoLiquido >= 0 ? "Superávit" : "Déficit"}
              </p>
            </div>

            {/* Card Total Geral (módulo) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-sm font-medium text-blue-700 mb-2">📈 Movimentação Total</p>
              <p className="text-2xl font-bold text-blue-900">
                R$ {(consolidationData.totalCredito + Math.abs(consolidationData.totalDebito)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-blue-700 mt-2">{consolidationData.countCredito + consolidationData.countDebito} transações</p>
            </div>
          </div>
        </div>

        {/* Detalhes por Banco */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Detalhes por Banco</h3>
          <div className="space-y-4">
            {consolidationData.stats.map((stat) => (
              <div key={stat.bankId} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{stat.bankName}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Créditos</p>
                    <p className="text-lg font-bold text-green-700">R$ {stat.totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500">{stat.countCredito} tx</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Débitos</p>
                    <p className="text-lg font-bold text-red-700">R$ {Math.abs(stat.totalDebito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500">{stat.countDebito} tx</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Saldo Líquido</p>
                    <p className="text-lg font-bold" style={{ color: stat.saldoLiquido >= 0 ? "#16a34a" : "#dc2626" }}>
                      R$ {stat.saldoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">{stat.saldoLiquido >= 0 ? "Superávit" : "Déficit"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-lg font-bold text-blue-700">R$ {stat.totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500">{stat.countCredito + stat.countDebito} tx</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>{" "}
      {/* Fim do conteúdo para exportação */}
    </div>
  );
}
