# 🔍 SYSTEM AUDIT - Café Dashboard

**Data**: 2025-01-14  
**Status**: ⚠️ DUPLICAÇÕES ENCONTRADAS - Refatoração Necessária  
**Versão do Projeto**: 1.0 (TanStack Query)

---

## 📋 Executive Summary

**Encontrado**: 5 duplicações críticas de código e padrões inconsistentes  
**Impacto**: Dificulta manutenção, cria riscos de bugs, viola DRY principle  
**Ação**: Centralizar funções, remover código duplicado, padronizar padrões

---

## 🚨 DUPLICAÇÕES CRÍTICAS

### 1. **`parseValueBR()` - FUNÇÃO TRIPLICADA**

| Local                                             | Linhas | Status                 |
| ------------------------------------------------- | ------ | ---------------------- |
| `src/utils/formatUtils.ts`                        | 39-52  | ✅ **SOURCE OF TRUTH** |
| `src/components/comparison/ExtractTablesView.tsx` | 12-17  | ❌ DUPLICADA           |
| `src/components/comparison/ConsolidationView.tsx` | 9-15   | ❌ DUPLICADA           |

**Problema**: Mesma lógica em 3 arquivos. Se houver bug/alteração, precisa ficar em 3 lugares.

**Solução**: Importar de `formatUtils.ts` em todos os locais.

```typescript
// ❌ ERRADO (em ExtractTablesView.tsx e ConsolidationView.tsx)
function parseValueBR(valor: string | number): number {
  if (valor === null || valor === undefined || valor === "") return 0;
  let cleaned = String(valor).replace(/R\$/g, "").trim()...
  return isNaN(num) ? 0 : num;
}

// ✅ CERTO
import { parseValueBR } from "@/utils/formatUtils";
```

---

### 2. **`FormatSettings` Interface - DUPLICADA**

| Local                                                   | Status                    |
| ------------------------------------------------------- | ------------------------- |
| `src/utils/formatUtils.ts:6-10`                         | ✅ **Exported (correct)** |
| `src/components/comparison/ExtractTablesView.tsx:19-22` | ❌ **Redefined locally**  |

**Problema**: Tipo definido em 2 locais. Pode ficar out-of-sync se mudar.

**Solução**: Remover definição local, importar:

```typescript
// ❌ ERRADO (em ExtractTablesView.tsx)
interface FormatSettings {
  dateFormat: "full" | "date-only" | "day-only";
  showNegativeAsPositive: boolean;
}

// ✅ CERTO
import { FormatSettings } from "@/utils/formatUtils";
```

---

### 3. **FormattingPanel Component - DUAS IMPLEMENTAÇÕES**

| Localização                                               | Tipo                 | Status                  |
| --------------------------------------------------------- | -------------------- | ----------------------- |
| `src/components/formatting/FormattingPanel.tsx`           | Usa `useDataStore()` | ❌ **Não reutilizável** |
| `src/components/comparison/ExtractTablesView.tsx:103-159` | Usa estado local     | ❌ **Duplicada**        |

**Problema**:

- 2 implementações da mesma UI
- Primeira usa store (dashboard)
- Segunda usa state local (comparison)
- Inconsistente e difícil de manter

**Solução**: Criar `FormattingPanel` reutilizável que aceita props:

```typescript
// ✅ NOVO PADRÃO (reutilizável)
interface FormattingPanelProps {
  formatSettings: FormatSettings;
  setFormatSettings: (settings: FormatSettings) => void;
  showSplitOption?: boolean; // Optional: apenas dashboard usa
}

export function FormattingPanel({ formatSettings, setFormatSettings, showSplitOption = true }: FormattingPanelProps) {
  // UI aqui, sem dependência de store
}
```

---

### 4. **Numeric Parsing - LÓGICA DISTRIBUÍDA**

