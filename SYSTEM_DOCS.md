# 🏗️ SYSTEM_DOCS - Documentação Técnica para Desenvolvedores

**Versão:** 1.1 (com Banco Itaú)  
**Data:** Janeiro 2026  
**Status:** Produção

---

## 📑 Índice

1. [Overview do Sistema](#overview-do-sistema)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitetura](#arquitetura)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)
5. [State Management](#state-management)
6. [Data Flow](#data-flow)
7. [Bancos Suportados](#bancos-suportados)
8. [Componentes](#componentes)
9. [Hooks Personalizados](#hooks-personalizados)
10. [Utilitários](#utilitários)
11. [Tipos & Interfaces](#tipos--interfaces)
12. [Performance & Otimizações](#performance--otimizações)
13. [Tratamento de Erros](#tratamento-de-erros)
14. [Clean Code & Componentização](#clean-code--componentização)
15. [Guia de Desenvolvimento](#guia-de-desenvolvimento)

---

## Overview do Sistema

**Café Dashboard** é uma aplicação web SPA (Single Page Application) para análise e comparação de extratos bancários em formato CSV.

### Funcionalidades Principais

1. **Dashboard de Upload**:

   - Upload de CSV com drag & drop
   - Detecção automática de banco
   - Seleção manual obrigatória com fallback
   - Tabela interativa com filtros avançados
   - Exportação (CSV, clipboard)

2. **Módulo de Comparação**:
   - Upload de múltiplos arquivos (até 10)
   - Mapeamento de colunas diferentes
   - Gráficos comparativos (créditos vs débitos)
   - Tabelas detalhadas lado-a-lado
   - Resumo consolidado

### Decisões Arquiteturais

1. **Seleção manual de banco**: Sempre exige confirmação do usuário (evita erros)
2. **Delimitadores variáveis**: Suporta `;` e `,` dependendo do banco
3. **Mapeamento de colunas**: Permite comparar extratos com estruturas diferentes
4. **Persistência local**: localStorage com TTL de 5 minutos
5. **Cache inteligente**: TanStack Query para requests API
6. **Zero memory leaks**: Cleanup automático em useEffect

---

## Stack Tecnológico

| Tecnologia         | Versão  | Propósito                                     |
| ------------------ | ------- | --------------------------------------------- |
| **Next.js**        | 15.0.0  | Framework React com SSR e API Routes          |
| **React**          | 18.3.1  | Biblioteca UI                                 |
| **TypeScript**     | 5.6.3   | Tipagem estática                              |
| **Tailwind CSS**   | 4       | Estilos utilitários                           |
| **Zustand**        | 5.0.8   | State management global (client-side)         |
| **TanStack Query** | 5.32.1  | Cache & sincronização servidor                |
| **Recharts**       | 3.3.0   | Gráficos (BarChart, PieChart)                 |
| **PapaParse**      | 5.5.3   | Parsing de CSV                                |
| **Lucide React**   | 0.548.0 | Ícones SVG                                    |
| **Sonner**         | 1.7.3   | Toast notifications (substituiu window.alert) |

---

## Arquitetura

### Diagrama de Alto Nível

```
┌─ Browser (Client) ────────────────────────────────┐
│                                                   │
│  React Components                                 │
│  ├─ AppLayout (Sidebar + Main)                   │
│  ├─ ImporterDashboard                            │
│  ├─ ComparisonPage                               │
│  │  ├─ TabsComparisonView                        │
│  │  ├─ ComparativeAnalysis (gráficos)            │
│  │  ├─ ExtractTablesView (tabelas detalhadas)    │
│  │  └─ CompleteDataView (consolidação)           │
│  └─ CSVUploader / ColumnMapper                   │
│                                                   │
│  State Management                                 │
│  ├─ useDataStore (Zustand) → Dashboard           │
│  ├─ useComparisonStore (Zustand) → Comparison    │
│  └─ uiStore (Zustand) → UI state (sidebar)       │
│                                                   │
│  TanStack Query (Cache)                           │
│  ├─ useParseCSV (POST /api/csv/parse)            │
│  ├─ useCopyToClipboard                           │
│  └─ TTL: 5min                                     │
│                                                   │
└───────────────────┼───────────────────────────────┘
                    │
       ┌────────────┴────────────┐
       │                         │
       ▼                         ▼
┌──────────────────┐    ┌─────────────────┐
│ Next.js API      │    │ localStorage    │
│ /api/csv/parse   │    │ - table_data    │
│                  │    │ - comparison    │
│ - Parse CSV      │    │ - TTL: 5min     │
│ - Clean metadata │    └─────────────────┘
│ - Format rows    │
└──────────────────┘
```

### Separação de Responsabilidades

| Camada         | Responsabilidade                             |
| -------------- | -------------------------------------------- |
| **Components** | UI, renderização, event handlers             |
| **Hooks**      | Lógica reutilizável, side effects            |
| **Stores**     | Estado global (Zustand)                      |
| **Lib**        | Lógica de negócio (csvParser, bankTemplates) |
| **Utils**      | Funções puras (formatUtils, logger)          |
| **Types**      | Interfaces TypeScript centralizadas          |
| **API**        | Endpoints Next.js (parsing CSV)              |

---

## Estrutura de Arquivos

```
cafe_dashboard/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout (QueryProvider, ToastProvider)
│   │   ├── page.tsx                      # Home: Dashboard
│   │   ├── comparison/
│   │   │   └── page.tsx                  # Página de comparação
│   │   └── api/csv/parse/
│   │       └── route.ts                  # POST /api/csv/parse
│   │
│   ├── components/                       # Componentes React
│   │   ├── index.ts                      # Barrel export principal
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx             # Wrapper (Sidebar + Main)
│   │   │   ├── Sidebar.tsx               # Navegação lateral
│   │   │   ├── ImporterDashboard.tsx     # Dashboard principal
│   │   │   ├── DataTable.tsx             # Tabela interativa
│   │   │   ├── DualTableWrapper.tsx      # Wrapper positivos/negativos
│   │   │   ├── SimpleTable.tsx           # Tabela reutilizável
│   │   │   ├── ErrorAlert.tsx            # Alert de erro
│   │   │   └── index.ts
│   │   ├── comparison/
│   │   │   ├── ComparisonPage.tsx        # Orquestrador comparação
│   │   │   ├── TabsComparisonView.tsx    # Abas (Análise/Extratos/Consolidação)
│   │   │   ├── ComparativeAnalysis.tsx   # Gráficos comparativos
│   │   │   ├── ExtractTablesView.tsx     # Tabelas detalhadas
│   │   │   ├── CompleteDataView.tsx      # Consolidação completa
│   │   │   ├── ColumnMapper.tsx          # Mapeamento de colunas
│   │   │   └── index.ts
│   │   ├── upload/
│   │   │   ├── CSVUploader.tsx           # Upload dashboard
│   │   │   ├── ComparisonCSVUploader.tsx # Upload comparação
│   │   │   ├── BankSelectorModal.tsx     # Modal seleção banco
│   │   │   └── index.ts
│   │   ├── table/
│   │   │   ├── SortIndicator.tsx         # Indicador ▲▼
│   │   │   ├── ColumnVisibility.tsx      # Toggle colunas
│   │   │   ├── TableControls.tsx         # Botões ação
│   │   │   ├── FilterBadgeList.tsx       # Badges filtros ativos
│   │   │   ├── TableHeader.tsx           # Header com sorting
│   │   │   ├── TableRow.tsx              # Linha individual
│   │   │   ├── TableBody.tsx             # Tbody wrapper
│   │   │   ├── types.ts                  # ColumnFilter interface
│   │   │   └── index.ts
│   │   ├── formatting/
│   │   │   ├── FormattingPanel.tsx       # Painel formatação (data, negativo)
│   │   │   └── index.ts
│   │   ├── chart/
│   │   │   ├── ValueDistributionChart.tsx # Gráficos Recharts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── filters/
│   │   │   ├── AdvancedFiltersModal.tsx  # Modal filtros avançados
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── modal/
│   │   │   ├── Modal.tsx                 # Modal base reutilizável
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── ui/                           # Atomic Design Components
│   │       ├── Button.tsx                # Botão (variants: primary, secondary, danger, success, ghost)
│   │       ├── Input.tsx                 # Input com label
│   │       ├── Select.tsx                # Dropdown
│   │       ├── Badge.tsx                 # Badge (5 variantes)
│   │       ├── Card.tsx                  # Container reutilizável
│   │       ├── InfoGrid.tsx              # Grid informações (2/3/4 cols)
│   │       └── index.ts
│   │
│   ├── hooks/                            # Custom Hooks
│   │   ├── useCSVOperations.ts           # useParseCSV, useCopyToClipboard
│   │   ├── useLastCSVUpload.ts           # Cache último upload
│   │   └── useToast.ts                   # Hook para Sonner toasts
│   │
│   ├── lib/                              # Lógica de negócio
│   │   ├── csvParser.ts                  # Parse & validação CSV
│   │   ├── bankTemplates.ts              # Configurações dos bancos
│   │   └── exportUtils.ts                # Exportação (CSV, clipboard)
│   │
│   ├── store/                            # Zustand Stores
│   │   ├── dataStore.ts                  # Estado dashboard principal
│   │   ├── comparisonStore.ts            # Estado comparação
│   │   └── uiStore.ts                    # Estado UI (sidebar, etc)
│   │
│   ├── types/                            # TypeScript Types
│   │   └── index.ts                      # Interfaces centralizadas
│   │
│   ├── utils/                            # Utilitários
│   │   ├── formatUtils.ts                # Formatação datas/valores
│   │   ├── constants.ts                  # Constantes (HEADER_KEYWORDS, etc)
│   │   ├── referenceFormatter.ts         # Formatar referência banco
│   │   ├── logger.ts                     # Logger centralizado
│   │   └── index.ts
│   │
│   └── providers/                        # React Providers
│       ├── QueryProvider.tsx             # TanStack Query Provider
│       └── ToastProvider.tsx             # Sonner Toast Provider
│
├── public/                               # Arquivos estáticos
├── README.md                             # Documentação do usuário
├── SYSTEM_DOCS.md                        # Este arquivo (documentação técnica)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── postcss.config.mjs
```

---

## State Management

### 1. **useDataStore** (Zustand)

Gerencia o estado do dashboard principal.

```typescript
interface DataState {
  tableData: TableData | null;
  columnSettings: ColumnSettings[];
  formatSettings: FormatSettings;
  selectedRows: Record<string, boolean>;

  // Actions
  setTableData(data: TableData): void;
  updateColumnSettings(settings: ColumnSettings[]): void;
  setFormatSettings(settings: Partial<FormatSettings>): void;
  toggleRowSelection(rowKey: string): void;
  deleteRows(keys: string[]): void;
  resetStore(): void;
}
```

**Persistência:** localStorage com chave `"cafe_dashboard_table_data"` (TTL: 5min)

### 2. **useComparisonStore** (Zustand)

Gerencia o estado do módulo de comparação.

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

### 3. **useUIStore** (Zustand)

Gerencia estado da UI (sidebar, modais, etc).

```typescript
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar(): void;
}
```

---

## Data Flow

### Upload CSV (Dashboard)

```
1. User selects file (drag & drop ou clique)
   ↓
2. BankSelectorModal shown (SEMPRE - seleção manual obrigatória)
   ↓
3. User selects bank → useParseCSV mutation triggered
   ↓
4. POST /api/csv/parse { file, forcedBank }
   ↓
5. Server (route.ts):
   - Read file content
   - cleanMetadataLines(content, delimiter, bankId) → remove metadados
   - parseCSVFromString(cleaned, delimiter) → parse com PapaParse
   - detectMonthFromData(firstDateRow) → detecta mês/ano
   - return { rows, columns, bank, month }
   ↓
6. Client (useParseCSV):
   - validateCSV(rows, columns, bank) → validação
   - If valid: useDataStore.setTableData(data)
   - Update columnSettings (todas visíveis por padrão)
   - Show DataTable
   ↓
7. TableData persisted in localStorage (TTL: 5min)
```

### Comparação de Arquivos

```
1. User uploads file 1
   → selects bank
   → parsed & added to useComparisonStore.comparedFiles[]
   ↓
2. User uploads file 2
   → selects bank
   → parsed & added to useComparisonStore.comparedFiles[]
   ↓
3. updateCommonColumns() → calcula intersection de colunas
   ↓
4. User pode mapear colunas com ColumnMapper
   Exemplo: "Data" ↔ "Data Lançamento"
   ↓
5. TabsComparisonView mostra 3 abas:
   - Análise Comparativa: Gráficos crédito/débito por banco
   - Extratos Detalhados: Tabelas lado-a-lado com TODAS as colunas
   - Consolidação: Totais e estatísticas consolidadas
```

---

## Bancos Suportados

| Banco           | ID          | Delimitador | Colunas                                                                  | Observações                                                          |
| --------------- | ----------- | ----------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Caixa Econômica | `caixa`     | `;`         | Data, Descrição, Valor, Tipo de transação, Referência, Lançamento futuro | -                                                                    |
| Banco Inter     | `inter`     | `;`         | Data Lançamento, Histórico, Descrição, Valor, Saldo                      | -                                                                    |
| **Itaú**        | `itau`      | `;`         | Data, Lançamento, Razão Social, CPF/CNPJ, Valor (R$), Saldo (R$)         | **10 linhas de metadados antes do header. Filtro de linhas "SALDO"** |
| Bradesco        | `bradesco`  | `,`         | Data, Descrição, Valor                                                   | -                                                                    |
| Santander       | `santander` | `,`         | Data, Descrição, Valor                                                   | -                                                                    |
| OnilX           | `onilx`     | `;`         | Data, Descrição, Valor, Tipo de transação, Referência, Lançamento futuro | -                                                                    |
| Genérico        | `generic`   | `,`         | (flexível)                                                               | Fallback para bancos não reconhecidos                                |

### Adicionar Novo Banco

**Passo 1:** Adicionar template em `src/lib/bankTemplates.ts`:

```typescript
export const BANK_TEMPLATES: Record<string, BankTemplate> = {
  // ... existing banks
  newbank: {
    id: "newbank",
    name: "Novo Banco",
    delimiter: ";",
    expectedColumns: ["Data", "Descrição", "Valor"],
    dateColumn: "Data",
    descriptionColumn: "Descrição",
    valueColumn: "Valor",
    skipHeaderRows: 0, // ou número fixo de linhas a pular
  },
};
```

**Passo 2:** (Opcional) Adicionar keywords para auto-detecção:

```typescript
export const AUTO_DETECT_KEYWORDS = {
  caixa: ["caixa econômica", "cef"],
  // ...
  newbank: ["novo banco", "keyword1", "keyword2"],
};
```

**Passo 3:** Testar upload com CSV do novo banco.

### Banco Itaú - Particularidades

**Estrutura do CSV:**

```
Linha 1-6:   Metadados (Atualização, Nome, Agência, Conta, etc)
Linha 7:     "Lançamentos;;;;;"
Linha 8:     "Periodo:;01/10/2025 até 29/10/2025;;;;"
Linha 9:     Vazio (;;;;)
Linha 10:    Header: "Data;Lançamento;Razão Social;CPF/CNPJ;Valor (R$);Saldo (R$)"
Linha 11:    "30/09/2025;SALDO ANTERIOR;;;;50043,12" → FILTRADA
Linha 12+:   Dados reais
```

**Detecção de Header:**

- `cleanMetadataLines()` busca linha com **"data" + "lançamento" + "razão social"**
- Ignora caso e acentos
- Specific para bankId "itau"

**Filtro de Linhas SALDO:**

- Após parsing, remove linhas onde descrição contém "saldo"
- Cobre: SALDO ANTERIOR, SALDO TOTAL DISPONÍVEL DIA, SALDO EM CONTA CORRENTE

**Implementação:**

```typescript
// src/lib/csvParser.ts - cleanMetadataLines()
if (bankId === "itau") {
  const hasDataColumn = normalized.includes("data");
  const hasLancamento = normalized.includes("lançamento") || normalized.includes("lancamento");
  const hasRazaoSocial = normalized.includes("razão social") || normalized.includes("razao social");

  if (hasDataColumn && hasLancamento && hasRazaoSocial) {
    return lines.slice(i).join("\n");
  }
}

// Filtro de linhas SALDO
const description = String(row[descriptionColumn] || "").toLowerCase();
if (description.includes("saldo")) {
  continue; // pula linha
}
```

---

## Componentes

### Princípios de Componentização

✅ **Seguimos:**

- **Atomic Design**: ui/ (atoms), table/ (molecules), layout/ (organisms)
- **Single Responsibility**: Cada componente tem uma responsabilidade clara
- **Reutilização**: Card, Button, Input, Modal são usados em toda aplicação
- **Barrel Exports**: index.ts em cada pasta para importações limpas
- **Props Typing**: Todas as props têm interfaces TypeScript

⚠️ **Melhorias identificadas:**

- Substituir divs `bg-white rounded-lg shadow-sm border` repetidas por `<Card>`
- Alguns componentes grandes (CompleteDataView.tsx ~700 linhas) podem ser quebrados

### UI Components (Atomic Design)

#### **Button.tsx**

Botão reutilizável com 5 variantes.

**Props:**

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}
```

**Uso:**

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Salvar
</Button>
```

#### **Card.tsx**

Container reutilizável com border, shadow e padding.

**Props:**

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg"; // p-2, p-4, p-6
}
```

**Uso:**

```tsx
<Card padding="lg" className="hover:shadow-md">
  <h3>Título</h3>
  <p>Conteúdo</p>
</Card>
```

#### **Input.tsx**

Input com label, error e helper text.

**Props:**

```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "email" | "password";
}
```

#### **Badge.tsx**

Badge com 5 variantes de cor.

**Uso:**

```tsx
<Badge variant="success">Ativo</Badge>
<Badge variant="danger">Erro</Badge>
```

#### **InfoGrid.tsx**

Grid responsivo para exibir informações.

**Props:**

```typescript
interface InfoGridProps {
  items: Array<{
    label: string;
    value: string | number;
    color?: "default" | "success" | "danger" | "warning";
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
}
```

**Uso:**

```tsx
<InfoGrid
  columns={4}
  items={[
    { label: "Total de linhas", value: 150, color: "default" },
    { label: "Duplicatas", value: 3, color: "danger" },
    { label: "Créditos", value: "R$ 5.000", color: "success" },
    { label: "Débitos", value: "R$ 2.000", color: "danger" },
  ]}
/>
```

### Modal Component

#### **Modal.tsx**

Modal base reutilizável.

**Props:**

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}
```

**Uso:**

```tsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Título" size="md">
  <p>Conteúdo do modal</p>
</Modal>
```

### Table Components

#### **DataTable.tsx**

Tabela interativa principal do dashboard.

**Features:**

- Filtro global (busca em todas colunas)
- Ordenação por coluna (clique no header)
- Seleção de linhas (checkbox)
- Mostrar/ocultar colunas
- Detecção de duplicatas
- Formatação customizável (data, valores negativos)
- Export (CSV, clipboard)
- Delete linhas selecionadas

**State:**

- Usa `useDataStore` para tableData, formatSettings
- Estado local para filtros, ordenação, linhas selecionadas

#### **SimpleTable.tsx**

Tabela reutilizável simplificada (usada em comparison).

**Props:**

```typescript
interface SimpleTableProps {
  data: ParsedRow[];
  columns: string[];
  columnSettings: ColumnSettings[];
  formatSettings: FormatSettings;
  selectedRows: Record<string, boolean>;
  onRowSelectionChange: (key: string) => void;
  onColumnVisibilityChange: (col: string, visible: boolean) => void;
  onCopyColumn: (col: string) => void;
  onDeleteSelected: () => void;
  tableId?: string;
  sortColumn?: string;
  sortOrder?: "asc" | "desc";
  onColumnSort?: (col: string) => void;
}
```

### Comparison Components

#### **ComparisonPage.tsx**

Orquestrador da página de comparação.

**Estrutura:**

```tsx
<ComparisonPage>
  {/* Header */}
  <h1>Comparação de Extratos</h1>
  <Button onClick={() => setShowUploadModal(true)}>+ Adicionar Arquivo</Button>

  {/* Files Grid */}
  <div className="grid">
    {comparedFiles.map((file) => (
      <Card key={file.id}>
        {/* Info do arquivo */}
        <Button onClick={() => removeFile(file.id)}>X</Button>
      </Card>
    ))}
  </div>

  {/* Upload Modal */}
  <Modal isOpen={showUploadModal}>
    <ComparisonCSVUploader onClose={() => setShowUploadModal(false)} />
  </Modal>

  {/* Column Mapper */}
  {showColumnMapper && <ColumnMapper />}

  {/* Tabs */}
  {comparedFiles.length > 1 && <TabsComparisonView />}
</ComparisonPage>
```

#### **ComparativeAnalysis.tsx**

Gráficos comparativos (Recharts).

**Gráficos:**

1. **BarChart**: Créditos vs Débitos por banco (lado-a-lado)
2. **PieChart**: Distribuição de créditos por banco
3. **PieChart**: Distribuição de débitos por banco

**Lógica de separação crédito/débito:**

```typescript
// 1. Se existe coluna "Tipo de transação"
if (row["Tipo de transação"] === "Crédito") credits += value;
else debits += value;

// 2. Senão, por sinal do valor
if (value > 0) credits += value;
else debits += value;
```

#### **ExtractTablesView.tsx**

Tabelas detalhadas lado-a-lado.

**Features:**

- Mostra TODAS as colunas do arquivo original
- Cards macro: Créditos, Débitos, Valor Inicial, Valor Final
- Formatação customizável (data, negativo)
- Filtro global
- Mostrar/ocultar colunas
- Tabelas lado-a-lado se 2+ arquivos

#### **CompleteDataView.tsx**

Visualização consolidada de todos os dados.

**Features:**

- Merge de todos os arquivos em uma única tabela
- Filtros avançados por coluna
- Ordenação
- Mostrar/ocultar colunas
- Export CSV e clipboard
- Resumo consolidado (totais por banco)

---

## Hooks Personalizados

### **useCSVOperations.ts**

#### `useParseCSV()`

Hook para parsing de CSV via API.

**Uso:**

```typescript
const { mutate: parseCSV, isPending, isError, error } = useParseCSV();

parseCSV(
  { file, forcedBank: "caixa" },
  {
    onSuccess: (data) => {
      console.log("Parsed:", data);
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  }
);
```

**Request:**

```typescript
POST /api/csv/parse
Content-Type: multipart/form-data

{
  file: File,
  forcedBank: string
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    rows: ParsedRow[],
    columns: string[],
    bank: string,
    month: string
  }
}
```

#### `useCopyToClipboard()`

Hook para copiar dados para clipboard (formato Excel).

**Uso:**

```typescript
const { copyToClipboard } = useCopyToClipboard();

copyToClipboard(data, columns, { success: toast.success, error: toast.error });
```

### **useLastCSVUpload.ts**

Hook para cache do último upload (TanStack Query).

**Uso:**

```typescript
const { data: lastUpload, isLoading } = useLastCSVUpload();
```

**Cache:**

- Query key: `["lastCSVUpload"]`
- TTL: 5 minutos
- Persistência: localStorage

### **useToast.ts**

Hook wrapper para Sonner toasts.

**Uso:**

```typescript
const { success, error, info, warning } = useToast();

success("Dados salvos com sucesso!");
error("Erro ao processar arquivo");
info("Processando...");
warning("Atenção: dados incompletos");
```

---

## Utilitários

### **formatUtils.ts**

Funções de formatação centralizadas.

#### `formatValue()`

Formata valores conforme FormatSettings.

```typescript
formatValue(value: string, formatSettings: FormatSettings): string
```

**Comportamento:**

- Datas: Aplica formatação DD/MM/YYYY, DD/MM/YYYY HH:MM ou DD
- Valores negativos: Remove `-` se `showNegativeAsPositive = true`

#### `formatDate()`

Formata datas.

```typescript
formatDate(dateStr: string, format: "full" | "date-only" | "day-only"): string
```

#### `isNumericValue()`

Verifica se valor é numérico (incluindo formato brasileiro).

```typescript
isNumericValue(value: string): boolean
```

**Regex:**

```typescript
/^-?\d+(\.\d{3})*,\d{2}$/; // -1.250,00 ou 1.250,00
```

#### `extractNumericValue()`

Extrai valor numérico de string.

```typescript
extractNumericValue(value: string): number
```

**Conversão:**

```typescript
"1.250,50" → 1250.50
"-245,00" → -245.00
```

#### `parseValueBR()`

Parse valor brasileiro para float.

```typescript
parseValueBR(value: string): number
```

**Lógica:**

1. Remove "R$", espaços
2. Remove pontos (milhares)
3. Substitui vírgula por ponto
4. `parseFloat()`

### **referenceFormatter.ts**

Formata referência de banco/mês.

#### `formatBankReference()`

```typescript
formatBankReference(bankId: string, month: string): string
```

**Exemplos:**

```typescript
formatBankReference("caixa", "10/2025") → "Caixa - Out/2025"
formatBankReference("itau", "01/2026") → "Itaú - Jan/2026"
```

### **constants.ts**

Constantes centralizadas.

```typescript
export const HEADER_KEYWORDS = [
  "data",
  "descrição",
  "valor",
  "tipo de transação",
  "razão social",
  "cpf/cnpj",
  // ...
];

export const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
```

### **logger.ts**

Logger centralizado.

```typescript
export const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data),
  debug: (message: string, data?: any) => console.debug(`[DEBUG] ${message}`, data),
};
```

---

## Tipos & Interfaces

### **types/index.ts**

Todas as interfaces TypeScript centralizadas.

#### Interfaces Principais

```typescript
export interface ParsedRow {
  [key: string]: string | number;
}

export interface TableData {
  rows: ParsedRow[];
  columns: string[];
  bank: string;
  month: string;
  uploadDate: string;
}

export interface ColumnSettings {
  name: string;
  visible: boolean;
}

export interface FormatSettings {
  dateFormat: "full" | "date-only" | "day-only";
  showNegativeAsPositive: boolean;
  splitByPosNeg: boolean;
}

export interface BankTemplate {
  id: string;
  name: string;
  delimiter: string;
  expectedColumns: string[];
  dateColumn: string;
  descriptionColumn: string;
  valueColumn: string;
  skipHeaderRows?: number;
  typeColumn?: string;
  referenceColumn?: string;
  futureColumn?: string;
}

export interface ComparedFile {
  id: string;
  bankId: string;
  rows: ParsedRow[];
  columns: string[];
  month: string;
  rowCount: number;
  uploadDate: string;
}

export interface ColumnMapping {
  [fileId: string]: {
    [originalColumn: string]: string; // mapped name
  };
}

export interface ColumnFilter {
  column: string;
  operator: "contains" | "equals" | "startsWith" | "endsWith" | "greaterThan" | "lessThan" | "in" | "notIn";
  value: string | string[];
}
```

---

## Performance & Otimizações

### 1. **TanStack Query Cache**

- **TTL**: 5 minutos
- **Deduplicação**: Requests idênticos compartilham cache
- **Stale-while-revalidate**: Mostra dados cached enquanto revalida
- **Refetch on focus**: Atualiza ao focar janela

### 2. **localStorage Persistence**

- `cafe_dashboard_table_data`: Último upload
- `comparison-store`: Arquivos de comparação
- **TTL**: 5 minutos (checado em useEffect)

### 3. **React Memoization**

```typescript
// Cálculos pesados
const filteredData = useMemo(() => {
  return data.filter(row => /* filter logic */);
}, [data, filters]);

// Event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

### 4. **Lazy Loading**

```typescript
// Componentes grandes carregados sob demanda
const ComparisonPage = lazy(() => import("@/components/comparison/ComparisonPage"));
```

### 5. **Barrel Exports**

Reduz número de imports:

```typescript
// ❌ Ruim
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

// ✅ Bom
import { Button, Input, Card } from "@/components/ui";
```

### 6. **Code Splitting**

Next.js 15 automaticamente faz code splitting por rota:

- `/` → page.tsx bundle
- `/comparison` → comparison/page.tsx bundle

### Métricas

| Métrica              | Valor  |
| -------------------- | ------ |
| Cache hit (TanStack) | <50ms  |
| CSV parse (10k rows) | ~200ms |
| Render DataTable     | ~100ms |
| Export CSV           | ~50ms  |
| Copy clipboard       | ~30ms  |

---

## Tratamento de Erros

### 1. **ErrorBoundary**

Captura erros de renderização React.

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

### 2. **API Error Handling**

```typescript
// route.ts
try {
  // parsing logic
} catch (error) {
  logger.error("Parse error:", error);
  return NextResponse.json({ success: false, error: "Erro ao processar CSV" }, { status: 400 });
}
```

### 3. **TanStack Query Error Handling**

```typescript
const { mutate, isError, error } = useParseCSV();

if (isError) {
  toast.error(error.message);
}
```

### 4. **Validation**

#### CSV Validation

```typescript
function validateCSV(rows: ParsedRow[], columns: string[], bank: string): void {
  if (rows.length === 0) {
    throw new Error("CSV vazio");
  }
  if (columns.length === 0) {
    throw new Error("Nenhuma coluna encontrada");
  }

  const template = BANK_TEMPLATES[bank];
  if (!template) {
    throw new Error(`Banco ${bank} não suportado`);
  }
}
```

### 5. **Toast Notifications (Sonner)**

```typescript
// Sucesso
toast.success("Arquivo importado com sucesso!");

// Erro
toast.error("Erro ao processar CSV: formato inválido");

// Warning
toast.warning("Atenção: 3 duplicatas encontradas");

// Info
toast.info("Processando arquivo...");
```

---

## Clean Code & Componentização

### ✅ Boas Práticas Seguidas

1. **DRY (Don't Repeat Yourself)**

   - `formatUtils.ts`: Funções de formatação centralizadas
   - `Card`, `Button`, `Modal`: Componentes reutilizáveis
   - Barrel exports (`index.ts`) para imports limpos

2. **Single Responsibility**

   - Cada componente tem uma responsabilidade clara
   - Hooks personalizados encapsulam lógica reutilizável
   - Separação: components, lib, utils, hooks, store

3. **KISS (Keep It Simple, Stupid)**

   - Evita over-engineering
   - Lógica clara e direta
   - Comentários apenas quando necessário

4. **Naming Conventions**

   - Componentes: PascalCase (`DataTable.tsx`)
   - Funções: camelCase (`formatValue()`)
   - Constantes: UPPER_SNAKE_CASE (`HEADER_KEYWORDS`)
   - Hooks: `use` prefix (`useParseCSV`)

5. **Componentização (Atomic Design)**

   - **Atoms**: Button, Input, Badge, Card
   - **Molecules**: TableRow, SortIndicator, FilterBadge
   - **Organisms**: DataTable, ComparisonPage, Sidebar

6. **TypeScript Strict Mode**
   - Todas as props com interfaces
   - Sem `any` (exceto casos excepcionais)
   - Type inference onde possível

### ⚠️ Áreas de Melhoria Identificadas

1. **Substituir divs repetidas por Card**

   - ❌ 19 ocorrências de `bg-white rounded-lg shadow-sm border border-gray-200`
   - ✅ Devem usar `<Card>` component

2. **Quebrar componentes grandes**

   - `CompleteDataView.tsx`: ~700 linhas → extrair subcomponentes
   - `DataTable.tsx`: ~300 linhas → extrair FilterPanel, ActionBar

3. **Magic Numbers**

   - ❌ `setTimeout(() => {}, 300)`
   - ✅ `const DEBOUNCE_DELAY = 300;`

4. **Funções longas**
   - Algumas funções >20 linhas → extrair sub-funções

### Checklist de Clean Code

- ✅ Funções <= 20 linhas (maioria)
- ✅ Componentes <= 300 linhas (maioria)
- ⚠️ Magic numbers como constantes (parcial)
- ✅ Nomes descritivos
- ✅ Comentários apenas quando necessário
- ✅ TypeScript strict
- ✅ Barrel exports
- ✅ Separation of concerns
- ⚠️ Reutilização de Card component (em progresso)

---

## Guia de Desenvolvimento

### Setup Inicial

```bash
# 1. Clone o repositório
git clone <repo-url>
cd cafe_dashboard

# 2. Instale dependências
npm install

# 3. Execute em desenvolvimento
npm run dev

# 4. Build para produção
npm run build
npm start
```

### Workflow de Desenvolvimento

1. **Criar Branch**

   ```bash
   git checkout -b feature/nome-feature
   ```

2. **Desenvolvimento**

   - Escreva código limpo e componentizado
   - Use TypeScript strict
   - Adicione comentários apenas quando necessário

3. **Testes Manuais**

   - Teste em Chrome, Safari, Firefox
   - Teste responsividade (mobile, tablet, desktop)
   - Teste edge cases (CSV vazio, valores negativos, etc)

4. **Commit**

   ```bash
   git add .
   git commit -m "feat: adiciona suporte banco X"
   ```

5. **Push & Pull Request**
   ```bash
   git push origin feature/nome-feature
   ```

### Convenções de Commit

```
feat: nova funcionalidade
fix: correção de bug
refactor: refatoração sem mudança de comportamento
style: formatação, espaços, etc
docs: atualização de documentação
perf: melhoria de performance
test: adiciona/atualiza testes
chore: tarefas de build, dependências
```

### Adicionar Novo Banco (Passo-a-Passo)

1. **Adicionar template** (`src/lib/bankTemplates.ts`):

   ```typescript
   newbank: {
     id: "newbank",
     name: "Novo Banco",
     delimiter: ";",
     expectedColumns: ["Data", "Descrição", "Valor"],
     dateColumn: "Data",
     descriptionColumn: "Descrição",
     valueColumn: "Valor",
   }
   ```

2. **Adicionar keywords** (se auto-detecção):

   ```typescript
   AUTO_DETECT_KEYWORDS.newbank = ["novo banco", "keyword"];
   ```

3. **Testar com CSV real**:

   - Upload arquivo
   - Verificar parsing
   - Verificar formatação

4. **Atualizar documentação**:

   - README.md: Adicionar linha na tabela de bancos
   - SYSTEM_DOCS.md: Adicionar linha na tabela de bancos

5. **Commit**:
   ```bash
   git commit -m "feat: adiciona suporte banco Novo Banco"
   ```

### Debugging

#### Browser DevTools

```typescript
// Habilite React DevTools
// Inspect components, props, state

// Console logging
import { logger } from "@/utils/logger";
logger.info("Parsed data:", data);
logger.error("Parse error:", error);
```

#### localStorage

```typescript
// Limpar cache manualmente
localStorage.removeItem("cafe_dashboard_table_data");
localStorage.removeItem("comparison-store");
```

#### TanStack Query DevTools

```typescript
// Habilitado automaticamente em dev
// Acesse /api/debug para visualizar cache
```

---

## Manutenção & Deploy

### Build para Produção

```bash
npm run build
```

### Deploy (Vercel)

```bash
vercel --prod
```

### Monitoramento

- **Logs**: Vercel Dashboard
- **Errors**: ErrorBoundary + logger
- **Performance**: Lighthouse CI

### Versionamento

**Semântico:** `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (ex: migração Next.js 14 → 15)
- **MINOR**: Novas funcionalidades (ex: adicionar banco Itaú)
- **PATCH**: Bug fixes (ex: correção filtro duplicatas)

**Atual:** `1.1.0` (adicionado banco Itaú)

---

## Troubleshooting Comum

### Erro: "CSV vazio ou inválido"

**Causa:** Parsing falhou ou formato não reconhecido  
**Solução:**

1. Verificar delimiter (`;` ou `,`)
2. Verificar encoding (UTF-8)
3. Verificar se há metadados antes do header

### Erro: "Nenhuma coluna comum encontrada"

**Causa:** Arquivos com estruturas muito diferentes (comparison)  
**Solução:** Usar ColumnMapper para renomear colunas

### Performance lenta (>1s render)

**Causa:** Muitos dados (>10k linhas)  
**Solução:**

1. Implementar paginação
2. Virtualização com `react-window`
3. Filtrar dados antes de renderizar

### localStorage cheio

**Causa:** Limite de 5-10MB do navegador  
**Solução:**

1. Limpar cache antigo
2. Reduzir TTL
3. Usar IndexedDB para grandes volumes

---

**Fim da Documentação**

Para dúvidas ou contribuições, entre em contato com a equipe de desenvolvimento.

**Desenvolvido com ☕ e ❤️**
