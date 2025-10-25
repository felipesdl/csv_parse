# 📋 Guia de Teste - Dashboard de Importação

## ✅ Checklist de Testes

### 1. Upload de Arquivo

- [ ] **Upload com drag & drop**

  - Arraste `teste_caixa.csv` para a área de upload
  - Esperado: Arquivo detectado como Caixa Econômica automaticamente
  - Resultado: Tabela carregada com dados

- [ ] **Upload com clique**

  - Clique na área de upload
  - Selecione `teste_caixa.csv`
  - Esperado: Mesmo resultado do drag & drop

- [ ] **Detecção de banco**

  - Arquivo `teste_caixa.csv` deve ser detectado como "Caixa"
  - Arquivo fornecido `061000273753_15_02102025_073825.csv` deve ser detectado como "Caixa"
  - Resultado: Nenhum diálogo de seleção manual

- [ ] **Detecção de mês**
  - Mês deve ser detectado automaticamente dos dados (ex: "Outubro de 2025")
  - Resultado: Campo "Período" na tabela exibe mês correto

### 2. Visualização de Tabela

- [ ] **Informações exibidas**

  - [ ] Banco correto (Caixa)
  - [ ] Período correto (Outubro de 2025)
  - [ ] Total de linhas (16 para arquivo de teste)
  - [ ] Contagem de duplicatas

- [ ] **Colunas visíveis**
  - [ ] Data
  - [ ] Descrição
  - [ ] Valor
  - [ ] Tipo de transação
  - [ ] Referência
  - [ ] Lançamento futuro

### 3. Ordenação

- [ ] **Ordenar por Data (decrescente)**

  - Clique no header "Data"
  - Esperado: Dados ordenados por data descrescente
  - Clique novamente: Ordenação ascendente
  - Terceiro clique: Remove ordenação

- [ ] **Ordenar por Valor**

  - Clique no header "Valor"
  - Esperado: Valores ordenados numericamente

- [ ] **Indicador visual de ordenação**
  - Ícone de seta deve aparecer no header ordenado

### 4. Filtro Global

- [ ] **Filtrar por texto**

  - Digite "Pagamento" na barra de filtro
  - Esperado: Mostra apenas linhas com "Pagamento"
  - Linhas visíveis: 2 (ambas com "Pagamento PIX")

- [ ] **Filtrar por número**

  - Digite "1000" na barra de filtro
  - Esperado: Mostra apenas linhas com valor 1000

- [ ] **Limpar filtro**
  - Apague o texto do filtro
  - Esperado: Todos os dados retornam

### 4.1 Filtros Avançados por Coluna (Novo!)

- [ ] **Abrir painel de filtros avançados**

  - Clique no botão "Filtros Avançados"
  - Esperado: Painel abre mostrando todas as colunas

- [ ] **Filtro de texto (Descrição)**

  - Encontre a coluna "Descrição" no painel
  - Digite "PIX" na busca de texto
  - Esperado: Apenas linhas com "PIX" na descrição aparecem

- [ ] **Filtro de seleção (Tipo de transação)**

  - Encontre a coluna "Tipo de transação"
  - Clique no botão "DÉBITO"
  - Esperado: Apenas linhas com "DÉBITO" aparecem
  - Clique novamente para desselecionar

- [ ] **Filtro múltiplos valores (Tipo de transação)**

  - Clique em "DÉBITO" e "CRÉDITO"
  - Esperado: Linhas com ambos aparecem

- [ ] **Filtro numérico (Valor)**

  - Encontre a coluna "Valor"
  - Digite um valor (ex: 1000)
  - Esperado: Apenas linhas com esse valor exato aparecem

- [ ] **Múltiplos filtros simultâneos**

  - Ativar "DÉBITO" em "Tipo de transação" E valor "1000"
  - Esperado: Mostra apenas débitos com valor 1000
  - Badges de filtros ativos aparecem abaixo

