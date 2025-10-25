import { ParsedRow } from "@/types";

export interface ColumnFilter {
  id: string;
  column: string;
  type: "text" | "number" | "select";
  values?: string[];
  value?: string | number;
}

export interface TableContextType {
  filteredData: ParsedRow[];
  sortColumn: string | null;
  sortOrder: "asc" | "desc" | null;
  rowSelection: Record<string, boolean>;
  onSort: (column: string) => void;
  onSelectRow: (index: number) => void;
  onSelectAll: (selected: boolean) => void;
}
