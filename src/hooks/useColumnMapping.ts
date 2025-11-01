import { useCallback } from "react";
import { useComparisonStore, type ColumnMapping } from "@/store/comparisonStore";

/**
 * Hook para trabalhar com mapeamento de colunas
 * Centraliza a lógica de busca de colunas mapeadas
 */
export function useColumnMapping() {
  const { comparedFiles, columnMappings } = useComparisonStore();

  /**
   * Obtém o nome real da coluna de um arquivo baseado no nome padrão
   * @param fileId - ID do arquivo
   * @param standardName - Nome padrão da coluna (ex: "Valor", "Data")
   * @returns Nome real da coluna no arquivo ou undefined se não encontrado
   */
  const getMappedColumn = useCallback(
    (fileId: string, standardName: string): string | undefined => {
      // Primeiro verifica se existe um mapeamento customizado
      if (columnMappings[standardName] && columnMappings[standardName][fileId]) {
        return columnMappings[standardName][fileId];
      }

      // Fallback: busca a coluna diretamente no arquivo
      const file = comparedFiles.find((f) => f.id === fileId);
      if (!file) return undefined;

      // Match direto
      if (file.columns.includes(standardName)) {
        return standardName;
      }

      // Para "Valor", tenta variações comuns
      if (standardName === "Valor") {
        return file.columns.find((col) => col === "Valor" || col.toLowerCase().includes("valor") || col.toLowerCase().includes("value"));
      }

      // Para "Data", tenta variações comuns
      if (standardName === "Data") {
        return file.columns.find(
          (col) => col === "Data" || col.toLowerCase().includes("data") || col.toLowerCase().includes("date") || col.toLowerCase().includes("lançamento")
        );
      }

      return undefined;
    },
    [comparedFiles, columnMappings]
  );

  /**
   * Obtém o nome padrão (standardName) para uma coluna específica de um arquivo
   * @param fileId - ID do arquivo
   * @param columnName - Nome da coluna no arquivo
   * @returns Nome padrão da coluna ou o próprio nome se não houver mapeamento
   */
  const getStandardName = useCallback(
    (fileId: string, columnName: string): string => {
      // Procura em todos os mapeamentos
      for (const [standardName, fileMapping] of Object.entries(columnMappings)) {
        if (fileMapping[fileId] === columnName) {
          return standardName;
        }
      }
      // Se não encontrou mapeamento, retorna o próprio nome
      return columnName;
    },
    [columnMappings]
  );

  /**
   * Obtém todas as colunas mapeadas para um arquivo específico
   * @param fileId - ID do arquivo
   * @returns Array de objetos com nome padrão e nome real da coluna
   */
  const getMappedColumnsForFile = useCallback(
    (fileId: string): Array<{ standardName: string; actualName: string }> => {
      const result: Array<{ standardName: string; actualName: string }> = [];

      for (const [standardName, fileMapping] of Object.entries(columnMappings)) {
        if (fileMapping[fileId]) {
          result.push({
            standardName,
            actualName: fileMapping[fileId],
          });
        }
      }

      return result;
    },
    [columnMappings]
  );

  return {
    getMappedColumn,
    getStandardName,
    getMappedColumnsForFile,
    columnMappings,
    comparedFiles,
  };
}