| Função                  | Local                                                   | Propósito       |
| ----------------------- | ------------------------------------------------------- | --------------- |
| `extractNumericValue()` | `src/utils/formatUtils.ts`                              | ✅ Centralizado |
| Regex inline            | `src/components/chart/ValueDistributionChart.tsx:40-50` | ❌ Duplicado    |

**Problema**: Chart reimplementa regex de parse que já existe em utils.

**Solução**: Usar `extractNumericValue()` do utils.

---

### 5. **Unused Functions - CÓDIGO MORTO**

| Função         | Local                          | Status        | Referências                |
| -------------- | ------------------------------ | ------------- | -------------------------- |
| `cleanRows()`  | `src/lib/csvParser.ts:359-367` | ❌ **UNUSED** | 0 referências              |
| `cleanValue()` | `src/lib/csvParser.ts:342-356` | ❌ **UNUSED** | Usado apenas por cleanRows |

**Problema**: Código exportado mas nunca chamado.

**Solução**: Remover ou documentar se é para uso futuro.

---

## 📊 CODE ORGANIZATION

### Current State (Inconsistente)

```
src/
├── utils/
│   └── formatUtils.ts          ✅ Source of truth (mas ignorada em alguns places)
│
├── components/
│   ├── formatting/
│   │   └── FormattingPanel.tsx      ❌ Uses dataStore (não reutilizável)
│   │
│   └── comparison/
│       ├── ExtractTablesView.tsx    ❌ LocalizaParseBR + FormattingPanel inline
│       ├── ConsolidationView.tsx    ❌ Duplica parseValueBR
│       └── CompleteDataView.tsx     ✅ Usa formatUtils corretamente
│
└── lib/
    └── csvParser.ts                 ❌ Tem parseValue inline + cleanValue/cleanRows unused
```

### Target State (Centralizado)

```
src/
├── utils/
│   └── formatUtils.ts              ✅ Single source: parseValueBR, FormatSettings, formatValue
│
├── components/
│   ├── formatting/
│   │   └── FormattingPanel.tsx      ✅ Props-based (reutilizável)
│   │
│   └── comparison/
│       ├── ExtractTablesView.tsx    ✅ Importa tudo de formatUtils
│       ├── ConsolidationView.tsx    ✅ Importa tudo de formatUtils
│       └── CompleteDataView.tsx     ✅ Importa tudo de formatUtils
│
└── lib/
    └── csvParser.ts                 ✅ Remove unused, usa formatUtils
```

---

## ✅ CHECKLIST PRÉ-MODIFICAÇÃO

**SEMPRE verificar ANTES de fazer mudança no código:**

### 1. Funções & Utilities

- [ ] Função já existe em `src/utils/`?
  - Sim → Importar, não redefinir
  - Não → Criar lá, nunca em componentes
- [ ] Função é usada em múltiplos arquivos?
  - Sim → Centralizar em utils
  - Não → Pode ficar no componente (mas considerar utils)
- [ ] Interface/Type é reutilizável?
  - Sim → Colocar em `src/types/` ou `src/utils/`
  - Não → Pode ficar local

### 2. Componentes

- [ ] Este componente é usado em 2+ locais?
  - Sim → Colocar em `src/components/` com export em index.ts
  - Não → Pode ser local/aninhado
- [ ] Depende de um store específico (dataStore/comparisonStore)?
  - Sim → Criar versão Props-based para reutilização
  - Não → Pronto para reutilizar
- [ ] Props são claros & documentados?
  - Não → Adicionar JSDoc comments

### 3. Importações

- [ ] Está fazendo `import X from "@/utils"`?
  - Sim → Correto ✅
  - Não → Verificar se vem de componente duplicate
- [ ] Múltiplas importações do mesmo arquivo?
  - Sim → Considerar barrel import: `import { X, Y, Z } from "@/utils"`

### 4. Tipos & Interfaces

- [ ] Interface existe em `src/types/index.ts`?
  - Não existe? → Criar lá
  - Existe? → Importar, não redefinir
