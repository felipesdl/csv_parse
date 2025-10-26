"use client";

import React, { useMemo } from "react";
import { ParsedRow } from "@/types";

interface SplitTableViewProps {
  data: ParsedRow[];
  columns: string[];
  valueColumn?: string; // Se não fornecido, tenta detectar automaticamente
  children: (props: { positiveData: ParsedRow[]; negativeData: ParsedRow[]; allData: ParsedRow[] }) => React.ReactNode;
}

/**
 * Componente para dividir dados em positivos e negativos
 * Mantém a lógica de separação centralizada
 */
export function SplitTableView({ data, columns, valueColumn: providedValueColumn, children }: SplitTableViewProps) {
  const { positiveData, negativeData, valueColumn } = useMemo(() => {
    // Detectar coluna de valores se não fornecida
    let targetColumn = providedValueColumn;

    if (!targetColumn) {
      // Procurar por coluna "Valor"
      targetColumn = columns.find((col) => col.toLowerCase() === "valor");

      // Se não encontrar, procurar por qualquer coluna que pareça numérica
      if (!targetColumn) {
        for (const col of columns) {
          const sample = data.slice(0, 5).some((row) => {
            const val = row[col];
            if (!val) return false;
            const strValue = String(val);
            return strValue.includes("-") || /\d+[.,]\d+/.test(strValue);
          });
          if (sample) {
            targetColumn = col;
            break;
          }
        }
      }
    }

    if (!targetColumn) {
      return { positiveData: [], negativeData: [], valueColumn: null };
    }

    const positive: ParsedRow[] = [];
    const negative: ParsedRow[] = [];

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

      if (num > 0) {
        positive.push(row);
      } else if (num < 0) {
        negative.push(row);
      }
    });

    return {
      positiveData: positive,
      negativeData: negative,
      valueColumn: targetColumn,
    };
  }, [data, columns, providedValueColumn]);

  return (
    <>
      {children({
        positiveData,
        negativeData,
        allData: data,
      })}
    </>
  );
}
