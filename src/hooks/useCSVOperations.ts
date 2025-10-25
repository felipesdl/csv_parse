import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ParseCSVResponse {
  success: boolean;
  data: {
    rows: any[];
    columns: string[];
    bank: string;
    month: string;
    timestamp: string;
  };
}

interface ParseCSVError {
  error: string;
}

/**
 * Hook para fazer upload e parsing de CSV via API
 * Usa TanStack Query com cache de 5 minutos
 */
export function useParseCSV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { file: File; forcedBank?: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      if (payload.forcedBank) {
        formData.append("forcedBank", payload.forcedBank);
      }

      const response = await fetch("/api/csv/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = (await response.json()) as ParseCSVError;
        throw new Error(error.error || "Erro ao fazer upload do CSV");
      }

      const data = (await response.json()) as ParseCSVResponse;
      return data.data;
    },

    onSuccess: (data) => {
      // Salvar no cache com a chave do arquivo
      queryClient.setQueryData(["csv-parse", data.timestamp], data);

      // Persistir em localStorage
      try {
        localStorage.setItem(
          "csv-last-upload",
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.warn("Erro ao salvar em localStorage:", e);
      }
    },

    onError: (error: Error) => {
      console.error("Erro no mutation CSV:", error);
    },
  });
}

/**
 * Hook para recuperar o último CSV do cache/localStorage
 */
export function useLastCSVUpload() {
  return useQuery({
    queryKey: ["csv-last-upload"],
    queryFn: () => {
      try {
        const stored = localStorage.getItem("csv-last-upload");
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        // Se tem mais de 5 minutos, remover
        if (age > 5 * 60 * 1000) {
          localStorage.removeItem("csv-last-upload");
          return null;
        }

        return parsed.data;
      } catch (e) {
        console.warn("Erro ao ler localStorage:", e);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para operações de clipboard com TanStack Query
 */
export function useCopyToClipboard() {
  return useMutation({
    mutationFn: async (text: string) => {
      await navigator.clipboard.writeText(text);
      return true;
    },
    onError: (error: Error) => {
      console.error("Erro ao copiar:", error);
    },
  });
}
