import { ParsedRow } from "@/types";
import { FormatSettings, formatValue, isDateValue, isNumericValue } from "@/utils/formatUtils";
import Papa from "papaparse";

export function exportToCSV(
  rows: ParsedRow[],
  columns: string[],
  filename: string = "export.csv",
  delimiter: string = ";",
  formatSettings?: FormatSettings
): void {
  // Se não tiver formatSettings, use os padrões
  const settings = formatSettings || {
    dateFormat: "full" as const,
    showNegativeAsPositive: false,
    splitByPosNeg: false,
  };

  // Aplicar formatação aos dados
  const formattedRows = rows.map((row) => {
    const formattedRow: ParsedRow = {};
    for (const col of columns) {
      const value = row[col] ?? "";
      formattedRow[col] = formatValue(String(value), settings);
    }
    return formattedRow;
  });

  const csv = Papa.unparse(formattedRows, {
    header: true,
    columns,
    delimiter,
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyToClipboard(rows: ParsedRow[], columns: string[], delimiter: string = "\t", formatSettings?: FormatSettings): Promise<boolean> {
  try {
    // Se não tiver formatSettings, use os padrões
    const settings = formatSettings || {
      dateFormat: "full" as const,
      showNegativeAsPositive: false,
      splitByPosNeg: false,
    };

    // Criar header
    const header = columns.join(delimiter);

    // Criar linhas com formatação
    const lines = rows.map((row) => {
      return columns
        .map((col) => {
          const value = row[col] ?? "";
          const strValue = formatValue(String(value), settings);

          // Se contém delimiter ou aspas, envolver em aspas e escapar
          if (strValue.includes(delimiter) || strValue.includes('"') || strValue.includes("\n")) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        })
        .join(delimiter);
    });

    const fullText = [header, ...lines].join("\n");

    await navigator.clipboard.writeText(fullText);
    return true;
  } catch (error) {
    console.error("Erro ao copiar para clipboard:", error);
    return false;
  }
}

export function getVisibleColumns(columns: string[], columnSettings: { name: string; visible: boolean; order: number }[]): string[] {
  return columns
    .filter((col) => {
      const setting = columnSettings.find((s) => s.name === col);
      return setting ? setting.visible : true;
    })
    .sort((a, b) => {
      const orderA = columnSettings.find((s) => s.name === a)?.order ?? 0;
      const orderB = columnSettings.find((s) => s.name === b)?.order ?? 0;
      return orderA - orderB;
    });
}

export function generateTableSummary(rows: ParsedRow[], columns: string[]): string {
  const summary = {
    totalRows: rows.length,
    totalColumns: columns.length,
    timestamp: new Date().toLocaleString("pt-BR"),
  };

  return `Resumo da Tabela\n${"=".repeat(30)}\nTotal de linhas: ${summary.totalRows}\nTotal de colunas: ${summary.totalColumns}\nData/Hora: ${
    summary.timestamp
  }`;
}

// Copiar dados SEM cabeçalhos (apenas valores)
export async function copyToClipboardWithoutHeaders(
  rows: ParsedRow[],
  columns: string[],
  delimiter: string = "\t",
  formatSettings?: FormatSettings
): Promise<boolean> {
  try {
    const settings = formatSettings || {
      dateFormat: "full" as const,
      showNegativeAsPositive: false,
      splitByPosNeg: false,
    };

    // Criar linhas com formatação (SEM HEADER)
    const lines = rows.map((row) => {
      return columns
        .map((col) => {
          const value = row[col] ?? "";
          const strValue = formatValue(String(value), settings);

          if (strValue.includes(delimiter) || strValue.includes('"') || strValue.includes("\n")) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        })
        .join(delimiter);
    });

    const fullText = lines.join("\n");
    await navigator.clipboard.writeText(fullText);
    return true;
  } catch (error) {
    console.error("Erro ao copiar para clipboard:", error);
    return false;
  }
}

// Copiar uma coluna inteira
export async function copyColumnToClipboard(rows: ParsedRow[], columnName: string, formatSettings?: FormatSettings): Promise<boolean> {
  try {
    const settings = formatSettings || {
      dateFormat: "full" as const,
      showNegativeAsPositive: false,
      splitByPosNeg: false,
    };

    // Extrair valores da coluna com formatação
    const values = rows.map((row) => {
      const value = row[columnName] ?? "";
      return formatValue(String(value), settings);
    });

    const fullText = values.join("\n");
    await navigator.clipboard.writeText(fullText);
    return true;
  } catch (error) {
    console.error("Erro ao copiar coluna para clipboard:", error);
    return false;
  }
}
