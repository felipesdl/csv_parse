# 🧪 GUIA DE TESTES - v0.5.0

**Servidor:** http://localhost:3000  
**Arquivo de teste:** `teste_real_102025.csv` (100+ linhas)

---

## FLUXO COMPLETO DE TESTE

### 1️⃣ INÍCIO

- [ ] Abra http://localhost:3000
- [ ] Página deve carregar sem erros
- [ ] Console (F12) não deve ter erros vermelhos
- [ ] Botão "Upload" deve estar visível

---

### 2️⃣ UPLOAD

```
Clique: Upload → Selecione teste_real_102025.csv → OK
```

**Verificações:**

- [ ] Modal desaparece após upload
- [ ] Tabela aparece com dados
- [ ] Info cards mostram:
  - Banco: caixa
  - Período: Setembro de 2025
  - Total de linhas: 99
  - Duplicatas: 0

**Performance:**

- [ ] Nenhum lag visível
- [ ] Tabela renderiza em < 1 segundo

---

### 3️⃣ FILTRO GLOBAL

```
Clique no input "Filtrar dados..." e digite um valor
Ex: "Saldo" ou "646"
```

**Verificações:**

- [ ] Tabela filtra em tempo real
- [ ] Contador de linhas atualiza
- [ ] Sem lag ao digitar
- [ ] Busca funciona em todas as colunas

**Testes específicos:**

- [ ] Digite "Saldo do dia" → deve encontrar linhas
- [ ] Digite "646.00" → deve encontrar valores
- [ ] Apague tudo → tabela volta ao normal

---

### 4️⃣ FILTROS AVANÇADOS

#### 4.1 Abrir Modal

```
Clique: Botão "Filtros" (cinza/roxo)
```

**Verificações:**

- [ ] Modal abre sem lag
- [ ] Lista de colunas aparece
- [ ] Cada coluna tem um chevron (▼)
- [ ] Sem memory leak (app não fica lento)

#### 4.2 Expandir Coluna Numérica

```
Clique em uma coluna numérica (ex: "Valor")
```

**Verificações:**

- [ ] Coluna expande mostrando input numérico
- [ ] Chevron muda para ▲
- [ ] Pode digitar um número
- [ ] Pode recolher clicando novamente

#### 4.3 Aplicar Filtro Numérico

```
Digite: 646.00
```

**Verificações:**

- [ ] Tabela filtra automaticamente
- [ ] Badge roxo aparece mostrando filtro ativo
- [ ] Total de linhas atualiza
- [ ] Modal permanece aberto
- [ ] Sem travamento

#### 4.4 Expandir Coluna de Texto/Select

```
Clique em uma coluna de texto (ex: "Descrição")
```

**Verificações:**

- [ ] Mostra dropdown com valores únicos
- [ ] Max 50 valores mostrados
- [ ] Dica "Ctrl+Click para seleção múltipla"

#### 4.5 Filtro Select Múltiplo

```
Selecione 2-3 valores (Cmd+Click no Mac)
```

**Verificações:**

- [ ] Valores ficam destacados
- [ ] Tabela filtra para mostrar apenas selecionados
- [ ] Badge roxo mostra valores selecionados
- [ ] Pode desselecionar

#### 4.6 Remover Filtro Individual

```
Clique no X ao lado do badge roxo
```

**Verificações:**

- [ ] Filtro é removido
- [ ] Tabela atualiza
- [ ] Badge desaparece
- [ ] Total de linhas sobe novamente

#### 4.7 Limpar Todos

```
Com 2+ filtros ativos, clique "Limpar todos"
```

**Verificações:**

- [ ] Todos os filtros removidos de uma vez
- [ ] Tabela volta a mostrar dados completos
- [ ] Nenhum badge roxo visível

#### 4.8 Fechar Modal

```
Clique em X (canto superior direito)
```

**Verificações:**

- [ ] Modal fecha
- [ ] Filtros permanecem ativos
- [ ] Tabela continua filtrada

---

### 5️⃣ SORTING

```
Clique no header de uma coluna (ex: "Valor")
```

**Verificações:**

- [ ] Seta ▲ aparece (ordenação crescente A→Z)
- [ ] Dados são ordenados
- [ ] Segundo clique: seta ▼ (decrescente Z→A)
- [ ] Terceiro clique: remove sorting

**Teste com múltiplas colunas:**

- [ ] Apenas uma coluna pode ter sorting
- [ ] Clicar em outra coluna muda o sorting

---

### 6️⃣ SELEÇÃO DE LINHAS

#### 6.1 Selecionar Linhas Individuais

```
Clique em checkboxes de 3-5 linhas
```

**Verificações:**

- [ ] Checkboxes ficam marcados
- [ ] Linhas ficam com fundo azul
- [ ] Barra azul aparece mostrando "X linha(s) selecionada(s)"
- [ ] Contador atualiza

#### 6.2 Selecionar Tudo

```
Clique no checkbox do header (primeira coluna)
```

**Verificações:**

- [ ] Todos os checkboxes ficam marcados
- [ ] Todas as linhas ficam azuis
- [ ] Barra mostra total correto
- [ ] Contador mostra "99 linha(s)" (ou total visível)

#### 6.3 Desselecionar Tudo

```
Clique novamente no checkbox do header
```

**Verificações:**

- [ ] Todos os checkboxes desmarcar
- [ ] Fundo azul some
- [ ] Barra desaparece

