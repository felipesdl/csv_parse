# Navegação Lateral e Feature de Comparação - Documentação

## 📋 Visão Geral

Foi implementada uma estrutura completa com navegação lateral (sidebar) que permite ao usuário navegar entre duas seções principais:

1. **Dashboard** - A funcionalidade original de importação e gerenciamento de dados
2. **Comparação** - Nova feature para comparar dados de múltiplos bancos

## ✨ Novas Funcionalidades na Comparação

### 1. Seleção/Confirmação de Banco

- Ao fazer upload de arquivo, o sistema detecta o banco automaticamente
- Se a detecção falhar ou o usuário quiser alterar, um modal permite selecionar entre os bancos conhecidos
- Bancos suportados: Caixa Econômica, Banco Inter, Itaú, Bradesco, Santander

### 2. Cálculo de Colunas Comuns

- Ao adicionar múltiplos arquivos de diferentes bancos, o sistema identifica quais colunas existem em TODOS os arquivos
- Apenas essas colunas são consideradas para comparação
- Exibe alerta se nenhuma coluna comum for encontrada

### 3. Informações Detalhadas por Arquivo

- Nome do banco detectado
- Quantidade de registros
- Quantidade de colunas totais
- Lista de todas as colunas do arquivo
- Data de upload

## 🏗️ Arquitetura de Componentes

### Layout da Aplicação

```
AppLayout
├── Sidebar
│   ├── Logo/Header
│   └── Navigation Items (Dashboard, Comparação)
└── Main Content
    └── Page Content (ImporterDashboard ou ComparisonPage)
```

### Componentes Criados

#### 1. **Sidebar.tsx** (`src/components/layout/`)

- Componente de navegação lateral
- Responsivo com gradiente escuro (slate-900 a slate-800)
- Highlight ativo para página atual usando `usePathname()`
- Itens de navegação com ícones (lucide-react)
- Footer com versão

**Características:**

```tsx
- Logo da aplicação (☕ Café Dashboard)
- Navegação para "/" (Dashboard) e "/comparison" (Comparação)
- Estado ativo com cor azul (bg-blue-600)
- Descrição em subtext para cada item
- Altura total da tela
```

#### 2. **AppLayout.tsx** (`src/components/layout/`)

- Wrapper que combina Sidebar + Main Content
- Layout flexível com `flex h-screen overflow-hidden`
- Estrutura: `<div class="flex"> <Sidebar /> <main class="flex-1"> {children} </main> </div>`

**Recursos:**

```tsx
- Sidebar fixo na esquerda (w-64)
- Main area scrollável (overflow-auto)
- Background gradiente aplicado no main
```

#### 3. **ComparisonPage.tsx** (`src/components/comparison/`)

- Página principal de comparação
- Upload múltiplo de arquivos CSV
- Grid de cards mostrando arquivos importados
- Espaço reservado para gráficos comparativos

**Funcionalidades:**

```tsx
- Header com título e botão "Adicionar Arquivo"
- Grid responsivo (1 col mobile, 2 cols tablet, 3 cols desktop)
- Cards com: nome do banco, data, quantidade de registros
- Botão para remover arquivo
- Seção "Análise Comparativa" (ativa quando 2+ arquivos)
- Modal de upload
```

#### 4. **ComparisonCSVUploader.tsx** (`src/components/upload/`)

- Uploader adaptado para a página de comparação
- Integração com `useComparisonStore`
- Suporta drag-and-drop

**Diferenças vs CSVUploader original:**

```tsx
- Adiciona arquivo ao comparisonStore em vez de tableData
- Gera ID único (crypto.randomUUID())
- Mantém histórico de múltiplos arquivos
- Mesma validação e tratamento de erros
```

### State Management

#### **comparisonStore.ts** (`src/store/`)

Store Zustand com persistência em localStorage

```typescript
interface ComparedFile {
  id: string; // UUID único
  bankName: string; // Nome do banco detectado
  uploadDate: string; // ISO timestamp
  rowCount: number; // Quantidade de registros
  data: any[]; // Dados do CSV
  columns: string[]; // Nomes das colunas
}

interface ComparisonState {
  comparedFiles: ComparedFile[];
  addFile: (file: ComparedFile) => void;
  removeFile: (fileId: string) => void;
  clearAll: () => void;
}
```

**Persistência:**

- Nome: `"comparison-store"`
- Versão: `1`
- Tipo: localStorage

## 🛣️ Estrutura de Rotas

