# 🧪 Guia de Teste: Gráfico de Pizza 60/40

## ✅ Como Testar a Nova Funcionalidade

### Pré-requisito

- Servidor rodando: `npm run dev`
- Acesso em: `http://localhost:3000`

---

## 🎯 Teste 1: Layout 60/40

### Passos:

1. Carregar um arquivo CSV
2. Observar a interface na página principal
3. **Esperado:**
   - Tabela ocupa ~60% à esquerda
   - Gráfico de pizza ocupa ~40% à direita
   - Ambos lado-a-lado em tela grande (desktop)

### Responsividade:

- **Desktop (≥ 1024px)**: Lado-a-lado
- **Tablet/Mobile (<1024px)**: Stack vertical (tabela em cima, gráfico embaixo)

---

## 🎨 Teste 2: Modo Positivo/Negativo

### Passos:

1. Carregar CSV com coluna "Valor" (ou numérica)
2. Observar gráfico por padrão
3. Verificar segmentos:
   - ✅ Verde = Valores Positivos
   - ❌ Vermelho = Valores Negativos
   - ⚫ Âmbar = Zero (se houver)

### Validar:

- [ ] Percentuais somam 100%
- [ ] Cores estão corretas
- [ ] Labels visíveis (nome: percentual)
- [ ] Legenda aparece embaixo

### Tooltip:

- Passar mouse sobre segmento
- Deve mostrar:
  - Nome do tipo (Positivos/Negativos)
  - Valor em R$ (formatado pt-BR)
  - Percentual (%)

---

## 🔄 Teste 3: Filtros Atualizando o Gráfico

### Passos:

1. Observar gráfico inicial (todos os dados)
2. Clicar no botão "Filtros (2)" ou "Filtros"
3. Selecionar um filtro avançado
   - Ex: Banco = "Inter"
4. **Esperado:**
   - Tabela reduz ao banco selecionado
   - Gráfico atualiza INSTANTANEAMENTE
   - Percentuais mudam

### Teste com Múltiplos Filtros:

1. Adicionar outro filtro
2. Gráfico atualiza novamente
3. Limpar todos os filtros
4. Gráfico volta ao normal

### Teste com Filtro Global:

1. Usar campo "Filtrar dados..."
2. Digitar um valor
3. Gráfico atualiza com dados filtrados

---

## 📊 Teste 4: Modo "Por Coluna"

### Passos:

1. Carregar CSV
2. Clicar botão "Por Coluna" (ao lado de "Pos/Neg")
3. **Esperado:**
   - Botão fica azul (ativo)
   - Aparece dropdown com colunas numéricas
   - Dropdown mostra colunas detectadas

### Visualização:

- Gráfico muda para mostrar distribuição
- Exemplo: "Saldo" mostra quantas transações para cada valor
- Top 10 valores mais frequentes
- Cada segmento = um valor único

### Trocar Coluna:

1. Clicar dropdown "Selecione coluna"
2. Escolher outra coluna numérica
3. Gráfico atualiza

---

## 🎨 Teste 5: Cores e Visual

### Validar:

- [ ] Cores são vibrantes e distintas
- [ ] Cada segmento tem cor diferente
- [ ] Texto legível (contraste ok)
- [ ] Legenda lista todos os segmentos
- [ ] Labels não se sobrepõem

### Se houver muitos segmentos:

- [ ] Labels rotacionam corretamente
- [ ] Legenda mostra todos (scroll se necessário)

---

## ⚡ Teste 6: Performance

### Teste com Dados Grandes:

1. Carregar CSV com 10.000+ linhas
2. Aplicar filtro
3. **Esperado:**
   - Gráfico atualiza em < 500ms
   - Sem travamentos
   - Interface responsiva

### Teste de Redimensionamento:

1. Abrir em desktop (60/40)
2. Redimensionar janela do navegador
3. **Esperado:**
   - Gráfico adapta ao novo tamanho
   - Layout não quebra
   - Transição suave

---

## 🐛 Teste 7: Casos Extremos

### Dados Vazios:

- [ ] Se não há dados: "Nenhum dado disponível para gráfico"
- [ ] Botões continuam visíveis

### Só Positivos/Só Negativos:

- [ ] Gráfico mostra apenas um segmento
- [ ] Percentual = 100%

### Com Duplicatas:

- [ ] Gráfico conta duplicatas também
- [ ] Resultado correto

### Colunas com Valores Null:

- [ ] Ignoradas automaticamente
- [ ] Cálculo não quebra

---

## ✅ Checklist Final

- [ ] Layout 60/40 funcionando
- [ ] Responsivo em todos os tamanhos
- [ ] Modo Positivo/Negativo correto
- [ ] Modo Por Coluna funcional
- [ ] Filtros atualizando gráfico
- [ ] Cores e visual agradável
- [ ] Tooltip informativo
- [ ] Performance adequada
- [ ] Sem erros no console
- [ ] Sem memory leaks

---

## 📝 Notas de Teste

### Se encontrar problema:

1. Abrir DevTools (F12)
2. Ir em Console
3. Anotar erros
4. Tentar identificar padrão
5. Reportar com dados reproduzíveis

### Dados de Teste Recomendados:

- CSV bancário com coluna "Valor"
- Mix de valores positivos e negativos
- Alguns valores zero (opcional)
- Múltiplos bancos para filtrar

---

## 🎉 Sucesso!

Se todos os testes passarem, a implementação está **100% funcional**! 🚀

**Data:** Outubro 25, 2025
**Versão:** 1.0
**Status:** ✅ Pronto para Produção
