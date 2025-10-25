import Papa from "papaparse";
import { ParsedRow, ValidationError, TableData } from "@/types";
import { detectBankFromContent, getTemplateByBank, detectMonthFromData, detectDelimiter, BANK_TEMPLATES } from "./bankTemplates";

/**
 * Remove linhas de metadados (linhas antes do cabeçalho real)
 * Estratégia: encontrar a primeira linha que parece ser o cabeçalho
 * O cabeçalho real tem características específicas
 */
function cleanMetadataLines(content: string, delimiter: string): string {
  const lines = content.split("\n");

  // Palavras-chave que indicam cabeçalho real (coloque as mais prováveis)
  const headerKeywords = ["data", "lançamento", "histórico", "descrição", "valor", "saldo", "referência", "tipo", "transação"];

  // Características de um cabeçalho legítimo
  const isRealHeader = (line: string): boolean => {
    const normalizedLine = line.toLowerCase();

    // Deve conter pelo menos 2 das palavras-chave
    const matchCount = headerKeywords.filter((kw) => normalizedLine.includes(kw)).length;
    if (matchCount >= 2) return true;

    // Ou ter 3+ colunas (separadas pelo delimiter)
    const columnCount = (line.match(new RegExp(`\\${delimiter}`, "g")) || []).length + 1;
    if (columnCount >= 3) return true;

    return false;
  };

  // Características de uma linha de dados
  const isDataLine = (line: string): boolean => {
    const normalizedLine = line.toLowerCase();

    // Deve começar com uma data no formato dd/mm/yyyy ou conter números
    if (/^\d{2}\/\d{2}\/\d{4}/.test(normalizedLine)) return true;

    // Ou ter muitas colunas com dados variados
    const parts = line.split(delimiter);
    if (parts.length >= 3) {
      // Verificar se tem números (valores)
      const hasNumbers = parts.some((p) => /\d/.test(p));
      // Verificar se tem texto (descrição)
      const hasText = parts.some((p) => /[a-z]/i.test(p));
      if (hasNumbers && hasText) return true;
    }

    return false;
  };

  let headerIndex = -1;
  let dataIndex = -1;

  // Procurar pelo padrão: HEADER + DADOS
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Pular linhas vazias

    // Se encontrou header, procurar por dados após ele
    if (headerIndex === -1 && isRealHeader(line)) {
      headerIndex = i;
      // Procurar por dados após este header
      for (let j = i + 1; j < lines.length; j++) {
        const dataLine = lines[j].trim();
        if (dataLine && isDataLine(dataLine)) {
          dataIndex = j;
          break;
        }
      }
    }

    // Se encontrou header e dados, pode parar
    if (headerIndex > -1 && dataIndex > -1) break;
  }

  // Se encontrou um header válido, retornar do header em diante
  if (headerIndex >= 0) {
    return lines.slice(headerIndex).join("\n");
  }

  // Se não encontrou, retornar original
  return content;
}

/**
 * Fazer parsing de CSV a partir de uma string
 */
function parseCSVFromString(content: string, delimiter: string): Promise<{ rows: ParsedRow[]; columns: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      delimiter: delimiter || ",",
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const columns = Object.keys(results.data[0] as Record<string, unknown>);
          resolve({
            rows: results.data as ParsedRow[],
            columns,
          });
        } else {
          reject(new Error("CSV vazio ou inválido"));
        }
      },
      error: (error: any) => {
        reject(new Error(`Erro ao parsear CSV: ${error.message}`));
      },
    });
  });
}

export function parseCSV(file: File, delimiter?: string): Promise<{ rows: ParsedRow[]; columns: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      delimiter: delimiter || ",",
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const columns = Object.keys(results.data[0] as Record<string, unknown>);
          resolve({
            rows: results.data as ParsedRow[],
            columns,
          });
        } else {
          reject(new Error("CSV vazio ou inválido"));
        }
      },
      error: (error: any) => {
        reject(new Error(`Erro ao parsear CSV: ${error.message}`));
      },
    });
  });
}

