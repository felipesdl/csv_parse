export interface ColumnFilter {
  id: string;
  column: string;
  type: "text" | "number" | "select";
  values?: string[];
  value?: string | number;
}
