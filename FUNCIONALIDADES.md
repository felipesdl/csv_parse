# Café Dashboard - Importador de CSV

## 🎯 Funcionalidades

### Upload de Arquivos

- ✅ Suporte a upload de arquivos CSV
- ✅ Drag & drop para upload
- ✅ Detecção automática de banco (Caixa, Itaú, Bradesco, Santander)
- ✅ Seleção manual de banco se não detectar automaticamente
- ✅ Detecção automática de mês/ano

### Manipulação de Dados

- ✅ Tabela interativa com TanStack Table
- ✅ **Ordenação**: Clique nas colunas para ordenar
- ✅ **Filtro global**: Busque em todos os dados
- ✅ **Filtros avançados por coluna**: Filtre dinamicamente por qualquer coluna (novo!)
  - 📝 Filtro de texto (contém)
  - 🔢 Filtro numérico (exato)
  - ✓ Filtro seleção (múltiplos valores)
- ✅ **Seleção de linhas**: Selecione uma ou todas as linhas
- ✅ **Reordenação de colunas**: Mostrar/ocultar colunas
- ✅ **Detecção de duplicatas**: Identifica linhas duplicadas automaticamente
- ✅ **Deletar linhas**: Remove linhas individuais ou em lote

### Export/Cópia

- ✅ **Copiar para clipboard**: Copia dados em formato de tabela (tab-delimited)
- ✅ **Exportar como CSV**: Download do arquivo em formato CSV
- ✅ Export com colunas selecionadas apenas
- ✅ Export e cópia respeitam filtros avançados aplicados

### Filtros Avançados (Novo!)

Os filtros avançados permitem separar e filtrar dados por qualquer coluna, baseado nas headers específicas de cada arquivo:

#### Tipos de Filtro

**1. Filtro de Texto**

- Aplica-se a colunas de texto (ex: Descrição)
- Busca por substring (contém)
- Exemplo: Filtrar descrição que contém "DÉBITO"

**2. Filtro Seleção (Multi-valor)**

- Aplica-se a colunas com valores discretos
- Mostra todos os valores únicos encontrados
- Permite seleção múltipla de valores
- Exemplo: Selecionar apenas "DÉBITO" ou "CRÉDITO" da coluna "Tipo"

**3. Filtro Numérico**

- Aplica-se a colunas numéricas
- Filtra por valor exato
- Exemplo: Filtrar apenas valores de 1000.50

#### Exemplos de Uso

```
Arquivo Caixa com colunas: Data | Descrição | Valor | Tipo de transação

Caso 1: Apenas débitos
- Botão "Filtros Avançados" → Tipo de transação → Selecione "DÉBITO"
- Resultado: Apenas linhas com "DÉBITO"

Caso 2: Apenas valores positivos
- Botão "Filtros Avançados" → Valor → Digite "1000" ou selecione valores
- Resultado: Apenas linhas com esse valor

Caso 3: Combinação
- Ativar filtro em "Tipo de transação" + "Valor"
- Resultado: Débitos com valor específico
```

#### Características

- ✅ Detecta automaticamente o tipo de cada coluna
- ✅ Mostra apenas os valores únicos encontrados (máx. 20)
- ✅ Suporta múltiplos filtros simultâneos
- ✅ Filtros ativos são exibidos como badges
- ✅ Pode limpar todos os filtros com um clique
- ✅ Export e cópia usam dados filtrados

### Persistência

- ✅ Salvar dados em localStorage
- ✅ Carregar dados automaticamente ao recarregar a página
- ✅ Limpar dados com um clique

## 🛠️ Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Type safety
- **TanStack Table** - Tabela avançada
- **Tailwind CSS** - Styling
- **Zustand** - Gerenciamento de estado
- **PapaParse** - Parser de CSV
- **Lucide React** - Ícones

## 📋 Estructura do Projeto

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── CSVUploader.tsx      # Componente de upload
│   ├── DataTable.tsx        # Tabela principal
│   ├── ErrorAlert.tsx       # Alertas de erro
│   ├── ImporterDashboard.tsx # Componente principal
│   └── index.ts
├── lib/
│   ├── bankTemplates.ts     # Templates de bancos
│   ├── csvParser.ts         # Parser de CSV
│   └── exportUtils.ts       # Utilitários de export
├── store/
│   └── dataStore.ts         # Store Zustand
└── types/
    └── index.ts             # Tipos TypeScript
