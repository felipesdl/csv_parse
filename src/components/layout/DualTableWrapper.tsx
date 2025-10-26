"use client";

import React from "react";
import { ParsedRow } from "@/types";

interface DualTableWrapperProps {
  /**
   * O componente renderizado para mostrar a tabela.
   * Será chamado duas vezes: uma para positivos, outra para negativos
   */
  renderTable: (data: ParsedRow[], label: string) => React.ReactNode;
  positiveData: ParsedRow[];
  negativeData: ParsedRow[];
}

/**
 * Componente wrapper para renderizar duas tabelas lado a lado (horizontalmente)
 * Mantém separação de responsabilidades
 */
export function DualTableWrapper({ renderTable, positiveData, negativeData }: DualTableWrapperProps) {
  const hasPositive = positiveData.length > 0;
  const hasNegative = negativeData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {hasPositive && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h3 className="font-semibold text-gray-900">
              Valores Positivos ({positiveData.length} linha{positiveData.length !== 1 ? "s" : ""})
            </h3>
          </div>
          {renderTable(positiveData, "positive")}
        </div>
      )}

      {hasNegative && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <h3 className="font-semibold text-gray-900">
              Valores Negativos ({negativeData.length} linha{negativeData.length !== 1 ? "s" : ""})
            </h3>
          </div>
          {renderTable(negativeData, "negative")}
        </div>
      )}

      {!hasPositive && !hasNegative && <div className="text-center py-8 text-gray-500 col-span-full">Nenhum dado disponível</div>}
    </div>
  );
}
