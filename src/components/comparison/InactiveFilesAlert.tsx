import React from "react";
import { EyeOff } from "lucide-react";

interface InactiveFilesAlertProps {
  count: number;
  context?: "análise" | "consolidação" | "geral";
}

/**
 * Componente de alerta para indicar arquivos inativos
 * Reutilizável em diferentes contextos
 */
export function InactiveFilesAlert({ count, context = "geral" }: InactiveFilesAlertProps) {
  if (count === 0) return null;

  const contextText = {
    análise: "nesta análise",
    consolidação: "nesta consolidação",
    geral: "no sistema",
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
      <EyeOff size={18} className="text-orange-600 flex-shrink-0" />
      <p className="text-sm text-orange-900">
        <strong>{count}</strong> arquivo(s) inativo(s) não incluído(s) {contextText[context]}
      </p>
    </div>
  );
}
