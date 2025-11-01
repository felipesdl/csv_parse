import { useMemo } from "react";
import { type ComparedFile } from "@/store/comparisonStore";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";
import { parseValueBR } from "@/utils/formatUtils";

export interface FileStats {
  totalCredito: number;
  totalDebito: number;
  saldoLiquido: number;
  dataInicial: string | null;
  dataFinal: string | null;
  countCredito: number;
  countDebito: number;
}

/**
 * Parseia uma data no formato dd/mm/yyyy
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Calcula as estatísticas financeiras de um arquivo
 * @param file - Arquivo a ser analisado
 * @param valueColumnName - Nome da coluna de valor (opcional, padrão: "Valor")
 * @returns Estatísticas do arquivo
 */
export function calculateFileStats(file: ComparedFile, valueColumnName: string = "Valor"): FileStats {
  const template = BANK_TEMPLATES[file.bankId];
  const typeCol = template?.typeColumn;
  const dateCol = template?.dateColumn;

  let fileCredito = 0;
  let fileDebito = 0;
  let fileCountCredito = 0;
  let fileCountDebito = 0;
  let dates: Date[] = [];

  for (const row of file.data) {
    const valor = parseValueBR(row[valueColumnName]);

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
      // Sem coluna de tipo, usa o sinal do valor
      if (valor > 0) {
        fileCredito += valor;
        fileCountCredito++;
      } else {
        fileDebito += valor;
        fileCountDebito++;
      }
    }

    // Coletar datas
    if (dateCol && row[dateCol]) {
      const parsedDate = parseDate(row[dateCol]);
      if (parsedDate) {
        dates.push(parsedDate);
      }
    }
  }

  // Ordenar datas e pegar primeira e última
  dates.sort((a, b) => a.getTime() - b.getTime());
  const dataInicial = dates.length > 0 ? dates[0].toLocaleDateString("pt-BR") : null;
  const dataFinal = dates.length > 0 ? dates[dates.length - 1].toLocaleDateString("pt-BR") : null;

  return {
    totalCredito: fileCredito,
    totalDebito: fileDebito,
    saldoLiquido: fileCredito + fileDebito,
    dataInicial,
    dataFinal,
    countCredito: fileCountCredito,
    countDebito: fileCountDebito,
  };
}

/**
 * Hook para calcular estatísticas de múltiplos arquivos
 * @param files - Lista de arquivos
 * @param valueColumnName - Nome da coluna de valor (opcional)
 * @returns Map com estatísticas de cada arquivo
 */
export function useFileStatistics(files: ComparedFile[], valueColumnName: string = "Valor"): Map<string, FileStats> {
  return useMemo(() => {
    const statsMap = new Map<string, FileStats>();

    files.forEach((file) => {
      try {
        const stats = calculateFileStats(file, valueColumnName);
        statsMap.set(file.id, stats);
      } catch (error) {
        console.error(`Erro ao calcular estatísticas do arquivo ${file.id}:`, error);
      }
    });

    return statsMap;
  }, [files, valueColumnName]);
}
