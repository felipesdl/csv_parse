import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ComparedFile {
  id: string;
  bankId: string; // ID do banco (inter, caixa, itau, etc)
  bankName: string; // Nome exibido do banco
  month?: string; // Mês do extrato (ex: "2025-09")
  uploadDate: string;
  rowCount: number;
  data: any[]; // Dados do CSV
  columns: string[]; // Todas as colunas do arquivo
}

/**
 * Mapeamento de colunas para comparação
 * Permite mapear colunas com nomes diferentes (ex: "Data" vs "Data Lançamento")
 * Key: nome da coluna padronizada para comparação
 * Value: objeto com fileId -> coluna real no arquivo
 */
export interface ColumnMapping {
  [standardColumnName: string]: Record<string, string>; // fileId -> actual column name
}

interface ComparisonState {
  comparedFiles: ComparedFile[];
  commonColumns: string[]; // Colunas que existem em TODOS os arquivos
  columnMappings: ColumnMapping; // Mapeamento customizado de colunas
  addFile: (file: ComparedFile) => void;
  removeFile: (fileId: string) => void;
  updateCommonColumns: () => void;
  setColumnMapping: (mapping: ColumnMapping) => void;
  clearAll: () => void;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      comparedFiles: [],
      commonColumns: [],
      columnMappings: {},

      addFile: (file: ComparedFile) =>
        set((state) => {
          const updated = [...state.comparedFiles, file];
          return {
            comparedFiles: updated,
          };
        }),

      removeFile: (fileId: string) =>
        set((state) => {
          const updated = state.comparedFiles.filter((f) => f.id !== fileId);
          return {
            comparedFiles: updated,
          };
        }),

      updateCommonColumns: () => {
        const state = get();
        if (state.comparedFiles.length === 0) {
          set({ commonColumns: [] });
          return;
        }

        // Começar com as colunas do primeiro arquivo
        let common = new Set(state.comparedFiles[0].columns);

        // Intersecção com as colunas dos outros arquivos
        for (let i = 1; i < state.comparedFiles.length; i++) {
          const fileColumns = new Set(state.comparedFiles[i].columns);
          common = new Set([...common].filter((col) => fileColumns.has(col)));
        }

        set({ commonColumns: Array.from(common) });
      },

      setColumnMapping: (mapping: ColumnMapping) => set({ columnMappings: mapping }),

      clearAll: () =>
        set({
          comparedFiles: [],
          commonColumns: [],
          columnMappings: {},
        }),
    }),
    {
      name: "comparison-store",
      version: 1,
    }
  )
);
