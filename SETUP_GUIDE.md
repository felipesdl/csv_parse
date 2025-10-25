# 🚀 SETUP GUIDE - Instalação & Configuração

## 📋 Pré-requisitos

- **Node.js 18+** (verificar: `node --version`)
- **npm 9+** ou **yarn 3+** (verificar: `npm --version`)
- **Next.js 15.0.0** (já instalado)
- **Git** instalado
- **2GB de espaço** em disco

## 🎯 Arquitetura do Projeto

```
café_dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx ........... Root com QueryProvider
│   │   ├── page.tsx ............ Página principal
│   │   └── api/csv/parse/route.ts (NOVO - Backend)
│   ├── components/
│   │   ├── CSVUploader.tsx ...... Upload com TanStack Query
│   │   ├── DataTable.tsx ........ Tabela com filtros
│   │   └── index.ts ............ Exportações
│   ├── hooks/
│   │   └── useCSVOperations.ts (NOVO - Custom hooks)
│   ├── providers/
│   │   └── QueryProvider.tsx (NOVO - QueryClient config)
│   ├── store/
│   │   └── csvStore.ts ......... Zustand (filtros/datas)
│   └── types/
│       └── index.ts ............ TypeScript types
├── public/
│   └── [assets]
└── package.json ................ Dependências

```

## ⚙️ Instalação (4 Passos)

### Passo 1: Instalar Pacotes

```bash
npm install @tanstack/react-query
```

**Ou com yarn:**

```bash
yarn add @tanstack/react-query
```

### Passo 2: Verificar Arquivos Criados

Estes 3 novos arquivos devem existir:

```bash
ls -la src/providers/QueryProvider.tsx
ls -la src/app/api/csv/parse/route.ts
ls -la src/hooks/useCSVOperations.ts
```

**Esperado:**

```
✅ src/providers/QueryProvider.tsx   (20 linhas)
✅ src/app/api/csv/parse/route.ts   (40 linhas)
✅ src/hooks/useCSVOperations.ts    (150 linhas)
```

### Passo 3: Verificar Componentes Atualizados

Estes 4 arquivos devem ter sido modificados:

```bash
# Verificar se layout.tsx importa QueryProvider
grep -n "QueryProvider" src/app/layout.tsx

# Verificar se CSVUploader.tsx usa useParseCSV
grep -n "useParseCSV" src/components/CSVUploader.tsx

# Verificar se DataTable.tsx usa useCopyToClipboard
grep -n "useCopyToClipboard" src/components/DataTable.tsx

# Verificar se package.json tem @tanstack/react-query
grep "@tanstack/react-query" package.json
```

**Esperado:**

```
✅ src/app/layout.tsx: QueryProvider importado e ativo
✅ src/components/CSVUploader.tsx: useParseCSV em uso
✅ src/components/DataTable.tsx: useCopyToClipboard em uso
✅ package.json: @tanstack/react-query adicionado
```

### Passo 4: Iniciar Servidor

```bash
# Opção 1: npm
npm run dev

# Opção 2: yarn
yarn dev

# Opção 3: pnpm
pnpm dev
```

**Esperado:**

```
✓ Ready in Xs
✓ Local: http://localhost:3000
```

## ✅ Validação Rápida

### 1️⃣ Verificar Servidor Respondendo

```bash
curl http://localhost:3000
# Deve retornar HTML (não erro)
```

### 2️⃣ Verificar API Backend

```bash
curl -X POST http://localhost:3000/api/csv/parse \
  -F "file=@teste_caixa.csv"
# Deve retornar JSON com: { rows, columns, bank, month, timestamp }
```

### 3️⃣ Verificar UI Carregando

```bash
# Abrir no browser
open http://localhost:3000

# Esperado:
# - Página carrega sem erros
# - Botão upload visível
# - F12 Console sem erros vermelhos
```

### 4️⃣ Testar Upload

1. Abra http://localhost:3000
2. Clique em "Selecione um arquivo" ou arraste um CSV
3. Selecione `teste_caixa.csv` ou seu CSV
4. Clique "Analisar"
5. **Esperado:** Dados aparecem na tabela

### 5️⃣ Verificar localStorage

```bash
# F12 > Application > Local Storage
# Procure por: csv-last-upload
# Esperado: { data: {...}, timestamp: 1729829400000 }
```

### 6️⃣ Verificar Cache Hit

1. Upload um CSV (deve demorar 2-3s)
2. Recarregue página imediatamente (F5)
3. **Esperado:** Dados aparecem em <50ms (vindo do cache)

## 🔧 Configuração Avançada