export async function detectAndParseCSV(file: File, forcedBank?: string): Promise<{ rows: ParsedRow[]; columns: string[]; bank: string; month: string }> {
  const fileContent = await file.text();
  const detectedBank = forcedBank || detectBankFromContent(fileContent) || "generic";
  let template = getTemplateByBank(detectedBank);

  // Se não foi forçado um banco específico, tentar detectar o delimitador
  if (!forcedBank) {
    const detectedDelimiter = detectDelimiter(fileContent);
    // Se o delimitador detectado é diferente, usar o detectado
    if (detectedDelimiter !== template.delimiter) {
      console.log(`[detectAndParseCSV] Delimitador detectado: "${detectedDelimiter}" (em vez de "${template.delimiter}")`);
      template = { ...template, delimiter: detectedDelimiter };
    }
  } else {
    // Se foi forçado um banco, usar o delimitador do template SEMPRE
    console.log(`[detectAndParseCSV] Banco forçado: "${forcedBank}", usando delimiter: "${template.delimiter}"`);
  }

  // Limpar linhas de metadados (linhas antes do cabeçalho real)
  const cleanedContent = cleanMetadataLines(fileContent, template.delimiter);

  // Fazer parsing do conteúdo limpo
  const { rows, columns } = await parseCSVFromString(cleanedContent, template.delimiter);

  // Detect month from first date found
  let month = "Desconhecido";
  for (const row of rows) {
    const dateValue = row[template.dateColumn];
    if (dateValue) {
      const detectedMonth = detectMonthFromData(String(dateValue));
      if (detectedMonth) {
        month = detectedMonth;
        break;
      }
    }
  }

  return { rows, columns, bank: detectedBank, month };
}

export function validateCSV(rows: ParsedRow[], columns: string[], bankTemplate: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const template = getTemplateByBank(bankTemplate);

  // Verificar colunas esperadas
  if (template.expectedColumns.length > 0) {
    const missingColumns = template.expectedColumns.filter((col) => !columns.includes(col));

    if (missingColumns.length > 0) {
      errors.push({
        type: "missing-columns",
        message: `Colunas esperadas não encontradas: ${missingColumns.join(", ")}`,
        data: { missingColumns, foundColumns: columns },
      });
    }
  }

  // Verificar linhas vazias ou inválidas
  if (rows.length === 0) {
    errors.push({
      type: "format",
      message: "Nenhuma linha de dados encontrada no arquivo",
    });
  }

  return errors;
}

export function detectDuplicates(rows: ParsedRow[]): { [key: number]: number[] } {
  const duplicates: { [key: number]: number[] } = {};
  const seen: Map<string, number[]> = new Map();

  rows.forEach((row, index) => {
    const rowSignature = JSON.stringify(row);
    if (seen.has(rowSignature)) {
      seen.get(rowSignature)!.push(index);
    } else {
      seen.set(rowSignature, [index]);
    }
  });

  // Marcar apenas os que têm duplicatas (mais de 1 ocorrência)
  for (const [indices] of seen) {
    const indexArray = seen.get(indices)!;
    if (indexArray.length > 1) {
      indexArray.forEach((idx) => {
        duplicates[idx] = indexArray.filter((i) => i !== idx);
      });
    }
  }

  return duplicates;
}

export function cleanValue(value: unknown): string | number | null {
  if (value === null || value === undefined) return null;

  const str = String(value).trim();

  if (str === "" || str === "N/A" || str === "-") return null;

  // Tentar converter para número se for valor (com R$ ou similar)
  if (typeof value === "string" && (value.includes("R$") || /^-?\d+([.,]\d{2})?$/.test(str))) {
    const cleaned = str.replace(/[R$\s.]/g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? str : num;
  }

  return str;
}

export function cleanRows(rows: ParsedRow[]): ParsedRow[] {
  return rows.map((row) => {
    const cleanedRow: ParsedRow = {};
    for (const [key, value] of Object.entries(row)) {
      cleanedRow[key] = cleanValue(value);
    }
    return cleanedRow;
  });
}

export function createTableData(rows: ParsedRow[], columns: string[], bank: string, month: string): TableData {
  const duplicates = detectDuplicates(rows);

  return {
    id: `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    rows: rows.map((row, idx) => ({
      ...row,
      isDuplicate: idx in duplicates,
    })),
    columns,
    bank,
    month,
    uploadDate: new Date().toISOString(),
  };
}
