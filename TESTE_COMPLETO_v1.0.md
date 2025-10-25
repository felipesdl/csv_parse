# TESTE COMPLETO DO SISTEMA - v1.0

## Status do Código

- ✅ AdvancedFiltersModal.tsx (v3 final) - Limpa, sem memory leak
- ✅ DataTable.tsx - Corrigido handleDeleteSelected (sem infinit loop)
- ✅ ImporterDashboard.tsx - Simples e limpo
- ✅ Zustand Store - Funcionalidades básicas OK
- ✅ Deletadas versões antigas (v1 e v2)

## Fluxo de Testes

### 1. UPLOAD DE ARQUIVO

**Procedimento:**

1. Abra http://localhost:3000
2. Clique no botão "Upload" no canto superior direito
3. Selecione o arquivo `teste_real_102025.csv` (100+ linhas)
4. Clique em "Upload" no modal

**Verificações:**

- [ ] Modal abre sem erros no console
- [ ] Arquivo é carregado com sucesso
- [ ] Tabela aparece com dados
- [ ] Info cards mostram: Banco, Período, Total de Linhas, Duplicatas
- [ ] Não há congelamento ou lag

---

### 2. BOTÃO "COPIAR"

**Procedimento:**

1. Com dados carregados, clique no botão "Copiar" (azul, com ícone de clip)
2. Verifique se mensagem de sucesso aparece

**Verificações:**

- [ ] Clique não causa travamento
- [ ] Mensagem "Dados copiados para a área de transferência!" aparece
- [ ] Pode fazer paste (Cmd+V) para confirmar os dados foram copiados

---

### 3. BOTÃO "EXPORTAR CSV"

**Procedimento:**

1. Com dados carregados, clique no botão "Exportar CSV" (verde, com ícone de download)
2. Observe o download do arquivo

**Verificações:**

- [ ] Clique não causa travamento
- [ ] Arquivo é baixado com nome: `dados_<BANCO>_<TIMESTAMP>.csv`
- [ ] Arquivo contém os dados da tabela
- [ ] Separador é `;` (ponto-e-vírgula)

---

### 4. SELEÇÃO DE LINHAS

**Procedimento:**

1. Clique no checkbox de seleção de linhas (primeira coluna)
2. Selecione 3-5 linhas diferentes
3. Observe o contador no topo

**Verificações:**

- [ ] Checkboxes funcionam sem lag
- [ ] Contador de linhas selecionadas atualiza corretamente
- [ ] Barra de informação azul aparece mostrando "X linha(s) selecionada(s)"

---

### 5. BOTÃO "DELETAR" (com seleção)

**Procedimento:**

1. Selecione 2-3 linhas (ver teste 4)
2. Clique no ícone de lixeira 🗑️ na barra azul
3. Confirme a exclusão no diálogo

**Verificações:**

- [ ] Clique não causa travamento
- [ ] Diálogo de confirmação aparece
- [ ] Ao confirmar, linhas são deletadas
- [ ] Contador de total atualiza
- [ ] Seleção é limpa após exclusão
- [ ] **CRÍTICO:** Índices de outras linhas não são deletados acidentalmente (não há bug de índice)

---

### 6. BOTÃO "FILTROS" - ABRIR MODAL

**Procedimento:**

1. Clique no botão "Filtros" (cinza ou roxo se houver filtros)
2. Observe o modal abrir

**Verificações:**

- [ ] Modal abre sem travamento
- [ ] Não há memory leak (aplicação não fica cada vez mais lenta)
- [ ] Lista de colunas aparece com chevron (▼/▲)
- [ ] Pode fazer scroll dentro do modal

---

### 7. FILTROS - EXPANDIR COLUNA

**Procedimento:**

1. Modal de filtros aberto (teste 6)
2. Clique em uma coluna para expandir
3. Verifique o tipo de filtro (numérico ou seleção múltipla)

**Verificações:**

- [ ] Coluna expande sem lag
- [ ] Se numérico: mostra input de número
- [ ] Se texto/select: mostra dropdown com valores
- [ ] Valores são limitados a 50 (slice de amostra)
- [ ] Pode clicar novamente para recolher

---

### 8. FILTROS - APLICAR FILTRO NUMÉRICO

**Procedimento:**

1. Modal aberto
2. Expanda uma coluna numérica (ex: "Valor")
3. Digite um número (ex: 100)
4. Observe a tabela filtrar

**Verificações:**

- [ ] Sem travamento ao digitar
- [ ] Filtro se aplica automaticamente
- [ ] Tabela mostra apenas linhas com aquele valor
- [ ] Badge roxo aparece mostrando o filtro ativo
- [ ] Botão "Limpar todos" funciona

---