- [ ] **Remover filtro individual**

  - Clique no X no badge de filtro ativo
  - Esperado: Apenas esse filtro é removido

- [ ] **Limpar todos os filtros**

  - Clique em "Limpar todos" no painel de filtros
  - Esperado: Todos os filtros removidos, dados voltam ao normal

- [ ] **Detecção automática de tipo de coluna**

  - Colunas numéricas mostram input numérico
  - Colunas de texto mostram botões de seleção
  - Esperado: Interface adapta-se ao tipo de dado

- [ ] **Máximo de valores únicos**

  - Colunas com muitos valores únicos mostram máximo 20
  - Esperado: Não congela a interface

### 4.2 Filtros com Export

- [ ] **Exportar com filtros ativos**

  - Aplique um filtro (ex: apenas "DÉBITO")
  - Clique em "Exportar CSV"
  - Arquivo baixado contém apenas linhas filtradas
  - Esperado: CSV tem apenas linhas de débito

- [ ] **Copiar com filtros ativos**

  - Aplique um filtro (ex: valor = 1000)
  - Clique em "Copiar"
  - Cole em editor de texto
  - Esperado: Apenas linhas com valor 1000 aparecem

### 5. Seleção de Linhas

- [ ] **Selecionar linha individual**

  - Clique na checkbox de uma linha
  - Esperado: Linha é destacada em azul

- [ ] **Selecionar todas as linhas**

  - Clique na checkbox do header
  - Esperado: Todas as linhas são selecionadas
  - Contador aparece mostrando "X linha(s) selecionada(s)"

- [ ] **Desselecionar**
  - Clique novamente na checkbox do header
  - Esperado: Todas são desselecionadas

### 6. Deletar Linhas

- [ ] **Deletar linha individual**

  - Selecione uma linha
  - Clique em "Deletar" (ícone de lixeira)
  - Confirme a ação
  - Esperado: Linha removida, contagem diminui

- [ ] **Deletar múltiplas linhas**
  - Selecione 3 linhas
  - Clique em "Deletar"
  - Confirme
  - Esperado: 3 linhas removidas

### 7. Reordenação de Colunas

- [ ] **Ocultar coluna**

  - Clique no botão de coluna "Referência"
  - Esperado: Coluna desaparece da tabela

- [ ] **Mostrar coluna**

  - Clique novamente no botão "Referência"
  - Esperado: Coluna reaparece

- [ ] **Estado persistido**
  - Salve os dados
  - Recarregue a página
  - Esperado: Configuração de visibilidade é mantida

### 8. Duplicatas

- [ ] **Carregue arquivo com duplicatas** (usar arquivo real do banco)

  - Alguns registros de "Saldo do dia" são duplicados no arquivo real
  - Esperado: Linhas duplicadas marcadas com aviso em vermelho

- [ ] **Visual de duplicata**
  - Ícone de alerta
  - Texto "Duplicada" em vermelho
  - Fundo vermelho claro

### 9. Export para CSV

- [ ] **Exportar todos os dados**

  - Certifique-se de que nenhuma linha está selecionada
  - Clique em "Exportar CSV"
  - Esperado: Download de arquivo `dados_caixa_TIMESTAMP.csv`

- [ ] **Exportar seleção**

  - Selecione 3 linhas
  - Clique em "Exportar CSV"
  - Esperado: Download contém apenas as 3 linhas selecionadas

- [ ] **Formato do CSV**
  - Abra o arquivo baixado
  - Esperado: Delimitador `;` (ponto-e-vírgula)
  - Header e dados corretos

### 10. Copiar para Clipboard

- [ ] **Copiar todos os dados**

  - Nenhuma linha selecionada
  - Clique em "Copiar"
  - Esperado: Mensagem "Dados copiados para a área de transferência!"

- [ ] **Colar em editor de texto**

  - Abra um editor de texto
  - Ctrl+V (ou Cmd+V)
  - Esperado: Dados colados com tabs como delimitadores

