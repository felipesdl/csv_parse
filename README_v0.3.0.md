# 🏗️ Café Dashboard - Importador de CSV Bancário

Um dashboard moderno e intuitivo para importação, manipulação e exportação de dados bancários em formato CSV com **filtros avançados por coluna** e **interface baseada em modais** (v0.3.0).

## 🌟 Características Principais

### ✨ Upload Inteligente

- 🎯 Detecção automática de banco (Caixa, Itaú, Bradesco, Santander)
- 📤 Suporte a drag & drop e clique para selecionar arquivo
- 🏦 Seleção manual de banco com fallback para detectar corretamente
- 📅 Detecção automática de mês/ano do arquivo
- 🪟 **Upload em Modal (NOVO!)** - Mantém apenas botão Upload na página

### 📊 Tabela Interativa Poderosa

- ⬆️⬇️ Ordenação por qualquer coluna (click no header)
- 🔍 Filtro global em tempo real (busca rápida)
- 🎯 **Filtros avançados por coluna (Modal com Multi-select)**
  - 📝 Filtro de texto (busca por substring)
  - 🔢 Filtro numérico (valor exato)
  - ✓ Filtro seleção (múltiplos valores via Ctrl+Click)
  - 🚀 Detecção automática de tipo de coluna
- ✅ Seleção múltipla de linhas com bulk delete
- 👁️ Mostrar/ocultar colunas (toggle buttons)
- 🚨 **Detecção automática de duplicatas com destaque visual**
- 🗑️ **Deletar linhas com correção de índices quando filtros aplicados** ✅ BUG FIX

### 💾 Persistência

- 💿 Salvamento em localStorage para recuperar dados
- 🔄 Carregamento automático ao recarregar página
- 🧹 Limpeza fácil de dados com botão "Limpar Dados"

### 📤 Export/Cópia

- 📋 Copiar para clipboard (formato tabular com Tab separador)
- 📥 Exportar como CSV com delimitador correto (;)
- 🎯 Suporta seleção parcial (apenas linhas selecionadas) ou todas
- ✨ **Respeita filtros e visibilidade de colunas**

## 🆕 Mudanças na v0.3.0

### Layout Redesenhado

- **Modal para Upload**: Apenas botão "Upload" na página principal
- **Tabela Full-Width**: Quando dados carregados, tabela ocupa 100% da largura
- **Melhor aproveitamento de espaço**: Sem sidebar de upload
- **UX Melhorada**: Interface limpa e focada

### Modal para Filtros Avançados

- **Filtros em Modal**: Ao invés de painel inline com muita altura
- **Multi-select com Dropdowns**: Mais compacto que botões de filtro
- **Dica de Ctrl+Click**: Instrução para multi-seleção
- **Badges de Filtros Ativos**: Mostram filtros aplicados abaixo da tabela

### 🔧 Bug Fix Crítico: Delete com Filtros

**Problema**: Quando filtros avançados eram aplicados, o delete removia linhas ERRADAS

- Causa: Índices da tabela filtrada não mapeavam para índices originais
- Exemplo: Filtro mostra 5 linhas → posições [0,1,2,3,4] → delete removia posições erradas do dataset completo

**Solução Implementada**:

- `filteredDataWithMap`: Rastreia `originalIndex` para cada linha filtrada
- `handleDeleteSelected`: Mapeia índices selecionados (filtrados) → índices originais antes de deletar
- Resultado: Delete agora funciona corretamente independente de filtros aplicados ✅

**Teste**: Veja `GUIA_TESTE_DELETE_BUG.md` para passos detalhados de verificação

## 🚀 Quick Start

### 1. Instalação

```bash
# Navegar até o projeto
cd cafe_dashboard

# Instalar dependências
npm install
# ou
yarn install
```

### 2. Executar

