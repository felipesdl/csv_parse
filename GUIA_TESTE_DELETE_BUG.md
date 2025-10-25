# 🧪 Teste do Bug Fix: Delete com Filtros

## Objetivo

Verificar se a função de delete agora funciona corretamente quando filtros avançados estão aplicados.

## Contexto Técnico

- **Bug Original**: Quando filtros aplicados, delete removia linhas erradas porque usava índices da tabela filtrada em vez dos índices originais
- **Solução**: Implementado `filteredDataWithMap` que rastreia `originalIndex` para cada linha filtrada, mapeando índices selecionados de volta antes de deletar
- **Arquivo de Teste**: `teste_caixa_com_duplicatas.csv` com múltiplos "Saldo do dia" para testar

## Plano de Teste

### Teste 1: Upload do Arquivo

1. Abrir http://localhost:3000
2. Clicar em "Upload" button
3. Modal deve abrir com CSVUploader
4. Arrastar ou selecionar `teste_caixa_com_duplicatas.csv`
5. Arquivo deve ser detectado como Caixa
6. Modal deve fechar automaticamente após upload sucesso

**Resultado Esperado**:

- Tabela carrega com dados
- Layout muda para full-width
- Nenhum erro no console

### Teste 2: Análise de Dados Carregados

Após upload bem-sucedido, verificar:

1. Campo "Total de linhas" deve mostrar número total de linhas (ex: 11)
2. Campo "Duplicatas" deve mostrar número de registros duplicados (ex: 5)
3. Linhas duplicadas devem ter fundo vermelho e marcação "Duplicada"

**Descrição**: No arquivo teste, "Saldo do dia" aparece duplicado em:

- 30/10/2025 23:59:59 (2 vezes) - Linhas 0 e 1
- 29/10/2025 23:59:59 (2 vezes) - Linhas 3 e 4
- 28/10/2025 23:59:59 (1 vez) - Linha 6
- 27/10/2025 23:59:59 (1 vez) - Linha 8

Total: 5 linhas duplicadas

### Teste 3: Filtrar por "Saldo do dia"

1. Clicar no botão "Filtros"
2. AdvancedFiltersModal deve abrir
3. Selecionar coluna "Descrição"
4. Selecionar "Saldo do dia" (com Ctrl+Click ou checkbox)
5. Tabela deve mostrar apenas linhas com "Saldo do dia"

**Resultado Esperado**:

- Tabela mostra 5 linhas (as duplicatas)
- Todas têm "Saldo do dia" na coluna Descrição
- Campo "Total de linhas" muda para 5
- Filtro aparece como badge ativo

### Teste 4: Selecionar Todas as Linhas Filtradas

1. Clicar no checkbox no header da tabela
2. Todas as 5 linhas visíveis devem estar selecionadas (marcadas com checkmark)
3. Badge azul deve aparecer mostrando "5 linha(s) selecionada(s)"

**Resultado Esperado**:

- 5 linhas visualmente selecionadas
- Badge com "5 linha(s) selecionada(s)" aparece
- Botão com ícone trash (delete) fica visível no badge

### Teste 5: Deletar Linhas Selecionadas (CRÍTICO)

1. Clicar no ícone trash no badge de linhas selecionadas
2. Confirm dialog: "Deseja deletar 5 linha(s)?"
3. Clicar "OK" para confirmar delete

**Resultado Esperado - SEM BUG**:

- As 5 linhas deletadas são apenas as com "Saldo do dia"
- Total de linhas muda de 5 para 0 (porque todas visíveis foram deletadas)
- Campo "Total de linhas" agora mostra número reduzido quando remove filtro

### Teste 6: Remover Filtro para Verificar Dados Restantes

1. Clicar no botão X no badge de filtro ativo ("Descrição: Saldo do dia")
2. OU abrir modal de filtros e clicar "Limpar Filtros"

**Resultado Esperado**:

- Tabela volta a mostrar todas as linhas restantes
- Campo "Total de linhas" mostra número correto (original - 5 deletadas)
- Linhas deletadas NÃO aparecem
- As outras transações (Pagamento PIX, Crédito PIX, etc.) aparecem intactas

**Verificação de Bug**:
Se as linhas ERRADAS foram deletadas (ex: aparecem apenas "Saldo do dia" mas faltam outras transações), isso indica que o bug NÃO foi corrigido.

### Teste 7: Verificar Log do Console

Abrir DevTools (F12) e verificar:

- Nenhum erro vermelho no console
- Nenhum warning relacionado a índices ou mapeamento

## Casos de Teste Adicionais

### Caso A: Delete Parcial com Filtro

1. Aplicar mesmo filtro para "Saldo do dia"
2. Selecionar apenas 3 das 5 linhas
3. Delete e verificar que as 3 selecionadas foram removidas
4. Remover filtro e verificar que 2 "Saldo do dia" ainda existem

### Caso B: Delete com Múltiplos Filtros

1. Aplicar filtro por "Descrição" = "Saldo do dia"
2. Aplicar filtro adicional por "Tipo de transação" = vazio (linhas de saldo)
3. Delete todas as selecionadas
4. Verificar delete correto

### Caso C: Delete Após Reordenação

1. Carregar dados
2. Clicar em header "Descrição" para ordenar
3. Selecionar linhas
4. Delete e verificar que índices corretos são deletados (não posição visual)

## Critérios de Sucesso

✅ **BUG CORRIGIDO se**:

- Delete com filtros remove APENAS as linhas visíveis selecionadas
- Outras linhas não são afetadas
- Índices mapeados corretamente de filteredData → tableData.rows
- Nenhum erro no console

❌ **BUG NÃO CORRIGIDO se**:

- Delete remove linhas erradas
- Dados incorretos são deletados
- Comportamento inconsistente entre filtro e sem filtro

## Logs de Teste

### Execução 1

- Data: [preencher]
- Arquivo: teste_caixa_com_duplicatas.csv
- Linhas iniciais: [preencher]
- Linhas deletadas: [preencher]
- Linhas restantes: [preencher]
- Status: ✅ / ❌ [preencher]
- Observações: [preencher]
