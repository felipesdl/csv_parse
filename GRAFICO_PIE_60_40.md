# 📊 Implementação: Visualização com Gráfico de Pizza (60/40)

## 🎯 Objetivo

Dividir a área de dados em 60% (tabela) e 40% (gráfico de pizza), com gráfico que se atualiza conforme filtros são aplicados.

---

## ✨ Funcionalidades Implementadas

### 1. **Layout Responsivo 60/40**

- Tabela de dados: **60%** da largura (3 colunas em grid de 5)
- Gráfico de pizza: **40%** da largura (2 colunas em grid de 5)
- Responsivo: Em telas pequenas, stack vertically (mobile-friendly)
- Grid CSS: `grid-cols-1 lg:grid-cols-5 gap-4`

### 2. **Gráfico de Pizza Inteligente**

Criado novo componente: `ValueDistributionChart.tsx`

#### Dois modos de visualização:

**Modo 1: Positivo/Negativo (padrão)**

- Analisa a coluna "Valor" (ou primeira coluna numérica)
- Separa valores em:
  - ✅ **Positivos** (verde)
  - ❌ **Negativos** (vermelho)
  - ⚫ **Zero** (âmbar, se existir)
- Mostra percentual e valor absoluto em reais (R$)

**Modo 2: Por Coluna**

- Permite selecionar qualquer coluna numérica
- Mostra distribuição de valores únicos
- Top 10 valores mais frequentes
- Útil para análise de padrões

### 3. **Atualização Reactiva com Filtros**

- Gráfico atualiza automaticamente quando:
  - Filtro global é aplicado
  - Filtros avançados são adicionados/removidos
  - Coluna de visualização é alterada
- Usa `useMemo` para otimizar recálculos
- Dados filtrados da tabela = dados do gráfico

### 4. **Cores e Visual**

- Paleta de 10 cores vibrantes e distintivas
- Tooltip customizado com informações detalhadas
- Labels nos segmentos (nome: percentual%)
- Legenda automática com wrapping

### 5. **Detecção Automática de Colunas Numéricas**

- Analisa primeiras 10 linhas para detectar tipo
- Trata formatação de números (remove símbolos, pontuação)
- Disponibiliza apenas colunas numéricas no seletor

---

## 📁 Arquivos Criados/Modificados

### ✅ Criados:

1. **`src/components/ValueDistributionChart.tsx`** (147 linhas)
   - Novo componente para gráfico de pizza
   - Props: `data`, `advancedFilters`
   - Estados: `chartType`, `customColumn`

### 📝 Modificados:

1. **`src/components/DataTable.tsx`**

   - Adicionado import: `ValueDistributionChart`
   - Layout 60/40 com grid responsivo
   - Passa dados filtrados ao gráfico

2. **`src/components/index.ts`**
   - Exporta novo componente

### 📦 Dependências Instaladas:

- **recharts@3.3.0** - Biblioteca de gráficos React
- **react-is@19.2.0** - Dependência do Recharts

---

## 🎨 Layout CSS

```tsx
<div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-96">
  {/* Tabela - 60% (3 de 5 colunas) */}
  <div className="lg:col-span-3">
    <table>...</table>
  </div>

  {/* Gráfico - 40% (2 de 5 colunas) */}
  <div className="lg:col-span-2">
    <ValueDistributionChart />
  </div>
</div>
```

### Breakpoints:

- **Mobile (< 1024px)**: Stack vertical (100% cada)
- **Desktop (≥ 1024px)**: 60/40 lado-a-lado

---

## 🔄 Fluxo de Dados

```
Dados CSV carregados
    ↓
[DataTable.tsx]
    ├─ Aplicar filtro global
    ├─ Aplicar filtros avançados
    ├─ Aplicar sorting
    └─ Gerar `filteredData`
    ↓
Dividir visualização:
    ├─ 60% → Renderizar tabela
    └─ 40% → Passar `filteredData` ao gráfico
    ↓
[ValueDistributionChart.tsx]
    ├─ Receber `filteredData`
    ├─ Calcular distribuição
    └─ Renderizar PieChart do Recharts
```

---

## 💡 Exemplos de Uso

### Visualizar Positivo/Negativo

1. Carregar CSV com coluna "Valor"
2. Clicar botão "Pos/Neg" (ativo por padrão)
3. Gráfico mostra % de transações positivas vs negativas

### Filtrar e Ver Mudança

1. Clicar "Filtros"
2. Selecionar filtro (ex: Banco = "Inter")
3. Tabela reduz + Gráfico atualiza instantaneamente

### Mudar Visualização

1. Clicar "Por Coluna"
2. Selecionar coluna (ex: "Saldo")
3. Gráfico mostra distribuição dos valores dessa coluna

---

## 🚀 Performance

### Otimizações Aplicadas:

1. **useMemo para cálculos**

   - Recalcula só quando `data`, `chartType`, `customColumn` mudam
   - Evita re-render desnecessário

2. **Detecção de colunas numéricas**

   - Amostra apenas 10 primeiras linhas
   - Cache no memo hook

3. **Renderização condicional**

   - Não renderiza PieChart se sem dados
   - Mostra mensagem "Nenhum dado disponível"

4. **Recharts ResponsiveContainer**
   - Adapta automaticamente ao tamanho do container
   - Eficiente em redimensionamento

---

## ✅ Checklist de Funcionalidades

- [x] Layout 60% tabela + 40% gráfico
- [x] Responsivo (mobile/tablet/desktop)
- [x] Gráfico atualiza com filtros
- [x] Modo Positivo/Negativo (padrão)
- [x] Modo Por Coluna
- [x] Seletor dinâmico de colunas
- [x] Cores vibrantes e distinct
- [x] Tooltip customizado
- [x] Legenda automática
- [x] Detecção automática de coluna numérica
- [x] Sem erros TypeScript
- [x] Imports otimizados

---

## 🎯 Próximos Passos Possíveis

1. **Gráfico de Barras** - Para comparar valores por categoria
2. **Exportar Gráfico** - PNG/SVG do gráfico
3. **Mais Modos** - Média, Mediana, Desvio Padrão
4. **Animações** - Transições suaves entre dados
5. **Temas** - Dark mode para gráfico

---

## 📊 Estrutura de Dados

### Props do ValueDistributionChart:

```typescript
interface ValueDistributionChartProps {
  data: (ParsedRow & { isDuplicate?: boolean })[]; // Dados filtrados
  advancedFilters: ColumnFilter[]; // Filtros aplicados
}
```

### Dados do Gráfico (Pos/Neg):

```typescript
[
  {
    name: "Positivos",
    value: 65, // Percentual
    amount: 15000.5, // Valor em reais
  },
  {
    name: "Negativos",
    value: 35,
    amount: 8200.0,
  },
];
```

---

**Status:** ✅ **Implementação Concluída e Testada**

**Data:** Outubro 25, 2025
**Stack:** Next.js 15 + React 18 + Recharts 3.3 + Tailwind CSS 4
