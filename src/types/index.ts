/**
 * Template de configuração para cada banco suportado
 * Define delimitador, colunas esperadas e nomes de colunas específicas
 */
export interface BankTemplate {
  id: string;
  name: string;
  delimiter: string;
  expectedColumns: string[];
  dateColumn: string;
  descriptionColumn: string;
  valueColumn: string;
  typeColumn?: string;
  referenceColumn?: string;
  futureColumn?: string;
}

/**
 * Uma linha parsada de um CSV
 * Pode conter strings, números, null ou booleanos
 */
export interface ParsedRow {
  [key: string]: string | number | null | boolean;
}

/**
 * Dados da tabela carregados de um CSV
 * Inclui todas as linhas e metadados do arquivo
 */
export interface TableData {
  id: string;
  rows: ParsedRow[];
  columns: string[];
  bank: string;
  month: string;
  uploadDate: string;
  isDuplicate?: boolean;
}

/**
 * Configuração de visibilidade e ordem de uma coluna
 */
export interface ColumnSettings {
  name: string;
  visible: boolean;
  order: number;
}

/**
 * Opções de formatação para exibição de dados
 * Controla data, valores negativos e divisão pos/neg
 */
export interface FormatSettings {
  dateFormat: "full" | "date-only" | "day-only";
  showNegativeAsPositive: boolean;
  splitByPosNeg: boolean;
}

/**
 * Opções de exportação de dados
 */
export interface ExportOptions {
  format: "csv" | "copy";
  includeHeaders: boolean;
}

/**
 * Erro durante validação ou parsing
 */
export interface ValidationError {
  type: "format" | "missing-columns" | "bank-detection" | "duplicates";
  message: string;
  data?: unknown;
}

/**
 * Arquivo carregado para comparação
 */
export interface ComparedFile {
  id: string;
  bankId: string;
  bankName: string;
  uploadDate: string;
  rowCount: number;
  data: ParsedRow[];
  columns: string[];
}

/**
 * Mapeamento de colunas para comparação
 * Permite mapear colunas com nomes diferentes entre arquivos
 */
export interface ColumnMapping {
  [standardColumnName: string]: Record<string, string>;
}
