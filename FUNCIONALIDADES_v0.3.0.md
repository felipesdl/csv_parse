# Café Dashboard - Funcionalidades Detalhadas (v0.3.0)

## 📋 Índice

1. [Upload de Arquivos](#upload-de-arquivos)
2. [Interface & Layout](#interface--layout)
3. [Manipulação de Dados](#manipulação-de-dados)
4. [Filtros Avançados](#filtros-avançados)
5. [Seleção & Delete](#seleção--delete)
6. [Export/Cópia](#exportcópia)
7. [Persistência](#persistência)
8. [Bug Fixes](#bug-fixes)

---

## Upload de Arquivos

### 🪟 Upload em Modal (NOVO na v0.3.0)

- **Local**: Botão "Upload" no header da página
- **Comportamento**: Clique abre Modal com CSVUploader
- **Drag & Drop**: Suporte para arrastar arquivo diretamente no modal
- **Click to Select**: Também pode clicar para selecionar arquivo
- **Auto-Close**: Modal fecha automaticamente após upload bem-sucedido
- **Feedback**: Mostra "Processando arquivo..." durante parse

### Detecção de Banco

- 🎯 **Automática**: Analisa estrutura do CSV para identificar banco
- 🏦 **Manual**: Se não detectar, selector permite escolher banco manualmente
- 📚 **Suportados**: Caixa, Itaú, Bradesco, Santander, outros
- ✅ **Fallback**: Permite forçar banco mesmo se estrutura não bater

### Detecção de Período

- 📅 **Automática**: Extrai mês/ano do arquivo
- ✏️ **Editável**: Campo permite sobrescrever se necessário
- 📝 **Formato**: Suporta "Setembro de 2025", "setembro/2025", etc.

### Validação

- ✅ Verifica se arquivo é CSV válido
- ✅ Valida colunas esperadas para banco
- ✅ Alerta sobre dados inválidos ou inconsistentes
- ✅ Permite continuar mesmo com warnings

---

## Interface & Layout

### 📱 Design Responsivo

- **Desktop**: Layout full-width otimizado
- **Tablet/Mobile**: Adaptação automática
- **Header Fixo**: Informações e botões sempre visíveis
- **Tabela Scrollável**: Scroll horizontal quando necessário

### 🪟 Modal-Based UI (NOVO na v0.3.0)

#### Modal de Upload

- **Tamanho**: Médio (md - max-width 448px)
- **Conteúdo**: CSVUploader com área de drop
- **Fechar**: Botão X ou clique fora do modal
- **Overlay**: Fundo escurecido com z-index 50

#### Modal de Filtros Avançados

- **Tamanho**: Grande (lg - max-width 576px)
- **Conteúdo**: Seletores de filtro por coluna
- **Multi-select**: Ctrl+Click para selecionar múltiplos valores
- **Dicas**: Mostras instruções de uso

### Header com Estatísticas

```
┌─────────────────────────────────────────────────┐
│ Banco: Caixa  │ Período: Set 2025  │ Linhas: 15  │ Duplicatas: 2
└─────────────────────────────────────────────────┘
```

- **Banco**: Nome do banco detectado
- **Período**: Mês/Ano do arquivo
- **Total de linhas**: Número total (ou filtrado)
- **Duplicatas**: Quantidade de linhas repetidas (em vermelho se > 0)

### Botões de Ação

| Botão             | Função                                  | Atalho           |
| ----------------- | --------------------------------------- | ---------------- |
| Upload            | Abre modal de upload                    | -                |
| Copiar            | Copia dados para clipboard              | -                |
| Exportar CSV      | Download em formato CSV                 | -                |
| Filtros           | Abre modal de filtros avançados         | -                |
| Salvar Localmente | Persiste em localStorage                | -                |
| Nova Importação   | Abre modal upload novamente             | -                |
| Limpar Dados      | Delete todos os dados (com confirmação) | -                |
| Olho/Olho Fechado | Mostrar/ocultar coluna                  | Clique na coluna |

---

## Manipulação de Dados

### ⬆️⬇️ Ordenação

- **Como**: Clique no header da coluna
- **Indicador**: Ícone ⬆️ ou ⬇️ aparece ao lado do nome
- **Alternância**: Clique novamente para inverter ordem (ASC ↔ DESC)
- **Multi-coluna**: Somente uma coluna de cada vez
- **Tipos**: Numérico, texto, data (automático)

### 🔍 Filtro Global

- **Campo**: "Filtrar dados globalmente..." no topo
- **Busca**: Pesquisa em TODAS as colunas visíveis
- **Tempo Real**: Atualiza conforme digita
- **Substring**: Busca por contem (case-insensitive)
- **Interação**: Limpa ao apagar campo ou clicar X

### 👁️ Visibilidade de Colunas

- **Buttons**: Um botão por coluna
- **Visual**: Olho aberto = visível, olho fechado = oculto
- **Cores**: Verde (visível), Cinza (oculto)
- **Efeito**: Imediato na tabela
- **Persistência**: Pode salvar em localStorage (futura)

---

## Filtros Avançados

### 🎯 Modal de Filtros

- **Acesso**: Botão "Filtros" na barra de ações
- **Indicador**: Mostra número de filtros ativos, ex: "Filtros (2)"
- **Cor**: Roxo quando tem filtros ativos, cinza quando não

### Tipos de Filtro

#### 1. 📝 Filtro de Texto

- **Aplicável**: Colunas texto (ex: Descrição)
- **Operação**: Contém (case-insensitive)
- **Exemplo**: Digitar "DÉBITO" filtra linhas com "débito", "Débito", "DÉBITO"
- **Input**: Campo de texto única entrada

#### 2. 🔢 Filtro Numérico

- **Aplicável**: Colunas numéricas (ex: Valor)
- **Operação**: Valor exato (remove formatação)
- **Exemplo**: Digitar "1000" filtra linhas com valor 1000
- **Input**: Campo numérico, aceita decimais

#### 3. ✓ Filtro Seleção (Multi-valor)

- **Aplicável**: Colunas com valores discretos (ex: Tipo de transação)
- **Operação**: OU lógico (qualquer valor selecionado)
- **Exemplo**: Selecionar "DÉBITO" e "CRÉDITO" mostra ambos
- **Input**: Dropdown multi-select com até 50 valores únicos
- **Interação**: Ctrl+Click para multi-select, checkbox alterna

#### 4. 🚀 Detecção Automática

- **Tipo**: Sistema detecta tipo baseado em dados
- **Heurística**: Se valores únicos < 20 → select, senão → text
- **Override**: Pode sempre digitar texto ou número

### Filtros Ativos

- **Display**: Badges abaixo da tabela mostram filtros aplicados
- **Formato**: `Coluna: valor1, valor2`
- **Remove**: Clique X no badge para remover filtro específico
- **Clear All**: Botão em modal limpa todos de uma vez

### Exemplo de Uso

```
Filtro: Descrição = "Saldo do dia" E Tipo de transação = "DÉBITO"
→ Mostra apenas linhas que são "Saldo do dia" AND "DÉBITO"
```

---

## Seleção & Delete

### ✅ Seleção Múltipla

- **Checkbox**: Um por linha (esquerda)
- **Select All**: Checkbox no header seleciona/deseleciona todas
- **Visual**: Linha selecionada tem fundo azul (bg-blue-50)
- **Counter**: Badge azul mostra quantidade selecionada

### 🗑️ Delete com Correção de Índices (FIX v0.3.0)

#### Funcionalidade

- **Delete Múltiplas**: Selecione linhas e clique ícone trash
- **Confirmação**: Dialog pede confirmação com quantidade
- **Irreversível**: Uma vez deletada, não há undo (salve antes!)

#### 🔧 Bug Fix: Mapeamento de Índices

**Problema Corrigido**: Delete com filtros agora funciona corretamente!

- **Antes**: Ao filtrar, delete removia linhas ERRADAS (índices não mapeados)
- **Agora**: Delete mapeia índices da tabela filtrada → índices originais

**Como Funciona**:

```
1. Tabela completa tem 11 linhas (índices 0-10)
2. Filtro por "Saldo do dia" mostra 5 linhas (índices 0,1,3,4,6)
3. Usuário vê essas 5 na tabela como posições 0,1,2,3,4
4. Seleciona todas (5 selecionadas)
5. Delete agora entende que precisa deletar índices originais [0,1,3,4,6]
6. Resultado: Apenas "Saldo do dia" deletados, outros dados intactos ✅
```

**Validação**: Veja `GUIA_TESTE_DELETE_BUG.md` para teste completo

### 🚨 Detecção de Duplicatas

- **Automática**: Feita ao fazer upload
- **Visual**: Linhas duplicadas têm fundo vermelho
- **Label**: "Duplicada" aparece em linhas repetidas
- **Contador**: Header mostra total de duplicatas
- **Cor**: Contador em vermelho se > 0, verde se 0

#### Lógica de Detecção

- Compara TODAS as colunas da linha
- Se todas as colunas iguais, marca como duplicada
- Primeira ocorrência não é marcada, repetições sim
- Útil para auditoria de dados

---

## Export/Cópia

### 📋 Copiar para Clipboard

- **Formato**: Tab-delimited (padrão para Excel/Sheets)
- **Conteúdo**: Headers + dados
- **Seleção**: Usa linhas selecionadas, ou todas se nenhuma seleção
- **Colunas**: Respeita visibilidade (ocultas não copiam)
- **Feedback**: Alert confirma sucesso
- **Atalho**: Ctrl+C após seleção (manual no browser)

### 📥 Exportar como CSV

- **Formato**: CSV com `;` como delimitador (padrão Brasil)
- **Filename**: `dados_{banco}_{timestamp}.csv`
- **Conteúdo**: Headers + dados
- **Seleção**: Usa linhas selecionadas, ou todas
- **Colunas**: Respeita visibilidade
- **Download**: Arquivo salvo em pasta Downloads

### ✨ Respeita Filtros & Visibilidade

```
Exemplo:
- Tabela tem: Data, Descrição, Valor, Tipo
- Ocultar: Tipo (Eye button off)
- Filtrar: Descrição = "DÉBITO"
- Export: Copia apenas linhas com "DÉBITO", apenas colunas Data/Descrição/Valor
```

---

## Persistência

### 💿 localStorage

- **Armazenamento**: Dados salvos em localStorage do browser
- **Ativação**: Clique em "Salvar Localmente"
- **Recuperação**: Automática ao recarregar página
- **Limite**: ~5MB por site (suficiente para maioria dos CSVs)
- **Limpeza**: "Limpar Dados" apaga de localStorage também

### 📊 Dados Salvos

- ✅ Dados da tabela completa
- ✅ Banco e período
- ✅ Timestamp de upload
- ❌ Filtros não persistem (reset ao recarregar)
- ❌ Seleção não persiste

### Fluxo de Uso

```
1. Upload arquivo
2. Clique "Salvar Localmente" (salva localStorage)
3. Recarrega página (F5)
4. Dados reaparecem automaticamente
5. Continua onde parou
```

---

## Bug Fixes

### ✅ v0.3.0 - Delete com Filtros (CRÍTICO)

**Descrição**: Quando filtros avançados aplicados, delete removia linhas erradas

**Root Cause**:

- TanStack Table retorna índices relativos à `filteredData`
- Ao deletar, usávamos esses índices na tabela completa (`tableData.rows`)
- Mapeamento incorreto causava delete de dados errados

**Solução Implementada**:

- Criar `filteredDataWithMap` que rastreia `originalIndex` para cada linha
- Em `handleDeleteSelected`, mapear índices selecionados → índices originais
- Delete usa índices originais corrigidos

**Teste**: `GUIA_TESTE_DELETE_BUG.md` com passos reprodução e validação

---

## 🎯 Fluxo Típico de Uso

```
1. Abrir http://localhost:3000
   ↓ Vê apenas botão "Upload" e mensagem "Nenhum arquivo"

2. Clicar "Upload"
   ↓ Modal abre com CSVUploader

3. Arrastar arquivo CSV ou clicar para selecionar
   ↓ Sistema detecta banco, parse dados

4. Modal fecha, tabela aparece full-width
   ↓ Dados carregam com informações estatísticas

5. Usar tabela:
   - Ordenar: Clique headers
   - Filtro global: Digite no campo
   - Filtros avançados: Clique "Filtros"
   - Mostrar/ocultar: Clique botões olho
   - Selecionar: Checkbox
   - Delete: Selecione e clique trash (funciona com filtros!)
   - Copiar: Clique "Copiar"
   - Exportar: Clique "Exportar CSV"

6. Salvar
   - Clique "Salvar Localmente" para persistir em localStorage
   - Próxima vez que abrir, dados reaparecem

7. Nova importação: Clique "Nova Importação" para upload novo
```

---

## 📊 Comparação: Antes vs Depois (v0.3.0)

| Aspecto           | Antes                  | Depois                   |
| ----------------- | ---------------------- | ------------------------ |
| Layout Upload     | Sidebar esquerdo       | Modal                    |
| Tabela            | Col-span-2 (66% width) | Full-width               |
| Filtros           | Botões inline          | Modal multi-select       |
| Height            | Ocupava muito espaço   | Compacto                 |
| Delete com Filtro | ❌ Bug removia errados | ✅ Funciona corretamente |
| UI                | Poluído                | Limpo e focado           |