- [ ] Está redefinindo um type que já existe?
  - Sim → PARAR! Importar do lugar correto.

---

## 🔧 MAPA DE DEPENDÊNCIAS

### formatUtils.ts (Core)

```
EXPORTA:
├── parseValueBR() → Usado em: csvParser, (ExtractTablesView ❌), (ConsolidationView ❌)
├── FormatSettings → Usado em: dataStore, (ExtractTablesView ❌)
├── formatValue()  → Usado em: DataTable, TableRow, CompleteDataView, ExtractTablesView
├── formatDate()   → Usado por formatValue()
├── formatNumeric() → Usado por formatValue()
├── isDateValue()  → Usado por formatValue()
├── isNumericValue() → Usado por: FormattingPanel, ValueDistributionChart
└── extractNumericValue() → Usado por: ValueDistributionChart
```

### csvParser.ts

```
IMPORTA:
├── formatUtils → parseValueBR(), formatValue()
├── bankTemplates

EXPORTA (usados):
├── detectAndParseCSV() → Usado em: CSVUploader
├── cleanMetadataLines() → Usado em: detectAndParseCSV()
├── validateCSV() → Usado em: detectAndParseCSV()

EXPORTA (UNUSED ❌):
├── cleanValue()
└── cleanRows()
```

### DataTable.tsx

```
IMPORTA:
├── formatValue → from formatUtils ✅
├── FormattingPanel → from components/formatting ✅
├── useDataStore ✅

USADO POR:
└── ImporterDashboard
```

### ExtractTablesView.tsx

```
IMPORTA:
├── formatValue as formatUtilValue → from formatUtils ✅
├── parseValueBR ❌ DUPLICADA (deveria importar)
├── FormatSettings ❌ REDEFINIDA (deveria importar)

TINHA INLINE:
├── FormattingPanel UI ❌ (deveria importar componente)
├── parseValueBR() ❌ (deveria importar)

USADO POR:
└── ComparisonPage
```

---

## 🎯 PADRÕES E CONVENÇÕES

### ✅ Correto

**Utilities Compartilhadas:**

```typescript
// src/utils/formatUtils.ts
export function parseValueBR(valor: string | number): number { ... }
export interface FormatSettings { ... }

// Em qualquer componente
import { parseValueBR, FormatSettings } from "@/utils/formatUtils";
```

**Componentes Reutilizáveis:**

```typescript
// src/components/formatting/FormattingPanel.tsx
interface FormattingPanelProps {
  formatSettings: FormatSettings;
  setFormatSettings: (s: FormatSettings) => void;
  showSplitOption?: boolean;
}

export function FormattingPanel({ formatSettings, setFormatSettings }: FormattingPanelProps) {
  // Sem dependência de stores - totalmente reutilizável
}

// Em DataTable.tsx
<FormattingPanel
  formatSettings={formatSettings}
  setFormatSettings={setFormatSettings}
  showSplitOption={true}
/>

// Em ExtractTablesView.tsx
<FormattingPanel
  formatSettings={formatSettings}
  setFormatSettings={setFormatSettings}
  showSplitOption={false}
/>
```

### ❌ Incorreto

```typescript
// ❌ ERRADO: Redefining function that exists in utils
function parseValueBR(valor: string | number): number { ... }

// ❌ ERRADO: Component tied to specific store
export function FormattingPanel() {
  const { formatSettings, setFormatSettings } = useDataStore();
  // Não pode ser reutilizado em comparison
}

// ❌ ERRADO: Redefining interface
interface FormatSettings {
  dateFormat: "full" | "date-only" | "day-only";
  showNegativeAsPositive: boolean;
}
```

---

## 📝 ROADMAP REFATORAÇÃO

### Phase 1: Centralizar & Importar (PRÓXIMO)

- [ ] Remove `parseValueBR()` de ExtractTablesView.tsx, import de formatUtils
- [ ] Remove `FormatSettings` local de ExtractTablesView.tsx, import de formatUtils
- [ ] Remove `parseValueBR()` de ConsolidationView.tsx, import de formatUtils
- [ ] Verify ConsolidationView uses correct imports