```
src/app/
├── layout.tsx          (Root Layout - QueryProvider)
├── page.tsx            (/) - Dashboard com AppLayout + ImporterDashboard
└── comparison/
    └── page.tsx        (/comparison) - Comparação com AppLayout + ComparisonPage
```

## 🎨 Styling

### Layout Principal

```css
Sidebar:
  - Largura: w-64 (256px)
  - Altura: h-full (100vh)
  - Cor: gradient (slate-900 to slate-800)
  - Border: border-r border-slate-700

Main Area:
  - Flex-1 (expande o espaço disponível)
  - overflow-auto (scroll próprio)
  - Fundo: gradient (gray-50 to gray-100)
  - Padding: py-8 px-4
```

### Sidebar Items (Ativo)

```css
Ativo:
  - bg-blue-600
  - text-white
  - shadow-lg shadow-blue-600/20
  - Icon cor: text-blue-200

Hover (Inativo):
  - hover:bg-slate-700
  - hover:text-white
```

### Cards de Arquivo

```css
Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
Card:
  - bg-white
  - rounded-lg
  - shadow-sm
  - border border-gray-200
  - hover:shadow-md
```

## 📊 Fluxo de Dados - Comparação

```
1. Usuário clica em "Adicionar Arquivo" na página de Comparação
   ↓
2. Modal abre com ComparisonCSVUploader
   ↓
3. Usuário faz upload de CSV
   ↓
4. ComparisonCSVUploader:
   - Parse via useParseCSV hook
   - Valida dados
   - Cria ComparedFile com UUID
   - Chama useComparisonStore.addFile()
   ↓
5. Store atualiza estado (e localStorage)
   ↓
6. ComparisonPage re-renderiza com novo arquivo no grid
   ↓
7. Quando 2+ arquivos presentes, seção "Análise Comparativa" ativa
```

## 🔄 Navegação

### Via Sidebar

- Clique em "Dashboard" → navega para `/` → renderiza ImporterDashboard
- Clique em "Comparação" → navega para `/comparison` → renderiza ComparisonPage

### Detecção de Rota Ativa

```tsx
const pathname = usePathname();
const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
```

## 📁 Arquivos Modificados/Criados

### Criados

```
✅ src/components/layout/Sidebar.tsx
✅ src/components/layout/AppLayout.tsx
✅ src/components/comparison/ComparisonPage.tsx
✅ src/components/comparison/index.ts
✅ src/components/upload/ComparisonCSVUploader.tsx
✅ src/store/comparisonStore.ts
✅ src/app/comparison/page.tsx
```

### Modificados

```
📝 src/components/layout/index.ts          (+ Sidebar, AppLayout exports)
📝 src/components/index.ts                 (+ AppLayout, Sidebar, ComparisonPage)
📝 src/components/upload/index.ts          (+ ComparisonCSVUploader)
📝 src/components/layout/ImporterDashboard.tsx (removido min-h-screen)
📝 src/app/page.tsx                        (+ AppLayout wrapper)
```

## 🚀 Próximos Passos - Feature de Comparação

Que ainda podem ser implementados:

1. **Gráficos Comparativos**

   - Comparação de valores totais por banco
   - Gráficos de distribuição lado-a-lado
   - Filtros aplicados em todos os arquivos simultaneamente

2. **Tabela Comparativa**

   - Linha por linha com valores de cada banco
   - Cálculo de diferenças (%)
   - Highlight de variações

3. **Relatórios de Comparação**

   - Summary statistics por banco
   - Export de análise comparativa
   - Correlação entre dados

4. **Melhorias de UX**

   - Nomes customizáveis para cada arquivo
   - Seleção de cores por banco nos gráficos
   - Ordenação de arquivos
   - Dupla seleção de arquivos para comparação direta

5. **Performance**
   - Memoização de cálculos de comparação
   - Lazy loading de grandes datasets
   - WebWorker para processamento pesado

## ✅ Verificação

- ✅ Build: `npm run build` - 100% sucesso
- ✅ Rotas: "/" e "/comparison" acessíveis
- ✅ Sidebar: Navegação funcionando
- ✅ State: Zustand + localStorage funcionando
- ✅ Upload: ComparisonCSVUploader integrando corretamente
- ✅ Tipos: TypeScript compilando sem erros

## 📝 Notas

- O arquivo `comparisonStore.ts` possui persistência automática via localStorage
- Cada arquivo recebe um UUID único para identificação
- A página de comparação é totalmente independente do estado principal (dataStore)
- CSVUploader original não foi modificado (backward compatible)
- Layout adapta automaticamente (responsive design)
