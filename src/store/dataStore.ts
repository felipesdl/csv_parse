import { create } from "zustand";
import { TableData, ColumnSettings } from "@/types";

interface FormatSettings {
  dateFormat: "full" | "date-only" | "day-only"; // "15/09/2025 23:59", "15/09/2025", "15"
  showNegativeAsPositive: boolean; // Se true, mostra -100 como 100
}

interface DataStore {
  // State
  tableData: TableData | null;
  columnSettings: ColumnSettings[];
  selectedRows: Set<number>;
  loading: boolean;
  error: string | null;
  formatSettings: FormatSettings;

  // Actions
  setTableData: (data: TableData | null) => void;
  setColumnSettings: (settings: ColumnSettings[]) => void;
  updateColumnOrder: (columnName: string, newOrder: number) => void;
  updateColumnVisibility: (columnName: string, visible: boolean) => void;
  toggleRowSelection: (rowIndex: number) => void;
  selectAllRows: () => void;
  deselectAllRows: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  deleteRows: (indices: number[]) => void;
  deleteRow: (index: number) => void;
  setFormatSettings: (settings: Partial<FormatSettings>) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  reset: () => void;
}

const STORAGE_KEY = "cafe_dashboard_table_data";

export const useDataStore = create<DataStore>((set, get) => ({
  tableData: null,
  columnSettings: [],
  selectedRows: new Set(),
  loading: false,
  error: null,
  formatSettings: {
    dateFormat: "full",
    showNegativeAsPositive: false,
  },

  setTableData: (data) => {
    set({ tableData: data });
    if (data) {
      const settings = data.columns.map((col, idx) => ({
        name: col,
        visible: true,
        order: idx,
      }));
      set({ columnSettings: settings });
    }
  },

  setColumnSettings: (settings) => set({ columnSettings: settings }),

  updateColumnOrder: (columnName, newOrder) => {
    set((state) => {
      const updated = [...state.columnSettings];
      const colIndex = updated.findIndex((c) => c.name === columnName);
      if (colIndex !== -1) {
        updated[colIndex].order = newOrder;
      }
      return { columnSettings: updated };
    });
  },

  updateColumnVisibility: (columnName, visible) => {
    set((state) => {
      const updated = [...state.columnSettings];
      const colIndex = updated.findIndex((c) => c.name === columnName);
      if (colIndex !== -1) {
        updated[colIndex].visible = visible;
      }
      return { columnSettings: updated };
    });
  },

  toggleRowSelection: (rowIndex) => {
    set((state) => {
      const newSelected = new Set(state.selectedRows);
      if (newSelected.has(rowIndex)) {
        newSelected.delete(rowIndex);
      } else {
        newSelected.add(rowIndex);
      }
      return { selectedRows: newSelected };
    });
  },

  selectAllRows: () => {
    set((state) => {
      if (state.tableData) {
        const allIndices = new Set(state.tableData.rows.map((_, idx) => idx));
        return { selectedRows: allIndices };
      }
      return {};
    });
  },

  deselectAllRows: () => set({ selectedRows: new Set() }),

  deleteRows: (indices) => {
    set((state) => {
      if (!state.tableData) return {};
      const newRows = state.tableData.rows.filter((_, idx) => !indices.includes(idx));
      return {
        tableData: { ...state.tableData, rows: newRows },
        selectedRows: new Set(),
      };
    });
  },

  deleteRow: (index) => {
    set((state) => {
      if (!state.tableData) return {};
      const newRows = state.tableData.rows.filter((_, idx) => idx !== index);
      return {
        tableData: { ...state.tableData, rows: newRows },
        selectedRows: new Set(),
      };
    });
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setFormatSettings: (settings) => {
    set((state) => ({
      formatSettings: { ...state.formatSettings, ...settings },
    }));
  },

  saveToLocalStorage: () => {
    const state = get();
    if (state.tableData) {
      const dataToSave = {
        tableData: state.tableData,
        columnSettings: state.columnSettings,
        formatSettings: state.formatSettings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  },

  loadFromLocalStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { tableData, columnSettings, formatSettings } = JSON.parse(stored);
        set({
          tableData,
          columnSettings,
          formatSettings: formatSettings || {
            dateFormat: "full",
            showNegativeAsPositive: false,
          },
        });
        return true;
      }
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
    }
    return false;
  },

  reset: () => {
    set({
      tableData: null,
      columnSettings: [],
      selectedRows: new Set(),
      loading: false,
      error: null,
      formatSettings: {
        dateFormat: "full",
        showNegativeAsPositive: false,
      },
    });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