```bash
npm run dev
# ou
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### 3. Usar

1. **Upload**: Clique em "Upload" → arraste arquivo CSV ou selecione
2. **Filtros**: Clique em "Filtros" para aplicar filtros avançados por coluna
3. **Manipular**: Ordene colunas, selecione dados, mostre/oculte colunas
4. **Deletar**: Selecione linhas e delete (funciona corretamente com filtros!)
5. **Exportar**: Copie para clipboard ou exporte como CSV
6. **Salvar**: Clique em "Salvar Localmente" para persistir em localStorage

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx           # Layout raiz
│   ├── page.tsx             # Página principal
│   └── globals.css          # Estilos globais
├── components/
│   ├── CSVUploader.tsx        # Upload com drag & drop
│   ├── DataTable.tsx          # Tabela com filtros e delete correto
│   ├── ErrorAlert.tsx         # Alertas de erro
│   ├── ImporterDashboard.tsx  # Componente raiz com modais
│   ├── Modal.tsx              # Modal reutilizável
│   ├── AdvancedFiltersModal.tsx # Modal de filtros avançados
│   └── index.ts               # Exportações
├── lib/
│   ├── csvParser.ts           # Parser de CSV e validação
│   ├── bankTemplates.ts       # Configuração de bancos
│   ├── exportUtils.ts         # Funções de export/copy
│   └── utils.ts               # Utilitários
├── store/
│   └── dataStore.ts           # Zustand store (estado global)
├── types/
│   └── index.ts               # TypeScript types
└── public/
    └── [arquivos estáticos]
```

## 🛠️ Tecnologias

- **Framework**: Next.js 16.0.0 com TypeScript 5
- **UI**: React 19.2.0 com Client Components
- **Estilos**: Tailwind CSS 4 (utility-first)
- **Tabela**: TanStack React-Table 8.21.3 (sorting, filtering, selection)
- **Estado**: Zustand 5.0.8 (global state management)
- **Ícones**: Lucide-React 0.548.0
- **CSV**: PapaParse 5.5.3 (parser robusto)

## 📊 Arquivos de Teste

Para testar a aplicação:

- `teste_caixa.csv` - Arquivo simples sem duplicatas
- `teste_caixa_com_duplicatas.csv` - Arquivo com múltiplas linhas "Saldo do dia" (para testar delete com filtros)

## 📖 Documentação Completa

- **README.md** - Este arquivo (overview e quick start)
- **FUNCIONALIDADES.md** - Descrição detalhada de cada funcionalidade
- **GUIA_TESTE.md** - Guia de testes gerais
- **GUIA_TESTE_DELETE_BUG.md** - Guia específico para testar delete com filtros
- **ESTRUTURA_PROJETO.md** - Arquitetura técnica e explicação de código
- **DESENVOLVIMENTO_FUTURO.md** - Features planejadas
- **TROUBLESHOOTING.md** - Solução de problemas comuns

## 🐛 Troubleshooting

### Arquivo CSV não é detectado

- Confirme que o arquivo segue o padrão do banco selecionado
- Use o seletor manual de banco para forçar interpretação

### Dados não persistem

- Verifique se localStorage está habilitado
- Use "Salvar Localmente" para persistir manualmente

### Delete remove linhas erradas (com filtros)

- Este era um bug conhecido, **CORRIGIDO na v0.3.0**
- Veja `GUIA_TESTE_DELETE_BUG.md` para validar fix

### Modal não abre/fecha

- Limpe cache do navegador (Ctrl+Shift+R)
- Verifique console (F12) para erros JavaScript

## 📝 Notas de Desenvolvimento

### Index Mapping para Delete com Filtros

O sistema agora usa mapeamento de índices para garantir delete correto:

```typescript
// filteredDataWithMap rastreia índices originais
const filteredDataWithMap = useMemo(() => {
  if (advancedFilters.length === 0) {
    return tableData.rows.map((row, idx) => ({ row, originalIndex: idx }));
  }

  return tableData.rows.map((row, originalIndex) => ({ row, originalIndex })).filter(/* aplicar filtros */);
}, [advancedFilters, tableData.rows]);

// handleDeleteSelected mapeia de volta
const originalIndices = selectedRowIndices
  .map((filteredIdx) => filteredDataWithMap[filteredIdx]?.originalIndex)
  .filter((idx) => idx !== undefined)
  .sort((a, b) => b - a); // Delete de trás pra frente

deleteRows(originalIndices as number[]);
```

## 📄 License

MIT

## 👤 Autor

Felipe S. D. L. - Desenvolvimento e manutenção do Café Dashboard

---

**Última atualização**: v0.3.0 - Modal-based layout + Delete bug fix
