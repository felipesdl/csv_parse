import Papa from "papaparse";
import { ParsedRow, ValidationError, TableData } from "@/types";
import { detectBankFromContent, getTemplateByBank, detectMonthFromData, detectDelimiter, BANK_TEMPLATES } from "./bankTemplates";

/**
 * Remove linhas de metadados (linhas antes do cabeçalho real)
 * Estratégia: encontrar a primeira linha que parece ser o cabeçalho
 * O cabeçalho real tem características específicas
 */
function cleanMetadataLines(content: string, delimiter: string): string {
  const lines = content.split("\n").map((l) => l.trim());

  // Palavras-chave que indicam cabeçalho real (coloque as mais prováveis)
  const headerKeywords = ["data", "lançamento", "histórico", "descrição", "valor", "saldo", "referência", "tipo", "transação"];

  // Características de um cabeçalho legítimo
  const isRealHeader = (line: string): boolean => {
    if (!line) return false;

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
    if (!line) return false;

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

  // Procurar pela primeira linha que é claramente um header
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isRealHeader(line)) {
      headerIndex = i;
      break;
    }
  }

  // Se encontrou um header válido, retornar do header em diante
  if (headerIndex >= 0) {
    const result = lines.slice(headerIndex).join("\n");
    console.log(`[cleanMetadataLines] Removidas ${headerIndex} linhas de metadata. Primeira linha do header: "${lines[headerIndex].substring(0, 80)}..."`);
    return result;
  }

  console.warn("[cleanMetadataLines] Nenhum header detectado, usando conteúdo original");
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
  
  // NÃO fazer detecção automática - sempre requer banco forçado
  if (!forcedBank) {
    throw new Error("É necessário selecionar o banco manualmente");
  }

  let template = getTemplateByBank(forcedBank);

  // Se foi forçado um banco, usar o delimitador do template
  console.log(`[detectAndParseCSV] Banco forçado: "${forcedBank}", usando delimiter: "${template.delimiter}"`);

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

  return { rows, columns, bank: forcedBank, month };
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

/**
 * Validação flexível para comparação
 * Apenas verifica se o arquivo tem dados, sem exigir colunas específicas
 * Já que os bancos têm estruturas diferentes
 */
export function validateCSVForComparison(rows: ParsedRow[], columns: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Verificar se tem dados
  if (rows.length === 0) {
    errors.push({
      type: "format",
      message: "Nenhuma linha de dados encontrada no arquivo",
    });
  }

  // Verificar se tem coluna "Valor" ou similar para comparação
  const hasValueColumn = columns.some((col) => col.toLowerCase().includes("valor"));
  if (!hasValueColumn) {
    console.warn("[validateCSVForComparison] Aviso: Nenhuma coluna 'Valor' encontrada. Colunas disponíveis:", columns);
    // Não é erro, apenas aviso - permitir continuar
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
