# 📖 USER GUIDE - Guia do Usuário

**Versão:** 1.0  
**Data:** Outubro 2025  
**Idioma:** Português Brasileiro

---

## 📑 Índice

1. [Bem-vindo](#bem-vindo)
2. [Primeiros Passos](#primeiros-passos)
3. [Dashboard Principal](#dashboard-principal)
4. [Upload de Arquivos](#upload-de-arquivos)
5. [Visualização de Dados](#visualização-de-dados)
6. [Comparação de Bancos](#comparação-de-bancos)
7. [Análises e Gráficos](#análises-e-gráficos)
8. [Exportação de Dados](#exportação-de-dados)
9. [Dicas e Truques](#dicas-e-truques)
10. [Troubleshooting](#troubleshooting)

---

## Bem-vindo

Bem-vindo ao **Café Dashboard**! 👋

Esta é uma ferramenta poderosa para analisar e comparar seus extratos bancários em formato CSV.

### O que você pode fazer aqui?

✅ **Carregar extratos** de múltiplos bancos  
✅ **Comparar transações** entre diferentes contas  
✅ **Visualizar gráficos** de créditos vs débitos  
✅ **Mapear colunas** com nomes diferentes  
✅ **Filtrar e buscar** dados específicos  
✅ **Exportar dados** em CSV  
✅ **Formatar visualização** de datas e valores

---

## Primeiros Passos

### 1. Acessar o Dashboard

Ao abrir a aplicação, você verá:

- **Sidebar esquerda** com navegação
- **Área principal** para upload de arquivos

### 2. Selecionar seu Banco

Todos os bancos suportados:

| Logo | Banco                       | ID          |
| ---- | --------------------------- | ----------- |
| 🏦   | Caixa Econômica             | `caixa`     |
| 💳   | Banco Inter                 | `inter`     |
| 🏛️   | Itaú                        | `itau`      |
| 🏦   | Bradesco                    | `bradesco`  |
| 🏪   | Santander                   | `santander` |
| 📊   | OnilX                       | `onilx`     |
| ❓   | Genérico (qualquer formato) | `generic`   |

**Não vê seu banco?** Use "Genérico" - é mais flexível!

### 3. Preparar seu Arquivo CSV

Para os melhores resultados:

1. Baixe o extrato do seu banco em **formato CSV**
2. Abra em um editor de texto para verificar:
   - Delimitador usado (`;` ou `,`)
   - Nomes das colunas (Data, Descrição, Valor, etc)
3. Salve como **UTF-8** se tiver acentos

---

## Dashboard Principal

### Layout

```
┌─ Sidebar ─────────────────────────────────────┐
│                                               │
│ 📊 Café Dashboard                             │
│                                               │
│ 🏠 Dashboard                                  │
│ 🔄 Comparação                                 │
│                                               │
└───────────────────────────────────────────────┘

┌─ Main Area ───────────────────────────────────┐
│                                               │
│  Café Dashboard                               │
│  ═══════════════════════════════════════════  │
│                                               │
│  📤 Upload de Arquivo                         │
│  [Clique ou arraste arquivo aqui]             │
│                                               │
│  ─────────────────────────────────────────── │
│                                               │
│  📋 Dados Carregados                          │
│  [Tabela com dados...]                        │
│                                               │
│  🎛️ Formatação                                │
│  [Controles de visualização...]               │
│                                               │
└───────────────────────────────────────────────┘
```

### Componentes

#### Seção de Upload

- **Drag & Drop:** Arraste um arquivo CSV aqui
- **Ou clique:** Para abrir seletor de arquivo

#### Seleção de Banco (após selecionar arquivo)

- Modal com todos os bancos
- Descrição de cada banco
- **Importante:** Selecione o banco CORRETO - não há detecção automática!

#### Tabela de Dados

Mostra todos os dados do seu extrato:

| Campo     | Descrição          |
| --------- | ------------------ |
| Data      | Data da transação  |
| Descrição | Descrição/Narração |
| Valor     | Valor da transação |
| ...       | Outras colunas     |

---

## Upload de Arquivos

### Passo 1: Selecionar Arquivo

Você tem 2 opções:

**Opção A - Drag & Drop:**

1. Abra o Dashboard
2. Arraste seu arquivo CSV para a área marcada
3. Solte o arquivo

**Opção B - Clique:**

1. Clique na área de upload
2. Navegue e selecione seu arquivo CSV
3. Clique "Abrir"

### Passo 2: Selecionar Banco

Após selecionar o arquivo:

1. Uma **janela modal** aparecerá
2. Escolha seu banco da lista (ex: "Caixa Econômica")
3. Clique **"OK"**

⚠️ **Importante:** A seleção do banco determina como interpretamos seu arquivo!

### Passo 3: Aguarde o Processamento

A barra de progresso mostrará:

- 📤 "Enviando arquivo..."
- 🔄 "Processando..."
- ✅ "Concluído!"

Se houver erro:

- ❌ "Erro ao processar" → Veja [Troubleshooting](#troubleshooting)

### Passo 4: Visualize seus Dados

Após o upload bem-sucedido:

- Tabela aparece com todos os dados
- Você pode aplicar filtros, buscar, etc

---

## Visualização de Dados

### Tabela

#### Barra de Controles (acima da tabela)

**Visibilidade de Colunas:**

- 👁️ Clique para mostrar/ocultar colunas
- Use para focar nas colunas que você quer

**Busca Global:**

- 🔍 Digite para buscar em qualquer coluna
- Busca em tempo real

**Filtros Avançados:**

- 🎛️ Clique para abrir filtros
- Filtre por intervalo de data, valor, etc

**Botões de Ação:**

- 📋 **Copiar:** Copia dados para clipboard
- 📥 **Exportar:** Salva como CSV
- ❌ **Deletar:** Remove linhas selecionadas

#### Sorting (Ordenação)

- Clique no header da coluna para ordenar
- ↑ = Crescente
- ↓ = Decrescente
- Clique novamente para reverter

#### Seleção de Linhas

- ☑️ Selecione linhas individuais
- ☑️ "Selecionar Tudo" no header
- Use com botões de Copiar/Deletar

### Formatação

A seção **Formatação** permite controlar como os dados aparecem:

#### 📅 Formato de Data

| Opção           | Exemplo          |
| --------------- | ---------------- |
| **Completo**    | 15/09/2025 23:59 |
| **Apenas Data** | 15/09/2025       |
| **Apenas Dia**  | 15               |

#### 💰 Valores Negativos

- ☐ **Mostrar como negativo:** `-100,00`
- ☑ **Mostrar como positivo:** `100,00`

#### 📊 Modo Tabela

- ☐ **Tabela única** com todos os dados
- ☑ **Tabela dividida** em Créditos e Débitos

---

## Comparação de Bancos

### Ir para Comparação

1. Clique em **"🔄 Comparação"** na sidebar
2. Você verá a página de comparação

### Página de Comparação

Layout:

```
┌─────────────────────────────────────┐
│  Comparação de Extratos             │
│                                     │
│  [📤 Adicionar Arquivo]             │
│                                     │
│  ┌─ Caixa ────────┐ ┌─ Inter ─────┐
│  │ ✅ 547 registros │ │ ✅ 312 recs │
│  │ 📅 15/09/2025   │ │ 📅 15/09/25 │
│  │ ❌              │ │ ❌          │
│  └─────────────────┘ └─────────────┘
│                                     │
│  ⬇️ Abas ⬇️                         │
│                                     │
└─────────────────────────────────────┘
```

### Adicionar Arquivos

1. Clique em **"📤 Adicionar Arquivo"**
2. Selecione arquivo CSV (mesmo processo do dashboard)
3. Escolha o banco
4. Arquivo é adicionado à comparação

Você pode adicionar **até N arquivos** para comparar!

### Cards de Arquivos

Cada arquivo mostra:

- ✅ Nome do banco
- 📊 Quantidade de registros
- 📅 Data de upload
- ❌ Botão remover

---

## Análises e Gráficos

### 📊 Aba 1: Análise Comparativa

Mostra **gráficos visuais** dos dados:

#### Créditos vs Débitos

- **Gráfico de Barras:** Compara créditos e débitos por banco
- 🟢 Verde = Créditos (entrada de dinheiro)
- 🔴 Vermelho = Débitos (saída de dinheiro)

#### Distribuição de Créditos (Pizza)

- Mostra proporção de créditos em cada banco
- Tamanho da fatia = Volume de crédito

#### Distribuição de Débitos (Pizza)

- Mostra proporção de débitos em cada banco
- Tamanho da fatia = Volume de débito

### 📋 Aba 2: Extratos Detalhados

Mostra **tabelas lado-a-lado** com todos os dados.

#### Visualização

Se você carregou **2 bancos:**

```
┌─ Caixa ──────────┬─ Inter ──────────┐
│ Data | Desc | Val │ Data | Desc | Val │
├──────┼──────┼─────┼──────┼──────┼─────┤
│ ...  │ ...  │ ... │ ...  │ ...  │ ... │
└─────────────────────────────────────┘
```

Se **3 ou mais:**

```
Tabelas empilhadas verticalmente
```

#### Resumo (Macro)

No topo, 4 cards informativos:

| Card                 | Valor                                  |
| -------------------- | -------------------------------------- |
| 💚 **Créditos**      | Total de créditos de todos os arquivos |
| 💔 **Débitos**       | Total de débitos de todos os arquivos  |
| 📍 **Valor Inicial** | Primeiro valor registrado              |
| 🎯 **Valor Final**   | Último valor registrado                |

### 📈 Aba 3: Consolidação

Mostra **totais e estatísticas** consolidadas.

- Total geral por banco
- Contagem de transações
- Período coberto
- Resumo de análise

---

## Exportação de Dados

### Copiar para Clipboard

1. Na tabela, selecione as linhas que quer
2. Clique no botão **📋 Copiar**
3. Cole em (Ctrl+V ou Cmd+V):
   - Excel
   - Google Sheets
   - Email
   - Qualquer lugar com suporte a colar

### Exportar como CSV

1. Na tabela, selecione as linhas que quer
2. Clique no botão **📥 Exportar**
3. Um arquivo `extratos.csv` é baixado
4. Abra em Excel ou editor de texto

**Dica:** Selecione "Selecionar Tudo" antes de exportar se quiser todos os dados!

---

## Dicas e Truques

### 🎯 Dica 1: Mapeamento de Colunas

Se seus bancos têm colunascom nomes diferentes (ex: "Data" vs "Data Lançamento"):

1. Vá para Comparação
2. Carregue os 2 arquivos
3. Procure o botão **"Configurar Mapeamento"**
4. Mapeia colunas com nomes similares
5. Agora a comparação usa os mapeamentos!

### 🎯 Dica 2: Filtros Rápidos

Busque rápido:

1. Use a 🔍 **Busca Global** para encontrar transações
2. Digite parcial do nome
3. Resultados aparecem em tempo real

### 🎯 Dica 3: Formato Customizado

Visualize dados do seu jeito:

1. Escolha o formato de data que gosta
2. Decida mostrar negativos como positivos ou não
3. Divida em créditos/débitos se preferir
4. Selecione qual colunas quer ver

### 🎯 Dica 4: Comparação Eficiente

Ao comparar múltiplos bancos:

1. Comece com 2 bancos
2. Use gráficos para ter visão geral
3. Va para "Extratos Detalhados" para ver linhas exatas
4. Use Consolidação para totais

### 🎯 Dica 5: Backup de Dados

Seus dados são salvos em **localStorage** do navegador:

- Próxima vez que você abre, dados anteriores aparecem
- Limpar cookies/cache apaga os dados
- Para backup: **Exporte como CSV**

---

## Troubleshooting

### ❌ "É necessário selecionar o banco manualmente"

**Problema:** Você não selecionou um banco após escolher o arquivo.

**Solução:**

1. Selecione o arquivo novamente
2. **Escolha o banco correto** da lista
3. Clique OK

### ❌ "CSV vazio ou inválido"

**Problema:** O arquivo não tem dados válidos.

**Solução:**

1. Verifique se o arquivo é CSV (não .xlsx, .txt)
2. Abra em editor de texto e verifique:
   - Tem header (nomes das colunas)?
   - Tem dados (não está vazio)?
3. Tente com outro arquivo

### ❌ "Colunas esperadas não encontradas"

**Problema:** Você selecionou o banco errado.

**Solução:**

1. O arquivo foi editado ou é de outro banco?
2. Tente selecionar outro banco
3. Se nada funcionar, use "Genérico"

### ❓ Dados não aparecem na tabela

**Possíveis causas:**

1. **Arquivo muito grande:** Aguarde processamento
2. **Todas as colunas ocultas:** Clique 👁️ e marque "Mostrar Tudo"
3. **Filtro muito restritivo:** Clique 🎛️ e resete filtros
4. **Busca muito específica:** Limpe a 🔍 busca

**Solução:**

1. Recarregue a página (F5)
2. Tente fazer upload novamente
3. Use outro arquivo para testar

### ❓ Comparação não funciona

**Possíveis causas:**

1. **Apenas 1 arquivo carregado:** Você precisa de 2 ou mais
2. **Nomes de colunas completamente diferentes:** Use mapeamento
3. **Delimitadores diferentes:** App detecta automaticamente

**Solução:**

1. Certifique que tem 2+ arquivos
2. Use "Configurar Mapeamento de Colunas"
3. Verifique se bancos foram identificados corretamente

### 🆘 Precisa de mais ajuda?

- **Verifique:** Se seu banco está na lista de suportados
- **Tente:** Usar "Genérico" se banco não for reconhecido
- **Contato:** Abra issue no GitHub do projeto

---

## Atalhos do Teclado

| Atalho             | Ação                        |
| ------------------ | --------------------------- |
| `Ctrl+V` / `Cmd+V` | Colar dados                 |
| `Ctrl+C` / `Cmd+C` | Copiar dados selecionados   |
| `Ctrl+S` / `Cmd+S` | Exportar (em algumas views) |
| `F5`               | Recarregar página           |
| `Esc`              | Fechar modal                |

---

## FAQ - Perguntas Frequentes

### P: Meus dados são privados?

**R:** Sim! Todos os dados são processados **no seu navegador**. Nada é enviado para servidor externo. Após fechar a página, dados são apagados da memória.

### P: Posso usar em mobile?

**R:** Sim, a interface é responsiva. Mas é melhor em desktop para ver tabelas grandes.

### P: Quantos arquivos posso comparar?

**R:** Tecnicamente ilimitado, mas recomendamos **2-4 arquivos** para performance.

### P: Como faço backup dos meus dados?

**R:** Use **Exportar CSV** para baixar seus dados. Salve em um local seguro.

### P: Posso deletar dados?

**R:** Sim, use o botão ❌ na tabela. Você pode selecionar linhas específicas ou tudo.

### P: E se perder os dados?

**R:** Dados são salvos em localStorage do navegador. Se limpar cookies, perde. Sempre exporte CSV como backup!

---

## Boas Práticas

### ✅ Faça:

- ✅ Sempre selecione o banco correto
- ✅ Verifique o arquivo CSV antes de fazer upload
- ✅ Exporte dados como CSV regularmente
- ✅ Use mapeamento de colunas se nomes diferem
- ✅ Aplique formatação customizada conforme necessário

### ❌ Evite:

- ❌ Arquivo CSV corrompido ou vazio
- ❌ Misturar formatos diferentes de banco
- ❌ Deletar dados sem fazer backup
- ❌ Carregar arquivo muito grande (>10MB)
- ❌ Confiar apenas em localStorage (sempre backup!)

---

## Próximas Funcionalidades

Coisas que estamos planejando:

- 📱 Melhor suporte mobile
- 🔐 Autenticação e contas de usuário
- 📊 Mais tipos de análises
- 🤖 Detecção automática mais inteligente
- 💾 Salvar comparações para reutilizar
- 📧 Compartilhar relatórios
- 📈 Insights com IA

---

**Obrigado por usar Café Dashboard! ☕**

Para sugestões ou feedback, abra uma issue no repositório.

**Última Atualização:** Outubro 2025
