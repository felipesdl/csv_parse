# 📊 Funcionalidade: Dividir Tabela por Positivos e Negativos

## 🎯 Objetivo

Permitir que o usuário divida a tabela em duas visualizações separadas:

- **Tabela de Valores Positivos** (Receitas/Entradas)
- **Tabela de Valores Negativos** (Despesas/Saídas)

Esta funcionalidade mantém a consistência visual e permite uma análise mais clara do fluxo de caixa.

## 🚀 Como Usar

### Ativar a Funcionalidade

1. Faça upload de um arquivo CSV bancário (Ex: Banco Inter)
2. Rol até a seção **"Formatação de Dados"** (aba inferior esquerda)
3. Procure pela opção: **"Dividir tabela em positivos e negativos"**
4. Ative a checkbox

### Resultado

Quando ativado:

- A tabela é dividida em **duas seções**
- Cada seção tem seu próprio **header visual**
- Indicadores de cor (🟢 verde para positivos, 🔴 vermelho para negativos)
- Contagem de linhas em cada seção

### Exemplo

```
═══════════════════════════════════════════════════════════════

🟢 Valores Positivos (15 linhas)

┌─ Tabela com dados positivos
├─ Ordenação: Funciona normalmente
├─ Filtros: Aplicados a ambas as tabelas
└─ Seleção: Independente para cada tabela

═══════════════════════════════════════════════════════════════

🔴 Valores Negativos (23 linhas)

┌─ Tabela com dados negativos
├─ Ordenação: Funciona normalmente
├─ Filtros: Aplicados a ambas as tabelas
└─ Seleção: Independente para cada tabela

═══════════════════════════════════════════════════════════════
```

## 🏗️ Arquitetura Técnica

### Componentes Envolvidos

#### 1. **SplitTableView** (`src/components/table/SplitTableView.tsx`)

- Responsável pela **lógica de separação** de dados
- Detecta automaticamente a coluna de valores
- Classifica linhas em positivas e negativas
- Usa algoritmo de parsing de valores brasileiros (1.000,00 format)

**Props:**

```typescript
interface SplitTableViewProps {
  data: ParsedRow[]; // Todos os dados
  columns: string[]; // Nomes das colunas
  valueColumn?: string; // Coluna de valores (auto-detectado)
  children: (props) => React.ReactNode; // Render function
}
```

#### 2. **DualTableWrapper** (`src/components/layout/DualTableWrapper.tsx`)

- Componente de **layout** para renderizar duas tabelas
- Mostra títulos com indicadores de cor
- Gerencia a disposição visual

**Props:**

```typescript
interface DualTableWrapperProps {
  positiveData: ParsedRow[];
  negativeData: ParsedRow[];
  renderTable: (data, label) => React.ReactNode;
}
```

#### 3. **SimpleTable** (`src/components/layout/SimpleTable.tsx`)

- Componente **reutilizável** para renderizar tabelas
- Suporta modo normal e modo dividido
- Usa `tableId` para evitar conflito de índices em duas tabelas

**Props:**

```typescript
interface SimpleTableProps {
  data: ParsedRow[];
  columns: string[];
  columnSettings: ColumnSettings[];
  formatSettings: FormatSettings; // Inclui splitByPosNeg
  selectedRows: Record<string, boolean>;
  onRowSelectionChange: (selection) => void;
  onColumnVisibilityChange: (column, visible) => void;
  onCopyColumn: (column) => void;
  onDeleteSelected: () => void;
  tableId?: string; // "main", "positive", "negative"
}
```

#### 4. **FormattingPanel** (Atualizado)

- Adicionada checkbox para ativar/desativar divisão
- Persiste a preferência no Zustand store
- Atualiza `formatSettings.splitByPosNeg`

#### 5. **DataTable** (Refatorado)

- Renderiza condicional baseado em `formatSettings.splitByPosNeg`
- Usa `SplitTableView` quando ativado
- Usa `SimpleTable` em ambos os casos

### Estado do Store

No Zustand `dataStore.ts`:

```typescript
interface FormatSettings {
  dateFormat: "full" | "date-only" | "day-only";
  showNegativeAsPositive: boolean;
  splitByPosNeg: boolean; // ✨ Novo campo
}
```

## 🔄 Fluxo de Dados

```
DataTable
    ↓
[Se splitByPosNeg === true]
    ↓
SplitTableView (classifica dados)
    ↓
DualTableWrapper (layout)
    ↓
SimpleTable (positivos) + SimpleTable (negativos)
    ↓
[Se splitByPosNeg === false]
    ↓
SimpleTable (todos os dados)
```

## 📝 Algoritmo de Parsing

O componente usa parsing brasileiro para valores:

```typescript
// "50.000,00" → 50000
// "-2.000,00" → -2000
// "10.201,65" → 10201.65

1. Detectar se valor contém "-" (negativo)
2. Remover símbolos monetários (R$, €, etc)
3. Remover hífens
4. Remover pontos (separadores de milhar)
5. Converter vírgula em ponto (separador decimal)
6. Converter para número
7. Replicar sinal negativo se necessário
```

## ✅ Verificações e Testes

### Detecta Automaticamente a Coluna de Valores

- Procura por coluna "Valor"
- Se não encontrar, procura por padrão numérico
- Suporta múltiplos bancos (Inter, Caixa, Itaú, etc)

### Mantém Filtros Funcionando

- Filtros avançados aplicados a ambas as tabelas
- Busca global funciona em ambas
- Ordenação e visibility independentes

### Seleção Independente

- Cada tabela tem sua própria seleção
- Índices usam prefixo ("positive_0", "negative_0", etc)
- Não há conflito entre seleções

### Exportação

- Exporta dados da tabela ativa (quando dividido)
- Mantém compatibilidade com modo normal
- Suporta ambos os formatos

## 🎨 Estilo Visual

Cada seção tem:

- **Header com indicador de cor**
  - 🟢 Verde para positivos
  - 🔴 Vermelho para negativos
- **Contagem de linhas** por seção
- **Espaçamento** entre as tabelas (6 unidades)
- **Consistência visual** com resto da aplicação

## 🚧 Melhorias Futuras

1. **Opção de modo lado-a-lado**: Renderizar tabelas em colunas
2. **Resumo de totais**: Mostrar soma de positivos/negativos
3. **Filtro automático**: Checkbox "Mostrar apenas positivos/negativos"
4. **Cores customizáveis**: Permitir usuário escolher cores
5. **Gráficos melhorados**: Integrar com gráficos existentes

## 📚 Referências

- [Componentes refatorados](./COMPONENT_REFACTORING_COMPLETE.md)
- [Correção do gráfico para Banco Inter](./CHART_FIX_BANCO_INTER.md)
- [Arquivo de teste](./TEST_SPLIT_TABLE.md)