### 9. FILTROS - APLICAR FILTRO SELECT (Múltiplo)

**Procedimento:**

1. Modal aberto
2. Expanda uma coluna de texto (ex: "Tipo")
3. Selecione 2-3 valores (Ctrl+Click no Windows, Cmd+Click no Mac)
4. Observe a tabela filtrar

**Verificações:**

- [ ] Seleção múltipla funciona
- [ ] Tabela mostra apenas linhas com valores selecionados
- [ ] Badge roxo aparece mostrando filtro ativo
- [ ] Dica "Ctrl+Click para seleção múltipla" está visível

---

### 10. FILTROS - REMOVER FILTRO INDIVIDUAL

**Procedimento:**

1. Com um filtro ativo, clique no X ao lado do filtro roxo
2. Observe a tabela ser recarregada

**Verificações:**

- [ ] Filtro é removido
- [ ] Tabela volta a mostrar todos os dados (ou outros filtros ativos)
- [ ] Sem travamento

---

### 11. FILTROS - LIMPAR TODOS OS FILTROS

**Procedimento:**

1. Aplique 2-3 filtros diferentes
2. Clique em "Limpar todos" (botão vermelho no modal)

**Verificações:**

- [ ] Todos os filtros são removidos de uma vez
- [ ] Tabela volta a mostrar dados completos
- [ ] Sem travamento

---

### 12. FILTRO GLOBAL (busca)

**Procedimento:**

1. Feche o modal de filtros (se aberto)
2. Use o input de "Filtrar dados globalmente..."
3. Digite um valor que existe em qualquer coluna

**Verificações:**

- [ ] Tabela filtra em tempo real
- [ ] Busca funciona em todas as colunas
- [ ] Funciona em conjunto com filtros avançados
- [ ] Sem lag ao digitar

---

### 13. SORTING (Ordenação)

**Procedimento:**

1. Clique no header de uma coluna (ex: "Valor")
2. Clique novamente para inverter ordem

**Verificações:**

- [ ] Primeira clique: ordena crescente (com seta ▲)
- [ ] Segunda clique: ordena decrescente (com seta ▼)
- [ ] Terceira clique: remove ordenação
- [ ] Sem travamento

---

### 14. VISIBILIDADE DE COLUNAS

**Procedimento:**

1. Clique no ícone de olho (Eye) em uma coluna
2. Verifique se coluna desaparece

**Verificações:**

- [ ] Coluna desaparece da visualização
- [ ] Clique novamente para mostrar (Eye open)
- [ ] Preferência persiste se salvar/reload

---

### 15. SALVAR E RELOAD

**Procedimento:**

1. Carregue dados, aplique filtros, selecione linhas
2. Clique em "Salvar" (disco)
3. Feche a aba ou reload a página (F5)
4. Verifique se dados persistem

**Verificações:**

- [ ] Dados são salvos em localStorage
- [ ] Após reload, dados aparecem igual
- [ ] Filtros não persistem (apenas dados)
- [ ] Seleção não persiste

---

### 16. RESET

**Procedimento:**

1. Clique no botão "Reset" (ícone de seta circular)
2. Confirme no diálogo

**Verificações:**

- [ ] Todos os dados são deletados
- [ ] localStorage é limpo
- [ ] Voltamos ao estado inicial vazio

---

### 17. DETECÇÃO DE DUPLICATAS

**Procedimento:**

1. Com dados carregados, observe a coluna "Duplicatas" no info card
2. Se houver duplicatas, verifique na tabela (linhas em vermelho)

**Verificações:**

- [ ] Contador de duplicatas é correto
- [ ] Linhas duplicadas aparecem com fundo vermelho
- [ ] Label "Duplicada" aparece nas linhas vermelhas

---

## Verificação de Performance

### Sem Seleção (Ideal: < 100ms por operação)

- [ ] Copiar dados
- [ ] Exportar CSV
- [ ] Aplicar filtro simples
- [ ] Remover filtro

### Com Seleção (Ideal: < 50ms)

- [ ] Selecionar linha
- [ ] Deletar linha selecionada

### Modal (Ideal: Abre em < 200ms)

- [ ] Abrir modal de filtros
- [ ] Expandir coluna no modal
- [ ] Aplicar/remover filtro

---

## Console - Checklist

- [ ] Nenhum erro (red messages)
- [ ] Nenhuma warning de React Hooks
- [ ] Nenhuma warning de memory leak
- [ ] Nenhuma network error

---

## Resultado Final

**Data:** 24 de Outubro de 2025
**Testador:** [Seu nome]
**Status Geral:** ✅ PASSOU / ⚠️ COM ISSUES / ❌ FALHOU

### Issues Encontradas (se houver)

- ...

### Recomendações

- ...
