/**
 * Utilitários para formatação de dados
 */

import { FormatSettings } from "@/types";

// Re-export for convenience (can import from either @/utils/formatUtils or @/types)
export type { FormatSettings };

/**
 * Detecta se uma string é uma data
 */
export function isDateValue(value: string): boolean {
  if (!value) return false;

  const trimmed = value.trim();

  // Detecta formato dd/mm/yyyy ou dd/mm/yyyy hh:mm:ss
  if (/^\d{1,2}\/\d{1,2}\/\d{4}(\s\d{1,2}:\d{2}(:\d{2})?)?$/.test(trimmed)) {
    return true;
  }

  // Detecta formato português localizado: "Dia da semana, DD de Mês de YYYY" ou "DD de Mês de YYYY"
  // Ex: "Terça, 23 de setembro de 2025" ou "16 de setembro de 2025"
  if (/(?:[A-Za-z]+,?)?\s*\d{1,2}\s+de\s+[A-Za-z]+\s+de\s+\d{4}/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Parseia um valor em formato brasileiro (com espaços, R$, vírgula decimal)
 * Exemplo: "R$           646,00" -> 646.00
 * Exemplo: "-1.234,56" -> -1234.56
 * @returns Número parseado ou 0 se inválido
 */
export function parseValueBR(valor: string | number): number {
  if (valor === null || valor === undefined || valor === "") return 0;

  // Remove "R$", espaços extras, etc
  let cleaned = String(valor)
    .replace(/R\$/g, "")
    .trim()
    .replace(/\s+/g, "") // Remove todos os espaços
    .replace(/\./g, "") // Remove separador de milhares
    .replace(",", "."); // Converte vírgula em ponto

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Detecta se uma string é um número (com ou sem símbolo monetário)
 */
export function isNumericValue(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();

  // Remove símbolos monetários e espaços
  let cleaned = trimmed.replace(/[R$€£¥\s]/g, "");

  // Formato brasileiro: 1.234.567,89
  // Padrão: remove pontos (separadores de milhar) e converte vírgula em ponto
  cleaned = cleaned
    .replace(/\./g, "") // Remove pontos (separadores de milhar)
    .replace(/,/g, "."); // Converte vírgula em ponto (separador decimal)

  return cleaned.length > 0 && !isNaN(Number(cleaned));
}

/**
 * Extrai o número de uma string que pode conter símbolo monetário
 * Mantém o sinal negativo se existir
 * Formato esperado: "R$ -1.234,56" (brasileiro) ou "$ -1,234.56" (americano)
 */
export function extractNumericValue(value: string): number {
  const strValue = String(value);

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

  return num;
}

/**
 * Formata uma data de acordo com a preferência do usuário
 * @param dateStr String no formato "dd/mm/yyyy" ou "dd/mm/yyyy hh:mm:ss" ou "Dia, DD de Mês de YYYY"
 * @param format "full" | "date-only" | "day-only"
 */
export function formatDate(dateStr: string, format: "full" | "date-only" | "day-only"): string {
  if (!dateStr) return "";

  const trimmed = dateStr.trim();

  // Mapa de meses em português (com suporte a variações)
  const monthMap: Record<string, string> = {
    janeiro: "01",
    fevereiro: "02",
    março: "03",
    abril: "04",
    maio: "05",
    junho: "06",
    julho: "07",
    agosto: "08",
    setembro: "09",
    outubro: "10",
    novembro: "11",
    dezembro: "12",
  };

  // Detecta formato português localizado: "Dia, DD de Mês de YYYY" ou "DD de Mês de YYYY"
  // Ex: "Quarta, 24 de setembro de 2025" ou "Terça, 23 de setembro de 2025" ou "16 de setembro de 2025"
  // Regex mais flexível que aceita ou não o dia da semana
  const localizedMatch = trimmed.match(/(?:[A-Za-z]+,?)?\s*(\d{1,2})\s+de\s+([A-Za-z]+)\s+de\s+(\d{4})/i);

  if (localizedMatch) {
    const day = localizedMatch[1].padStart(2, "0");
    const monthName = localizedMatch[2].toLowerCase();
    const year = localizedMatch[3];
    const monthNum = monthMap[monthName] || "01";

    if (format === "day-only") {
      return day;
    }

    if (format === "date-only") {
      return `${day}/${monthNum}/${year}`;
    }

    // format === "full" - retorna completo
    return trimmed;
  }

  // Formato padrão dd/mm/yyyy ou dd/mm/yyyy hh:mm:ss
  if (format === "day-only") {
    // Extrai apenas o dia (dd)
    const match = trimmed.match(/^(\d{1,2})/);
    return match ? match[1] : trimmed;
  }

  if (format === "date-only") {
    // Extrai apenas a data (dd/mm/yyyy), remove hora
    const match = trimmed.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
    return match ? match[1] : trimmed;
  }

  // format === "full" - retorna completo (dd/mm/yyyy hh:mm:ss)
  return trimmed;
}

/**
 * Formata um valor numérico
 * @param value String ou número (pode conter R$, símbolos, etc)
 * @param showAsPositive Se true, converte negativos em positivos
 * @param splitByPosNeg Se true, usa colunas separadas (Crédito/Débito)
 */
export function formatNumeric(value: string | number, showAsPositive: boolean, splitByPosNeg?: boolean): string {
  const strValue = String(value);
  const num = extractNumericValue(strValue);

  if (isNaN(num)) return strValue;

  // Se deve mostrar como positivo e o valor é negativo
  if (showAsPositive && num < 0) {
    // Remove o sinal negativo de QUALQUER lugar na string
    // A regex busca por um "-" seguido por dígitos e remove apenas o "-"
    const result = strValue.replace(/-(?=\d)/, "");
    return result;
  }

  // Retorna o valor original se não precisa mudar
  return strValue;
}

/**
 * Formata um valor genérico
 */
export function formatValue(value: string | number, settings: FormatSettings): string {
  if (!value) return "";

  const strValue = String(value).trim();

  // Verifica se é data
  if (isDateValue(strValue)) {
    return formatDate(strValue, settings.dateFormat);
  }

  // Verifica se é número
  if (isNumericValue(strValue)) {
    return formatNumeric(strValue, settings.showNegativeAsPositive, settings.splitByPosNeg);
  }

  // Retorna como está
  return strValue;
}