---

### 7️⃣ DELETE SELEÇÃO

```
Selecione 2-3 linhas → Clique no ícone 🗑️ (lixo)
```

**Verificações:**

- [ ] Dialog de confirmação aparece
- [ ] Mostra "Deseja deletar X linha(s)?"
- [ ] Clique OK para confirmar

**Após deletar:**

- [ ] Linhas desaparecem
- [ ] Total atualiza (decrementa)
- [ ] Seleção é limpa
- [ ] **IMPORTANTE:** Outras linhas não desaparecem
  - Verificar que índices estão corretos

**Teste com Filtros Ativos:**

```
1. Aplique um filtro
2. Selecione linhas filtradas
3. Delete
4. Remova o filtro
5. Verifique que apenas as selecionadas foram deletadas
```

---

### 8️⃣ COPIAR DADOS

```
Clique: Botão "Copiar" (azul, ícone clip)
```

**Verificações:**

- [ ] Alert mostra "Dados copiados para a área de transferência!"
- [ ] Sem lag/travamento

**Teste de Cópia:**

```
1. Após copiar, abra um editor de texto
2. Cmd+V (paste)
3. Dados devem aparecer com TAB como separador
```

---

### 9️⃣ EXPORTAR CSV

```
Clique: Botão "Exportar CSV" (verde, ícone download)
```

**Verificações:**

- [ ] Arquivo é baixado automaticamente
- [ ] Nome: `dados_caixa_<TIMESTAMP>.csv`
- [ ] Arquivo aparece em Downloads

**Teste do Arquivo:**

```
1. Abra arquivo com Excel ou texto
2. Separador deve ser `;` (ponto-e-vírgula)
3. Dados devem estar corretos
4. Número de linhas = filtrado (se há filtro ativo)
```

---

### 🔟 VISIBILIDADE DE COLUNAS

```
Clique nos botões abaixo da tabela (com ícone olho)
```

**Verificações:**

- [ ] Cada coluna tem um botão
- [ ] Botão tem ícone olho aberto/fechado
- [ ] Clicar esconde a coluna (fundo mais escuro)
- [ ] Clicar novamente mostra (fundo normal)
- [ ] Tabela reflow sem erros

---

## ⚡ TESTES DE PERFORMANCE

### Teste 1: Sem Seleção (Ideal: < 100ms)

- [ ] Copiar: < 100ms
- [ ] Exportar: < 150ms
- [ ] Aplicar filtro simples: < 100ms
- [ ] Remover filtro: < 50ms

### Teste 2: Com Seleção (Ideal: < 50ms)

- [ ] Selecionar linha: < 50ms
- [ ] Delete confirmado: < 100ms

### Teste 3: Modal (Ideal: < 200ms)

- [ ] Abrir modal: < 150ms
- [ ] Expandir coluna: < 100ms
- [ ] Aplicar filtro: < 50ms

---

## 🔍 CONSOLE CHECKS (F12 → Console)

- [ ] Nenhuma mensagem vermelha (errors)
- [ ] Nenhuma mensagem amarela (warnings)
- [ ] Nenhuma mensagem sobre memory leak
- [ ] Nenhuma network error (404, 500, etc)

---

## 💾 PERSISTÊNCIA

```
1. Upload arquivo
2. Clique "Salvar Localmente" (disco)
3. Feche a aba
4. Abra http://localhost:3000 novamente
5. Dados devem estar presentes
```

**Verificações:**

- [ ] Dados persistem
- [ ] Tabela mostra mesma informação
- [ ] Sem reerror ao carregar

---

## 🔄 RESET

```
Clique: Botão "Reset" (seta circular)
```

**Verificações:**

- [ ] Dialog pergunta "Tem certeza?"
- [ ] Clique OK
- [ ] Todos os dados desaparecem
- [ ] localStorage é limpo
- [ ] Volta ao estado inicial vazio

---

## 🎯 RESULTADO DO TESTE

| Função            | Status    | Notas |
| ----------------- | --------- | ----- |
| Upload            | ✅/❌     |       |
| Filtro Global     | ✅/❌     |       |
| Filtros Avançados | ✅/❌     |       |
| Sorting           | ✅/❌     |       |
| Seleção           | ✅/❌     |       |
| Delete            | ✅/❌     |       |
| Copiar            | ✅/❌     |       |
| Exportar          | ✅/❌     |       |
| Visibilidade      | ✅/❌     |       |
| Persistência      | ✅/❌     |       |
| Performance       | ✅/❌     |       |
| Console           | ✅/❌     |       |
| **GERAL**         | **✅/❌** |       |

---

## ✅ SE TUDO PASSOU

Parabéns! 🎉 O sistema está **pronto para produção**.

```bash
git add .
git commit -m "Versão 0.5.0 - Next.js 15 + React 18 com DataTable simplificado"
git push origin main
```

---

## ❌ SE ALGO FALHOU

1. Anote qual funcionalidade falhou
2. Verifique console (F12) para mensagens de erro
3. Reporte o erro completo
4. Descreva: "Quando fiz X, esperava Y, mas aconteceu Z"

**Contato:** [Seu email/Slack]

---

**Testado em:** October 24, 2025  
**Versão:** Next.js 15.0.0 + React 18.3.1  
**Browser:** Chrome/Safari/Firefox (latest)
