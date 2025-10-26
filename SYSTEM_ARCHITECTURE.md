# 🏗️ SYSTEM ARCHITECTURE - Arquitetura Técnica

**Versão:** 1.0  
**Data:** Outubro 2025  
**Status:** Produção

## 📑 Índice

1. [Overview](#overview)
2. [Arquitetura](#arquitetura)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)
5. [State Management](#state-management)
6. [Data Flow](#data-flow)
7. [Componentes](#componentes)
8. [API & Backend](#api--backend)
9. [Tipos & Interfaces](#tipos--interfaces)
10. [Utilitários](#utilitários)
11. [Bancos Suportados](#bancos-suportados)
12. [Performance & Otimizações](#performance--otimizações)
13. [Tratamento de Erros](#tratamento-de-erros)
14. [Guia de Desenvolvimento](#guia-de-desenvolvimento)

---

## Overview

**Café Dashboard** é uma aplicação web para análise e comparação de extratos bancários em formato CSV. Permite:

- 📤 **Upload de arquivos** CSV de múltiplos bancos
- 🏦 **Seleção manual** do banco para cada arquivo
- 📊 **Comparação visual** de transações entre bancos
- 📋 **Mapeamento de colunas** para nomes diferentes
- 📈 **Gráficos e análises** de créditos vs débitos
- 📑 **Tabelas detalhadas** com todos os dados
- 💾 **Exportação de dados** em CSV

### Decisões Arquiteturais Principais

1. **Sem detecção automática de banco** - Sempre requer seleção manual do usuário
2. **Suporte a delimitadores variáveis** - Diferentes bancos usam `;` ou `,`
3. **Mapeamento de colunas flexível** - Permite renomear colunas para comparação
4. **Formatação customizável** - Usuário controla formato de datas e valores negativos
5. **Persistência em localStorage** - Estado mantido entre sessões

---

## Arquitetura

### Diagrama de Alto Nível

```
┌─ User Browser ─────────────────────────────────┐
│                                                │
│  ┌──────────────────────────────────┐         │
│  │  React Components                │         │
│  │  ├─ AppLayout (Sidebar + Main)  │         │
│  │  ├─ ImporterDashboard           │         │
│  │  ├─ ComparisonPage              │         │
│  │  │  ├─ TabsComparisonView       │         │
│  │  │  ├─ ComparativeAnalysis      │         │
│  │  │  ├─ ExtractTablesView        │         │
│  │  │  └─ ConsolidationView        │         │
│  │  └─ CSVUploader / ColumnMapper  │         │
│  └──────────────────────────────────┘         │
│              │                                 │
│              ▼                                 │
│  ┌──────────────────────────────────┐         │
│  │ State Management                 │         │
│  │ ├─ useDataStore (Zustand)       │         │
│  │ └─ useComparisonStore (Zustand) │         │
│  └──────────────────────────────────┘         │
│              │                                 │
│              ▼                                 │
│  ┌──────────────────────────────────┐         │
│  │ TanStack Query (Server Cache)    │         │
│  │ ├─ useParseCSV (POST)            │         │
│  │ ├─ useCopyToClipboard            │         │
│  │ └─ useLastCSVUpload              │         │
│  └──────────────────────────────────┘         │
│              │                                 │
└──────────────┼─────────────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
┌───────────────┐  ┌──────────────────┐
│ Next.js API   │  │ Browser Storage  │
│ /api/csv/parse│  │ - localStorage   │
│               │  │ - Memory cache   │
│ - Parse CSV   │  │ (TTL: 5min)      │
│ - Clean data  │  └──────────────────┘
│ - Format rows │
└───────────────┘
```

---

## Stack Tecnológico

| Tecnologia         | Versão  | Propósito                          |
| ------------------ | ------- | ---------------------------------- |
| **Next.js**        | 15.0.0  | Framework React com SSR e API      |
| **React**          | 18.3.1  | Biblioteca UI                      |
| **TypeScript**     | 5.6.3   | Tipagem estática                   |
| **Tailwind CSS**   | 4       | Estilos utilitários                |
| **Zustand**        | 5.0.8   | State management local             |
| **TanStack Query** | 5.32.1  | Cache & sincronização com servidor |
| **Recharts**       | 3.3.0   | Gráficos e visualizações           |
| **PapaParse**      | 5.5.3   | Parsing de CSV                     |
| **Lucide React**   | 0.548.0 | Ícones SVG                         |

---

## Estrutura de Arquivos

```
café_dashboard/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout com QueryProvider
│   │   ├── page.tsx                      # Dashboard (/)
│   │   ├── comparison/
│   │   │   └── page.tsx                  # Página comparação (/comparison)
│   │   └── api/csv/parse/
│   │       └── route.ts                  # API POST /api/csv/parse
│   │
│   ├── components/                       # React Components
│   │   ├── index.ts                      # Barrel export principal
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx             # Wrapper com Sidebar + Main
│   │   │   ├── Sidebar.tsx               # Navegação lateral
│   │   │   ├── ImporterDashboard.tsx     # Dashboard principal
│   │   │   └── index.ts
│   │   ├── comparison/
│   │   │   ├── ComparisonPage.tsx        # Orquestrador comparação
│   │   │   ├── TabsComparisonView.tsx    # Abas (Análise/Extratos/Consolidação)
│   │   │   ├── ComparativeAnalysis.tsx   # Gráficos crédito/débito
│   │   │   ├── ExtractTablesView.tsx     # Tabelas detalhadas
│   │   │   ├── ConsolidationView.tsx     # Totais consolidados
│   │   │   ├── ColumnMapper.tsx          # Mapeamento de colunas
│   │   │   └── index.ts
│   │   ├── upload/
│   │   │   ├── CSVUploader.tsx           # Upload dashboard
│   │   │   ├── ComparisonCSVUploader.tsx # Upload comparação
│   │   │   ├── BankSelectorModal.tsx     # Modal seleção banco
│   │   │   └── index.ts
│   │   ├── table/
│   │   │   ├── DataTable.tsx             # Tabela com filtros
│   │   │   ├── SortIndicator.tsx         # Indicador de ordem
│   │   │   ├── ColumnVisibility.tsx      # Toggle colunas visíveis
│   │   │   ├── TableControls.tsx         # Botões (Copy, Export, Filter)
│   │   │   ├── FilterBadgeList.tsx       # Filtros ativos
│   │   │   ├── TableHeader.tsx           # Header com sorting
│   │   │   ├── TableRow.tsx              # Linha individual
│   │   │   ├── TableBody.tsx             # Tbody wrapper
│   │   │   ├── types.ts                  # ColumnFilter interface
│   │   │   └── index.ts
│   │   ├── formatting/
│   │   │   ├── FormattingPanel.tsx       # Controles formatação
│   │   │   └── index.ts
│   │   ├── chart/
│   │   │   ├── ValueDistributionChart.tsx # Gráficos de distribuição
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── filters/
│   │   │   ├── AdvancedFiltersModal.tsx  # Modal filtros avançados
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── modal/
│   │   │   ├── Modal.tsx                 # Modal base
│   │   │   ├── BankSelectorModal.tsx     # Seletor de banco
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── ui/
│   │       ├── Button.tsx                # Botão reutilizável
│   │       ├── Input.tsx                 # Input reutilizável
│   │       ├── Select.tsx                # Select reutilizável
│   │       ├── Badge.tsx                 # Badge reutilizável
│   │       ├── Card.tsx                  # Card reutilizável
│   │       ├── InfoGrid.tsx              # Grid informações
│   │       └── index.ts
│   │
│   ├── hooks/                            # Custom Hooks
│   │   ├── useCSVOperations.ts           # useParseCSV, useCopyToClipboard
│   │   └── useLastCSVUpload.ts           # Cache último upload
│   │
│   ├── lib/                              # Lógica de negócio
│   │   ├── csvParser.ts                  # Parsing & validação CSV
│   │   ├── bankTemplates.ts              # Configurações dos bancos
│   │   └── exportUtils.ts                # Exportação dados
│   │
│   ├── store/                            # Zustand Stores
│   │   ├── dataStore.ts                  # Estado dashboard principal
│   │   └── comparisonStore.ts            # Estado comparação
│   │
│   ├── types/                            # TypeScript Types
│   │   └── index.ts                      # Interfaces centralizadas
│   │
│   ├── utils/                            # Utilitários
│   │   ├── formatUtils.ts                # Formatação & parsing valores
│   │   ├── constants.ts                  # Constantes globais
│   │   └── index.ts
│   │
│   └── providers/
│       └── QueryProvider.tsx             # TanStack Query setup
│
├── public/                               # Arquivos estáticos
├── package.json                          # Dependências
├── tsconfig.json                         # Configuração TypeScript
├── tailwind.config.ts                    # Configuração Tailwind
├── next.config.ts                        # Configuração Next.js
├── postcss.config.mjs                    # Configuração PostCSS
└── .gitignore
```

---

## State Management

### 1. **useDataStore** (Zustand)

Gerencia o estado do dashboard principal.

```typescript
interface DataStore {
  tableData: TableData | null;
  columnSettings: ColumnSettings[];
  selectedRows: Set<number>;
  loading: boolean;
  error: string | null;
  formatSettings: FormatSettings;

  // Actions
  setTableData(data: TableData | null): void;
  setColumnSettings(settings: ColumnSettings[]): void;
  updateColumnVisibility(name: string, visible: boolean): void;
  toggleRowSelection(index: number): void;
  selectAllRows(): void;
  deleteRows(indices: number[]): void;
  setFormatSettings(settings: Partial<FormatSettings>): void;
  saveToLocalStorage(): void;
  loadFromLocalStorage(): void;
  reset(): void;
}
```

**Persistência:** localStorage com chave `"cafe_dashboard_table_data"`

### 2. **useComparisonStore** (Zustand)

Gerencia o estado da página de comparação.

```typescript
interface ComparisonState {
  comparedFiles: ComparedFile[];
  commonColumns: string[];
  columnMappings: ColumnMapping;

  // Actions
  addFile(file: ComparedFile): void;
  removeFile(fileId: string): void;
  updateCommonColumns(): void;
  setColumnMapping(mapping: ColumnMapping): void;
  clearAll(): void;
}
```

**Persistência:** localStorage com chave `"comparison-store"`

---

## Data Flow

### Upload CSV (Dashboard)

```
1. User selects file
   ↓
2. BankSelectorModal shown (ALWAYS - no auto-detection)
   ↓
3. User selects bank → useParseCSV mutation triggered
   ↓
4. POST /api/csv/parse { file, forcedBank }
   ↓
5. Server:
   - cleanMetadataLines(content, delimiter)
   - parseCSVFromString(cleaned, delimiter)
   - detectMonthFromData(first date)
   - return { rows, columns, bank, month }
   ↓
6. Client:
   - validateCSV(rows, columns, bank)
   - If valid: useDataStore.setTableData(data)
   - Update columnSettings
   - Show DataTable
   ↓
7. TableData cached in localStorage (TTL: 5min)
```

### Comparação de Arquivos

```
1. User uploads file 1 → selects bank → parsed & added to useComparisonStore
   ↓
2. User uploads file 2 → selects bank → parsed & added to useComparisonStore
   ↓
3. updateCommonColumns() calculates intersection of columns
   ↓
4. User can map columns with ColumnMapper (ex: "Data" ↔ "Data Lançamento")
   ↓
5. TabsComparisonView shows 3 tabs:
   - Análise Comparativa: Gráficos crédito/débito por banco
   - Extratos Detalhados: Tabelas lado-a-lado com todos os dados
   - Consolidação: Totais e estatísticas consolidadas
```

---

## Componentes

### Layout Components

#### **AppLayout.tsx**

Wrapper que combina Sidebar com conteúdo principal.

```tsx
<AppLayout>
  <ImporterDashboard /> // ou
  <ComparisonPage />
</AppLayout>
```

- Sidebar fixo na esquerda
- Main area scrollável
- Gradient background

#### **Sidebar.tsx**

Navegação lateral com links ativos.

- Logo/Header
- Links: Dashboard, Comparação
- Active state via `usePathname()`

#### **ImporterDashboard.tsx**

Dashboard principal do upload.

- CSVUploader component
- DataTable com dados carregados
- Formatting controls
- Export/Copy buttons

### Comparison Components

#### **ComparisonPage.tsx**

Orquestrador da página de comparação.

- Header com botão "Adicionar Arquivo"
- Grid de arquivos carregados
- ComparisonCSVUploader
- TabsComparisonView

#### **TabsComparisonView.tsx**

Abas para diferentes visualizações.

Tabs:

1. **Análise Comparativa** → ComparativeAnalysis
2. **Extratos Detalhados** → ExtractTablesView
3. **Consolidação** → ConsolidationView

#### **ComparativeAnalysis.tsx**

Gráficos comparativos.

- BarChart: Créditos vs Débitos por banco
- PieChart: Distribuição créditos
- PieChart: Distribuição débitos

Separa valores por:

- Coluna "Tipo de Transação" (se existir)
- Ou por sinal: valor > 0 = crédito, < 0 = débito

#### **ExtractTablesView.tsx**

Tabelas detalhadas com todos os dados.

- Mostra TODAS as colunas do arquivo original
- Info macro com 4 cards: Créditos, Débitos, Valor Inicial, Valor Final
- Lado-a-lado se 2+ arquivos
- Formatting controls (data, negativo, search, visibilidade)

#### **ConsolidationView.tsx**

Totais e estatísticas consolidadas.

- Total geral por banco
- Total créditos/débitos
- Média de transações
- Período coberto

#### **ColumnMapper.tsx**

Interface para mapear colunas com nomes diferentes.

- Modal com seleção de colunas
- Auto-detecta colunas com nomes similares
- Salva mapeamento em `columnMappings`

### Upload Components

#### **CSVUploader.tsx**

Upload de arquivo CSV no dashboard.

- Drag & drop support
- File input
- **SEMPRE mostra BankSelectorModal** - sem detecção automática

#### **ComparisonCSVUploader.tsx**

Upload de arquivo CSV para comparação.

- Drag & drop support
- **SEMPRE mostra BankSelectorModal** - sem detecção automática

#### **BankSelectorModal.tsx**

Modal para seleção manual do banco.

- Radio buttons para cada banco
- Descrição do banco
- OK/Cancel buttons

### Table Components

#### **DataTable.tsx**

Tabela principal com filtros e sorting.

- TableHeader com sorting
- TableBody com linhas
- TableControls (Copy, Export, Filter, Delete)
- ColumnVisibility toggles
- FilterBadgeList (filtros ativos)

Subcomponents:

- **SortIndicator.tsx** - Chevron indicador de ordem
- **ColumnVisibility.tsx** - Toggles de visibilidade
- **TableControls.tsx** - Botões de ação
- **FilterBadgeList.tsx** - Filtros ativos
- **TableHeader.tsx** - Header com sorting
- **TableRow.tsx** - Linha individual
- **TableBody.tsx** - Tbody wrapper

### UI Components (Atomic Design)

- **Button.tsx** - Variantes: primary, secondary, danger, success, ghost
- **Input.tsx** - Form input com label, error, helper text
- **Select.tsx** - Dropdown
- **Badge.tsx** - 5 variantes de cor
- **Card.tsx** - Container reutilizável
- **InfoGrid.tsx** - Grid de informações (2/3/4 colunas)

---

## API & Backend

### POST /api/csv/parse

**Endpoint:** `POST /api/csv/parse`

**Request:**

```typescript
{
  file: File; // File object
  forcedBank: string; // Bank ID (required)
}
```

**Response (200):**

```typescript
{
  rows: ParsedRow[];
  columns: string[];
  bank: string;
  month: string;
}
```

**Response (400/500):**

```typescript
{
  error: string;
  details?: any;
}
```

**Validações:**

- `forcedBank` é obrigatório (lance erro se não provided)
- Usa delimiter do template do banco
- Limpa linhas de metadados
- Deteta mês a partir da primeira data

---

## Tipos & Interfaces

### BankTemplate

```typescript
interface BankTemplate {
  id: string; // "caixa", "inter", "itau", etc
  name: string; // "Caixa Econômica", etc
  delimiter: string; // ";" ou ","
  expectedColumns: string[]; // Colunas esperadas
  dateColumn: string; // Nome da coluna de data
  descriptionColumn: string; // Nome da coluna descrição
  valueColumn: string; // Nome da coluna valor
  typeColumn?: string; // Opcional: tipo transação
  referenceColumn?: string; // Opcional: referência
  futureColumn?: string; // Opcional: lançamento futuro
}
```

### ComparedFile

```typescript
interface ComparedFile {
  id: string; // UUID único
  bankId: string; // ID do banco
  bankName: string; // Nome exibido
  uploadDate: string; // ISO string
  rowCount: number; // Quantidade linhas
  data: ParsedRow[]; // Dados do CSV
  columns: string[]; // Colunas (nomes originais)
}
```

### ColumnMapping

```typescript
interface ColumnMapping {
  [standardColumnName: string]: Record<string, string>;
  // Ex: {
  //   "Data": { fileId1: "Data", fileId2: "Data Lançamento" },
  //   "Valor": { fileId1: "Valor", fileId2: "Valor" }
  // }
}
```

### FormatSettings

```typescript
interface FormatSettings {
  dateFormat: "full" | "date-only" | "day-only";
  showNegativeAsPositive: boolean;
  splitByPosNeg: boolean;
}
```

Ver `src/types/index.ts` para todas as interfaces.

---

## Utilitários

### formatUtils.ts

**Funções:**

- `parseValueBR(valor)` - Parseia valor em formato brasileiro
- `formatDate(dateStr, format)` - Formata data
- `formatNumeric(value, showAsPositive)` - Formata número
- `formatValue(value, settings)` - Formata genérico
- `isDateValue(value)` - Detecta se é data
- `isNumericValue(value)` - Detecta se é número

**Exemplo:**

```typescript
import { parseValueBR, formatDate } from "@/utils";

const num = parseValueBR("R$           646,00"); // 646
const date = formatDate("15/09/2025 23:59", "date-only"); // "15/09/2025"
```

### constants.ts

**Constantes:**

- `CACHE_TTL` - Tempo de cache (5min)
- `COLORS_CREDIT` / `COLORS_DEBIT` - Cores para gráficos
- `HEADER_KEYWORDS` - Palavras detectar header
- `DEFAULT_FORMAT_SETTINGS` - Formatação padrão
- `ERROR_MESSAGES` - Mensagens erro
- `LABELS` - Labels botões

---

## Bancos Suportados

| Banco           | ID          | Delimitador | Colunas                                                                  |
| --------------- | ----------- | ----------- | ------------------------------------------------------------------------ |
| Caixa Econômica | `caixa`     | `;`         | Data, Descrição, Valor, Tipo de transação, Referência, Lançamento futuro |
| Banco Inter     | `inter`     | `;`         | Data Lançamento, Histórico, Descrição, Valor, Saldo                      |
| Itaú            | `itau`      | `,`         | Data, Descrição, Valor                                                   |
| Bradesco        | `bradesco`  | `,`         | Data, Descrição, Valor                                                   |
| Santander       | `santander` | `,`         | Data, Descrição, Valor                                                   |
| OnilX           | `onilx`     | `;`         | Data, Descrição, Valor, Tipo de transação, Referência, Lançamento futuro |
| Genérico        | `generic`   | `,`         | (flexível)                                                               |

**Adicionar novo banco:**

```typescript
// src/lib/bankTemplates.ts
export const BANK_TEMPLATES = {
  // ... existing
  newbank: {
    id: "newbank",
    name: "Novo Banco",
    delimiter: ";",
    expectedColumns: ["Data", "Descrição", "Valor"],
    dateColumn: "Data",
    descriptionColumn: "Descrição",
    valueColumn: "Valor",
  },
};
```

---

## Performance & Otimizações

### Caching

1. **TanStack Query** - Cache de requests API

   - TTL: 5 minutos
   - Deduplicação automática

2. **localStorage** - Persistência de estado

   - `cafe_dashboard_table_data` - último upload
   - `comparison-store` - arquivos comparação

3. **Memoization** - Componentes React
   - `useMemo` em cálculos pesados
   - `useCallback` em event handlers

### Code Splitting

- Componentes de cada página carregados lazy
- Modais e dropdowns lazy-loaded quando necessário

### Render Optimization

- Componentes funcionais com hooks
- Evita re-renders desnecessários com proper dependencies
- TableBody renderiza apenas linhas visíveis (quando aplicável)

---

## Tratamento de Erros

### Estratégia

1. **Validação de input** - Antes de processar
2. **Error boundaries** - Captura erros render
3. **Try-catch em async** - Operações API
4. **User feedback** - Toast/Alert para erros

### Erros Comuns

| Erro                                | Causa                           | Solução                                |
| ----------------------------------- | ------------------------------- | -------------------------------------- |
| "É necessário selecionar o banco"   | `forcedBank` não provided       | Mostrar BankSelectorModal              |
| "CSV vazio ou inválido"             | Arquivo sem dados               | Verificar arquivo CSV                  |
| "Colunas esperadas não encontradas" | Banco selecionado incorreto     | Solicitar re-seleção banco             |
| "Erro ao parsear CSV"               | Encoding ou delimiter incorreto | Auto-detect delimiter, permitir manual |

### Error Messages (constants.ts)

```typescript
ERROR_MESSAGES = {
  BANK_REQUIRED: "É necessário selecionar o banco manualmente",
  CSV_EMPTY: "CSV vazio ou inválido",
  CSV_PARSE_ERROR: "Erro ao parsear CSV",
  NO_FILES_LOADED: "Nenhum arquivo carregado",
  INVALID_FORMAT: "Formato de arquivo inválido",
  MISSING_COLUMNS: "Colunas esperadas não encontradas",
};
```

---

## Guia de Desenvolvimento

### Adicionar Novo Componente

1. Criar arquivo em pasta apropriada
2. Exportar em `index.ts` local
3. Adicionar em `components/index.ts` principal
4. Usar imports de barrel exports

```typescript
// src/components/myfeature/MyComponent.tsx
export function MyComponent() {
  // ...
}

// src/components/myfeature/index.ts
export { MyComponent } from "./MyComponent";

// src/components/index.ts
export { MyComponent } from "./myfeature";
```

### Adicionar Novo Tipo

```typescript
// src/types/index.ts
export interface MyType {
  // ...
}
```

### Adicionar Nova Rota

```typescript
// src/app/myroute/page.tsx
"use client";

import { AppLayout } from "@/components";

export default function MyRoute() {
  return <AppLayout>{/* content */}</AppLayout>;
}
```

### Adicionar Novo Store

```typescript
// src/store/mystore.ts
import { create } from "zustand";

interface MyState {
  // ...
}

export const useMyStore = create<MyState>((set) => ({
  // implementation
}));

// Usar em componentes
import { useMyStore } from "@/store/mystore";
```

### Testing

Não há testes unitários/integração configurados. Para adicionar:

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

Então criar arquivos `.test.tsx` próximo aos componentes.

### Debug

1. **Browser DevTools** - Inspecionar React components
2. **TanStack Query DevTools** - `npm install @tanstack/react-query-devtools`
3. **localStorage** - `localStorage.getItem("cafe_dashboard_table_data")`
4. **Network tab** - Verificar requests `/api/csv/parse`

---

## Checklist de Deployment

- [ ] Build sem erros: `npm run build`
- [ ] Sem warnings em TypeScript
- [ ] Todos os imports resolvem corretamente
- [ ] localStorage funciona
- [ ] Uploads de múltiplos bancos funcionam
- [ ] Comparação entre arquivos funciona
- [ ] Exportação de dados funciona
- [ ] Formatação de data/número funciona
- [ ] Responsive design em mobile

---

**Última Atualização:** Outubro 2025  
**Próximas Melhorias:** Testes automatizados, Autenticação, Análises avançadas