### Phase 2: Refatorar FormattingPanel

- [ ] Criar version props-based de FormattingPanel
- [ ] Remover use de `useDataStore()` do componente
- [ ] Atualizar DataTable para passar props
- [ ] Remover FormattingPanel inline de ExtractTablesView.tsx, usar componente

### Phase 3: Cleanup

- [ ] Remover `cleanValue()` e `cleanRows()` de csvParser.ts
- [ ] Centralizar numeric parsing em utils
- [ ] Garantir ValueDistributionChart usa `extractNumericValue()`

### Phase 4: Validation

- [ ] Build sem erros
- [ ] Teste upload 6 bancos
- [ ] Teste formatting em dashboard e comparison
- [ ] Teste Santander com metadata skip

---

## 🧪 TESTING CHECKLIST

### Unit Tests

- [ ] `parseValueBR()` com diferentes formats
- [ ] `formatDate()` com todos os 3 formatos + Portuguese
- [ ] `formatValue()` com tipos mistos
- [ ] `isDateValue()`, `isNumericValue()` edge cases

### Integration Tests

- [ ] Upload CSV Caixa → Parse corretamente
- [ ] Upload CSV Inter → Parse corretamente
- [ ] Upload CSV Itaú → Parse corretamente
- [ ] Upload CSV Bradesco → Parse corretamente
- [ ] Upload CSV OnilX → Parse corretamente
- [ ] Upload CSV Santander → Skip 5 metadata lines + consolidate Crédito/Débito
- [ ] Dashboard: FormatSettings aplicam corretamente
- [ ] Comparison: FormatSettings aplicam corretamente
- [ ] Export: Data exportada com formatting correto

### Edge Cases

- [ ] Empty file
- [ ] Wrong delimiter
- [ ] Missing required columns
- [ ] Special characters in values
- [ ] Portuguese localized dates
- [ ] Negative values
- [ ] Very large numbers
- [ ] Mixed date formats

---

## 📚 REFERÊNCIAS RÁPIDAS

**Format Settings Opciones:**

```typescript
interface FormatSettings {
  dateFormat: "full" | "date-only" | "day-only";
  // "15/09/2025 23:59" | "15/09/2025" | "15"

  showNegativeAsPositive: boolean;
  // -1000 → 1000 se true

  splitByPosNeg?: boolean;
  // Dashboard only: split table em 2 seções
}
```

**Bancos Suportados:**

```typescript
| Nome | ID | Delimiter | Status |
|------|----|-----------| -------|
| Caixa Econômica | caixa | , | ✅ |
| Inter | inter | , | ✅ |
| Itaú | itau | , | ✅ |
| Bradesco | bradesco | , | ✅ |
| OnilX | onilx | ; | ✅ |
| Santander | santander | ; | ✅ (Crédito/Débito) |
```

---

## 🔗 Arquivos Relevantes

```
src/
├── utils/formatUtils.ts         ← CORE (parseValueBR, FormatSettings, formatValue)
├── types/index.ts               ← Onde tipos reutilizáveis vivem
├── lib/csvParser.ts             ← Parsing logic
├── components/formatting/FormattingPanel.tsx  ← Será refatorado
├── components/comparison/
│   ├── ExtractTablesView.tsx    ← Remover duplicações
│   ├── ConsolidationView.tsx    ← Remover duplicações
│   └── CompleteDataView.tsx     ✅ Está correto
├── components/layout/
│   └── DataTable.tsx            ← Usa FormatSettings corretamente
└── components/chart/
    └── ValueDistributionChart.tsx ← Usar extractNumericValue()
```

---

**PRÓXIMAS AÇÕES:**

1. Ler este documento ANTES de fazer qualquer mudança
2. Seguir checklist de pre-modificação
3. Após refatoração, executar test checklist
4. Atualizar este documento com final status