- [ ] **Copiar seleção**
  - Selecione algumas linhas
  - Clique em "Copiar"
  - Colar em editor
  - Esperado: Apenas as linhas selecionadas são coladas

### 11. Persistência em LocalStorage

- [ ] **Salvar dados**

  - Faça algumas modificações (delete de linhas, ocultar colunas)
  - Clique em "Salvar Localmente"
  - Abra DevTools (F12) → Application → LocalStorage
  - Procure por chave `cafe_dashboard_table_data`
  - Esperado: Dados estão salvos em JSON

- [ ] **Carregar dados automaticamente**

  - Com dados salvos, recarregue a página (F5)
  - Esperado: Dados anteriores são restaurados
  - Colunas ocultadas permanecem ocultadas

- [ ] **Limpar dados**
  - Clique em "Limpar Dados"
  - Confirme
  - Esperado: Página limpa, localStorage limpo

### 12. Validação e Erros

- [ ] **Arquivo não CSV**

  - Tente fazer upload de arquivo .txt
  - Esperado: Erro "Por favor, selecione um arquivo CSV válido"

- [ ] **CSV com colunas diferentes**

  - Altere manualmente o header do arquivo de teste
  - Esperado: Diálogo aparece pedindo para selecionar banco manualmente

- [ ] **CSV vazio**
  - Crie arquivo CSV vazio
  - Esperado: Erro "CSV vazio ou inválido"

### 13. Responsividade

- [ ] **Desktop (> 1024px)**

  - Layout 3 colunas (upload, info, tabela)
  - Tudo deve estar visível

- [ ] **Tablet (768px - 1024px)**

  - Adapt layout para 2 colunas
  - Sem scroll horizontal excessivo

- [ ] **Mobile (< 768px)**
  - Layout 1 coluna
  - Upload no topo
  - Tabela com scroll horizontal se necessário

### 14. Performance

- [ ] **Carregar arquivo grande** (use arquivo real de 100+ linhas)

  - Esperado: Carregamento rápido
  - Tabela responsiva ao interagir

- [ ] **Múltiplas seleções**
  - Selecione 50 linhas
  - Esperado: Sem lag

## 🧪 Arquivos de Teste

### `teste_caixa.csv` (Fornecido)

- Banco: Caixa Econômica
- Linhas: 16
- Formato: `;` delimitado
- Propósito: Teste básico

### `061000273753_15_02102025_073825.csv` (Seu arquivo)

- Banco: Caixa Econômica
- Linhas: 100+
- Formato: `;` delimitado
- Propósito: Teste com dados reais
- Duplicatas: Sim (registros de "Saldo do dia")

## 🔍 Casos de Uso

### Cenário 1: Usuário novo importa primeira vez

1. Acessa dashboard
2. Arrasta arquivo CSV
3. Banco detectado automaticamente
4. Visualiza dados
5. Exporta como CSV

### Cenário 2: Usuário limpa dados duplicados

1. Carrega arquivo com duplicatas
2. Vê avisos de duplicata em vermelho
3. Seleciona linhas duplicadas
4. Deleta
5. Exporta dados limpos

### Cenário 3: Usuário seleciona apenas algumas colunas

1. Carrega arquivo
2. Oculta colunas desnecessárias
3. Salva configuração
4. Copia dados com apenas colunas importantes
5. Cola em outro aplicativo

## 📊 Logs Esperados

### DevTools Console

- ✅ Sem erros vermelhos
- ✅ Avisos sobre localStorage OK
- ✅ Nenhuma erro não tratado

### DevTools Network

- ✅ Sem requisições externas
- ✅ Tudo processado localmente

## 🎯 Critério de Sucesso

✅ Todos os checkboxes marcados
✅ Sem erros no console
✅ Sem comportamentos inesperados
✅ Responsividade em todos os tamanhos
✅ Performance aceitável com dados grandes

---

**Data do Teste:** [DATA]
**Testador:** [NOME]
**Resultado:** [ ] PASSOU [ ] FALHOU

**Observações:**
