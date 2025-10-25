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

export interface ParsedRow {
  [key: string]: string | number | null | boolean;
}

export interface TableData {
  id: string;
  rows: ParsedRow[];
  columns: string[];
  bank: string;
  month: string;
  uploadDate: string;
  isDuplicate?: boolean;
}

export interface ColumnSettings {
  name: string;
  visible: boolean;
  order: number;
}

export interface ExportOptions {
  format: "csv" | "copy";
  includeHeaders: boolean;
}

export interface ValidationError {
  type: "format" | "missing-columns" | "bank-detection" | "duplicates";
  message: string;
  data?: unknown;
}
