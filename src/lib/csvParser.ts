import Papa from "papaparse";
import { ParsedRow, ValidationError, TableData } from "@/types";
import { detectBankFromContent, getTemplateByBank, detectMonthFromData, detectDelimiter, BANK_TEMPLATES } from "./bankTemplates";
import { HEADER_KEYWORDS, ERROR_MESSAGES } from "@/utils/constants";
import { parseValueBR } from "@/utils/formatUtils";
import { logger } from "@/utils/logger";

/**
 * Remove linhas de metadados (linhas antes do cabeçalho real)
 * Estratégia: encontrar a primeira linha que parece ser o cabeçalho
 * O cabeçalho real tem características específicas
 */
function cleanMetadataLines(content: string, delimiter: string, bankId?: string): string {
  const lines = content.split("\n").map((l) => l.trim());

  // Tratamento específico para Itaú: pular até encontrar linha "Data;Lançamento;Razão Social..."
  if (bankId === "itau") {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      // Procurar pela linha que contém exatamente essas 3 palavras-chave juntas
      if (line.includes("data") && line.includes("lançamento") && line.includes("razão social")) {
        console.log(`[cleanMetadataLines] Itaú: Header encontrado na linha ${i}`);
        return lines.slice(i).join("\n");
      }
    }
  }

  // Palavras-chave que indicam cabeçalho real (coloque as mais prováveis)
  const headerKeywords = HEADER_KEYWORDS;

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
    return result;
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

  // NÃO fazer detecção automática - sempre requer banco forçado
  if (!forcedBank) {
    throw new Error(ERROR_MESSAGES.BANK_REQUIRED);
  }

  let template = getTemplateByBank(forcedBank);

  // Usar skipHeaderRows do template se disponível (pula linhas de metadados ANTES do parse)
  let contentToParse = fileContent;
  if (template.skipHeaderRows && template.skipHeaderRows > 0) {
    const lines = fileContent.split("\n");
    contentToParse = lines.slice(template.skipHeaderRows).join("\n");
  } else {
    // Fallback para detecção automática se skipHeaderRows não definido
    contentToParse = cleanMetadataLines(fileContent, template.delimiter, forcedBank);
  }

  // Fazer parsing do conteúdo limpo
  let { rows, columns } = await parseCSVFromString(contentToParse, template.delimiter);

  // Remover linhas de TOTAL ou outras linhas inválidas que possam estar no final
  rows = rows.filter((row) => {
    // Ignorar linhas que parecem ser TOTAL
    const descriptionValue = String(row[template.descriptionColumn] || "").toLowerCase();
    if (descriptionValue.includes("total")) {
      return false;
    }
    // Ignorar linhas de saldo do Itaú (SALDO ANTERIOR, SALDO TOTAL DISPONÍVEL DIA, SALDO EM CONTA CORRENTE)
    if (descriptionValue.includes("saldo")) {
      return false;
    }
    // Ignorar linhas completamente vazias
    if (Object.values(row).every((v) => !v || String(v).trim() === "")) {
      return false;
    }
    return true;
  });

  // Se o banco tem colunas de débito/crédito separadas, consolidar em uma coluna "Valor"
  if (template.creditColumn && template.debitColumn) {
    const newRows: ParsedRow[] = [];

    for (const row of rows) {
      const newRow: ParsedRow = { ...row };
      const credit = row[template.creditColumn];
      const debit = row[template.debitColumn];

      const creditNum = parseValueBR(String(credit ?? ""));
      const debitNum = parseValueBR(String(debit ?? ""));

      // Criar coluna "Valor": crédito é positivo, débito é negativo
      const valor = creditNum > 0 ? creditNum : -debitNum;

      // Adicionar coluna "Valor" consolidada
      newRow["Valor"] = valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // Remover colunas originais de débito/crédito
      delete newRow[template.creditColumn];
      delete newRow[template.debitColumn];

      newRows.push(newRow);
    }

    // Atualizar rows e columns
    rows = newRows;
    columns = columns.filter((col) => col !== template.creditColumn && col !== template.debitColumn);
    if (!columns.includes("Valor")) {
      columns.push("Valor");
    }
  }

  // Se o banco tem uma coluna de valor com nome diferente de "Valor", normalizar para "Valor"
  // Isso garante que os gráficos e análises funcionem corretamente
  if (template.valueColumn && template.valueColumn !== "Valor" && columns.includes(template.valueColumn)) {
    const newRows: ParsedRow[] = [];

    for (const row of rows) {
      const newRow: ParsedRow = { ...row };
      // Copiar o valor da coluna original para "Valor"
      newRow["Valor"] = row[template.valueColumn];
      // Remover a coluna original
      delete newRow[template.valueColumn];
      newRows.push(newRow);
    }

    // Atualizar rows e columns
    rows = newRows;
    columns = columns.map((col) => (col === template.valueColumn ? "Valor" : col));
  }

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

  // Se o banco tem colunas de débito/crédito, não validar a coluna "Valor" esperada
  // pois ela será criada durante o processamento
  if (template.creditColumn && template.debitColumn) {
    // Para Santander, verificar se tem as colunas de crédito/débito
    const hasCredit = columns.includes(template.creditColumn);
    const hasDebit = columns.includes(template.debitColumn);
    const hasDate = columns.includes(template.dateColumn);
    const hasDesc = columns.includes(template.descriptionColumn);

    if (!hasCredit) {
      errors.push({
        type: "missing-columns",
        message: `Coluna esperada não encontrada: ${template.creditColumn}`,
      });
    }
    if (!hasDebit) {
      errors.push({
        type: "missing-columns",
        message: `Coluna esperada não encontrada: ${template.debitColumn}`,
      });
    }
    if (!hasDate) {
      errors.push({
        type: "missing-columns",
        message: `Coluna esperada não encontrada: ${template.dateColumn}`,
      });
    }
    if (!hasDesc) {
      errors.push({
        type: "missing-columns",
        message: `Coluna esperada não encontrada: ${template.descriptionColumn}`,
      });
    }
  } else {
    // Para outros bancos, validação padrão
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
    logger.warn("[validateCSVForComparison] Aviso: Nenhuma coluna 'Valor' encontrada. Colunas disponíveis:", columns);
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