### QueryClient Config

Editável em `src/providers/QueryProvider.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min until refetch
      gcTime: 10 * 60 * 1000, // 10 min until delete
      retry: 1, // Retry once
      refetchOnWindowFocus: false, // Don't refetch on focus
      refetchOnReconnect: false, // Don't refetch on network
    },
  },
});
```

**Ajustes comuns:**

- 📈 Aumentar `staleTime` para cache durar mais
- 📉 Diminuir `gcTime` para economizar memória
- 🔄 Aumentar `retry` para redes lentas

### localStorage Key

Editável em `src/hooks/useCSVOperations.ts`:

```typescript
const STORAGE_KEY = "csv-last-upload"; // Mudar nome aqui
const EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutos
```

## 🚀 Deploy para Produção

### Pré-requisitos

- [ ] Todos os testes passando (TESTING.md)
- [ ] Console (F12) sem erros
- [ ] Performance OK (<3s upload, <100ms cache hit)
- [ ] Git commit realizado

### Deploy no Vercel

```bash
# 1. Fazer push para GitHub
git add .
git commit -m "feat: TanStack Query integration"
git push

# 2. Conectar no Vercel: https://vercel.com
# 3. Importar repositório
# 4. Deploy automático!
```

### Deploy em Servidor Próprio

```bash
# 1. Build para produção
npm run build

# 2. Iniciar servidor
npm start

# 3. Usando PM2 (recomendado)
npm install -g pm2
pm2 start npm -- start
pm2 save
```

## 🆘 Troubleshooting

| Problema                                     | Solução                                           |
| -------------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| `Cannot find module '@tanstack/react-query'` | `npm install`                                     |
| `QueryProvider is not defined`               | Verificar import em `src/app/layout.tsx`          |
| API retorna erro 500                         | Verificar arquivo CSV válido, console erros       |
| localStorage não funciona                    | Usar HTTPS ou localhost (não funciona em file://) |
| Cache não está funcionando                   | F12 > Network > desabilitar cache                 | Verificar staleTime em QueryProvider |

## ✨ Próximos Passos

1. ✅ Executar TESTING.md (6 testes)
2. ✅ Ler ARCHITECTURE.md
3. ✅ Implementar exemplos de EXAMPLES.md
4. ✅ Adicionar ReactQueryDevtools (desenvolvimento)
5. ✅ Deploy em produção

---

**Versão**: 1.0 (TanStack Query)  
**Node.js Mínimo**: 18+  
**Next.js**: 15.0.0+  
**Status**: ✅ Testado e Validado

```
✅ package.json (adicionado @tanstack/react-query)
✅ src/app/layout.tsx (QueryProvider wrapper)
✅ src/components/CSVUploader.tsx (useParseCSV)
✅ src/components/DataTable.tsx (useCopyToClipboard)
```

### Passo 4: Iniciar Servidor

```bash
npm run dev
```

Você deve ver:

```
  ▲ Next.js 15.0.0
  - Local: http://localhost:3000
```

## 🔧 Configuração

### QueryClient Settings

```typescript
// src/providers/QueryProvider.tsx
staleTime: 5 * 60 * 1000; // 5 minutos
gcTime: 10 * 60 * 1000; // 10 minutos
retry: 1; // 1 tentativa
refetchOnWindowFocus: false; // Não refaz ao voltar foco
```

### localStorage

```
Chave: "csv-last-upload"
Expiração: 5 minutos (automático)
Dados: { rows, columns, bank, month }
```

## 🧪 Validação Rápida

1. Abra http://localhost:3000
2. Faça upload de um CSV
3. Abra DevTools (F12)
4. Verifique Application > Local Storage
5. Procure por "csv-last-upload"
6. Recarregue a página
7. Dados devem estar lá

## 🐛 Troubleshooting

### "Cannot find module @tanstack/react-query"

```bash
npm install
rm -rf .next
npm run dev
```

### "QueryProvider is not defined"

- Verificar `src/app/layout.tsx` importa e usa QueryProvider
- Executar `npm install` novamente

### localStorage vazio

- Abrir DevTools (F12)
- Ir para Application > Local Storage
- Se "csv-last-upload" não aparecer, fazer novo upload

## 📊 Fluxo de Dados

```
Upload CSV
  ↓
useParseCSV mutation
  ↓
POST /api/csv/parse
  ↓
Backend processa
  ↓
localStorage.setItem()
  ↓
Zustand store
  ↓
DataTable render
```

## ✅ Próximo Passo

Leia **TESTING.md** para validar tudo está funcionando.
