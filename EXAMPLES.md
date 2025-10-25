# 📚 EXAMPLES - Exemplos Práticos & Padrões Avançados

## 🚀 Quick Examples

### Upload CSV Simples

```typescript
// CSVUploader.tsx
const { mutate: parseCSV, isPending } = useParseCSV();

function handleUpload(file: File) {
  parseCSV(
    { file },
    {
      onSuccess: (data) => {
        console.log("CSV parsed:", data.rows.length, "rows");
      },
    }
  );
}
```

### Exibir Dados em Cache

```typescript
// Component
const { data, isLoading } = useLastCSVUpload();

if (isLoading) return <div>Carregando...</div>;
if (!data) return <div>Nenhum CSV carregado</div>;

return (
  <table>
    <thead>
      <tr>
        {data.columns.map((col) => (
          <th key={col}>{col}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.rows.map((row, i) => (
        <tr key={i}>
          {data.columns.map((col) => (
            <td key={col}>{row[col]}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
```

### Copiar Dados

```typescript
const { mutate: copy } = useCopyToClipboard();

const allData = data.rows.map((row) => Object.values(row).join("\t")).join("\n");

copy(
  { data: allData },
  {
    onSuccess: () => {
      alert("Copiado com sucesso!");
    },
  }
);
```

## 🎯 Padrões Avançados

### Custom Hook - Fetch com Retry Manual

```typescript
import { useQuery } from "@tanstack/react-query";

function useFetchWithRetry(url: string) {
  return useQuery({
    queryKey: ["fetch", url],
    queryFn: async () => {
      let attempts = 0;
      while (attempts < 3) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed");
          return res.json();
        } catch (error) {
          attempts++;
          if (attempts === 3) throw error;
          await new Promise((r) => setTimeout(r, 1000 * attempts));
        }
      }
    },
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
}
```

### Error Handling com Toast

```typescript
import { useMutation } from "@tanstack/react-query";

function useUploadWithToast() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/csv/parse", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      showToast("✅ Upload bem-sucedido", "success");
    },
    onError: (error) => {
      showToast(`❌ Erro: ${error.message}`, "error");
    },
  });
}
```

### Invalidate Cache Manualmente

```typescript
import { useQueryClient } from "@tanstack/react-query";

function ClearCacheButton() {
  const queryClient = useQueryClient();

  return (
    <button
      onClick={() => {
        queryClient.invalidateQueries({
          queryKey: ["lastCSVUpload"],
        });
      }}
    >
      Limpar Cache
    </button>
  );
}
```

### Prefetch Data

```typescript
function usePrefetchCSVData() {
  const queryClient = useQueryClient();

  return async (file: File) => {
    await queryClient.prefetchQuery({
      queryKey: ["lastCSVUpload"],
      queryFn: async () => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/csv/parse", {
          method: "POST",
          body: formData,
        });
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
```

## 🔧 DevTools Setup

### Adicionar React Query DevTools

```bash
npm install @tanstack/react-query-devtools
```

### Usar no Layout

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### Inspecionar Cache

- DevTools aparece no canto inferior direito
- Abrir com F12 ou clique no ícone
- Ver todas as queries e seus estados
- Refetch/Invalidate manualmente

## 💡 Otimizações

### Usar Selective Persistence

```typescript
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

// Em QueryClient:
{
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24h
    },
  },
}
```

### Batch Multiple Queries

```typescript
function useMultipleCSVs() {
  const queries = useQueries({
    queries: [
      { queryKey: ["csv", 1], queryFn: () => fetchCSV(1) },
      { queryKey: ["csv", 2], queryFn: () => fetchCSV(2) },
      { queryKey: ["csv", 3], queryFn: () => fetchCSV(3) },
    ],
  });

  return queries.every((q) => !q.isPending);
}
```

### Infinite Queries (Para Pagination)

```typescript
function useInfiniteCSVs() {
  return useInfiniteQuery({
    queryKey: ["csvs"],
    queryFn: ({ pageParam = 0 }) => fetch(`/api/csvs?page=${pageParam}`).then((r) => r.json()),
    getNextPageParam: (lastPage, pages) => (lastPage.hasNext ? pages.length : undefined),
  });
}
```

## 📚 Casos de Uso Reais

### Validar CSV Antes de Salvar

```typescript
const { mutate: parse } = useParseCSV();

const handleSaveToDatabase = (file: File) => {
  parse(
    { file },
    {
      onSuccess: (data) => {
        // Validar dados
        if (data.rows.length === 0) {
          throw new Error("CSV vazio");
        }

        // Chamar API de salvamento
        fetch("/api/database/save", {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
    }
  );
};
```

### Progress Bar Upload

```typescript
function useUploadWithProgress() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          const percentComplete = (e.loaded / e.total) * 100;
          console.log(`Upload: ${percentComplete}%`);
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.open("POST", "/api/csv/parse");
        xhr.send(formData);
      });
    },
  });
}
```

### Sync Com Zustand

```typescript
import { useShallow } from "zustand/react";
import { useCsvStore } from "@/store/csvStore";

function CSVViewer() {
  const { dateFormat, showNegative } = useShallow(useCsvStore);
  const { data } = useLastCSVUpload();

  useEffect(() => {
    // Quando settings mudam, reagir
    console.log("Formatação mudou:", dateFormat, showNegative);
  }, [dateFormat, showNegative]);

  return null;
}
```

## 🎓 Referências Úteis

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Course](https://react-query.tanstack.com/)
- [DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Best Practices](https://tkdodo.eu/blog/react-query-as-a-state-manager)

## ✨ Dicas Finais

1. **Sempre use DevTools em desenvolvimento**

   - Inspecione cache state
   - Debug queries e mutations

2. **Validate cache durante testes**

   - localStorage deve ter "csv-last-upload"
   - TanStack Query deve mostrar cache hit

3. **Para production**
   - Remova ReactQueryDevtools ou deixe com `initialIsOpen={false}`
   - Configure gcTime adequado para seu caso
   - Monitore performance com Web Vitals