```

## 🚀 Como Usar

### 1. Upload de Arquivo

1. Clique na área de upload ou arraste um arquivo CSV
2. Se o banco for detectado automaticamente, continue para a tabela
3. Se não, selecione o banco manualmente e o mês (opcional)

### 2. Manipular Dados

- **Ordenar**: Clique no header da coluna
- **Filtrar**: Use a barra de filtro global
- **Selecionar**: Use as checkboxes
- **Deletar**: Selecione linhas e clique em deletar
- **Visibilidade**: Clique nos botões de coluna para mostrar/ocultar

### 3. Export/Cópia

- **Copiar**: Copia os dados para clipboard (formato tab-delimited)
- **Exportar**: Baixa arquivo CSV com os dados

### 4. Salvar Dados

- **Salvar Localmente**: Armazena em localStorage
- **Limpar**: Remove todos os dados

## 📦 Bancos Suportados

### Caixa Econômica

- **Delimiter**: `;` (ponto-e-vírgula)
- **Colunas esperadas**: Data, Descrição, Valor, Tipo de transação, Referência, Lançamento futuro
- **Auto-detecção**: Funciona por palavras-chave no conteúdo

### Itaú

- **Delimiter**: `,` (vírgula)
- **Colunas mínimas**: Data, Descrição, Valor

### Bradesco

- **Delimiter**: `,` (vírgula)
- **Colunas mínimas**: Data, Descrição, Valor

### Santander

- **Delimiter**: `,` (vírgula)
- **Colunas mínimas**: Data, Descrição, Valor

### Genérico

Se não conseguir detectar, pode usar este template genérico.

## 🔄 Fluxo de Dados

```
Upload CSV
    ↓
Detectar Banco
    ↓
Parsear com delimiter correto
    ↓
Validar colunas
    ↓
Limpar valores
    ↓
Detectar duplicatas
    ↓
Exibir em Tabela Interativa
    ↓
Exportar/Copiar
```

## 🚪 Localização de Dados

Os dados são armazenados em **localStorage** sob a chave: `cafe_dashboard_table_data`

Você pode acessar no DevTools:

```javascript
JSON.parse(localStorage.getItem("cafe_dashboard_table_data"));
```

## 🔧 Configuração de Novos Bancos

Para adicionar um novo banco, edite `/src/lib/bankTemplates.ts`:

```typescript
export const BANK_TEMPLATES: Record<string, BankTemplate> = {
  meuBanco: {
    id: "meuBanco",
    name: "Meu Banco",
    delimiter: ";",
    expectedColumns: ["Data", "Descrição", "Valor"],
    dateColumn: "Data",
    descriptionColumn: "Descrição",
    valueColumn: "Valor",
  },
};

export const AUTO_DETECT_KEYWORDS: Record<string, string[]> = {
  meuBanco: ["meu banco", "meubanc"],
};
```

## 🐛 Tratamento de Erros

- **CSV inválido**: Mensagem clara sobre o problema
- **Colunas não encontradas**: Opção de selecionar banco manualmente
- **Duplicatas**: Destacadas em vermelho com aviso
- **Valores inválidos**: Limpeza automática de valores

## 📱 Responsividade

A interface é totalmente responsiva:

- Desktop: Layout 3 colunas (upload, info, tabela)
- Tablet: Layout 2 colunas
- Mobile: Layout 1 coluna

## 🔐 Segurança

- Dados processados apenas no navegador (client-side)
- Sem envio de dados para servidores (localStorage apenas)
- Pronto para integração futura com MongoDB

## 🚧 Próximas Iterações

- [ ] Integração com MongoDB
- [ ] Autenticação de usuários
- [ ] Templates customizáveis por usuário
- [ ] Histórico de importações
- [ ] Gráficos e analytics
- [ ] Mais módulos de funcionalidade

### v0.2.0 (Atual)

- ✅ Filtros avançados por coluna (texto, seleção, numérico)
- ✅ Detecção automática de tipo de coluna para filtros
- ✅ Suporte a múltiplos filtros simultâneos
- ✅ Cores de texto mais escuras para melhor legibilidade
- ✅ Filtros ativos respeitados em export e cópia
- ✅ Interface aprimorada de controles

### v0.1.0 (Anterior)

- ✅ Upload de CSV com detecção de banco
- ✅ Tabela interativa com sorting, filtro, seleção
- ✅ Detecção de duplicatas
- ✅ Export como CSV e cópia para clipboard
- ✅ localStorage para persistência
- ✅ Interface responsiva com Tailwind CSS
