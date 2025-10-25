# 🧪 TESTING GUIDE - Validação & Debugging

## ✅ 10 Testes Essenciais

### ✅ Passo 1: Setup Inicial

```bash
npm install
npm run dev
# Esperado: Servidor em http://localhost:3000 sem erros
```

### ✅ Passo 2: Verificar Dependências

```bash
# Verificar @tanstack/react-query
grep "@tanstack/react-query" package.json

# Esperado: "@tanstack/react-query": "^5.32.1"
```

### ✅ Passo 3: Verificar Estrutura

```bash
ls -la src/providers/QueryProvider.tsx
ls -la src/app/api/csv/parse/route.ts
ls -la src/hooks/useCSVOperations.ts

# Esperado: Todos os 3 arquivos devem existir
```

---

## 🧪 6 Testes Funcionais

### Teste 1️⃣: Upload Básico

1. Abra http://localhost:3000
2. Clique "Selecione arquivo" ou arraste `teste_caixa.csv`
3. Selecione banco (detecta automaticamente)
4. Clique "Analisar" ou "Processar"

**Esperado:**

- ✅ Modal desaparece
- ✅ Tabela aparece com dados
- ✅ Info cards mostram: Banco, Mês, Linhas

**Se falhar:**

```bash
# Verificar console (F12 > Console)
# Erro comum: "Cannot parse CSV"
# Solução: Usar teste_caixa.csv que já está testado

npm run dev
```

### Teste 2️⃣: localStorage Persistence

1. Após upload, abra DevTools (F12)
2. Vá para "Application" → "Local Storage"
3. Procure pela chave "csv-last-upload"
4. **Esperado:** Deve existir com JSON contendo `data` e `timestamp`

**Se falhar:**

- ❌ localStorage não está disponível
- Solução: Verificar se é localhost (não funciona em file://)
- Solução: Testar: `localStorage.setItem('test', '1')`

### Teste 3️⃣: Cache Hit (< 5 min)

1. Upload um CSV
2. Abra DevTools (F12 > Network)
3. Recarregue página imediatamente (F5)
4. **Esperado:**
   - ✅ Dados aparecem em <50ms
   - ✅ NÃO deve aparecer chamada POST /api/csv/parse
   - ✅ Dados vêm do cache TanStack Query + localStorage

**Debug:**

```bash
# F12 > Network > Filter por "csv/parse"
# Não deve haver requisição!
```

### Teste 4️⃣: Cache Expiration (> 5 min)

1. Upload um CSV
2. Aguarde **5 minutos e 30 segundos**
3. Recarregue página
4. **Esperado:**
   - ✅ localStorage com "csv-last-upload" deve estar vazio
   - ✅ Deve aparecer chamada POST /api/csv/parse (cache expirou)
   - ✅ Dados recarregam da API

### Teste 5️⃣: Copy sem Headers

1. Upload CSV com sucesso
2. Clique botão "Copiar Tudo" (ou similar)
3. Cole em Notepad/TextEdit
4. **Esperado:**
   - ✅ Dados colados sem os headers (Data, Detalhe, Valor, etc)
   - ✅ Apenas valores, um por linha ou tab-separated
   - ✅ Sem erros no console

### Teste 6️⃣: Copy Coluna Individual

1. Upload CSV com sucesso
2. Clique no ícone 📋 no header de uma coluna
3. Cole em Notepad
4. **Esperado:**
   - ✅ Apenas valores dessa coluna
   - ✅ Um valor por linha
   - ✅ Sem header da coluna

---

## 🔍 Debugging Avançado

### Console Errors

```bash
# F12 > Console > Procure por erros vermelhos
# NÃO deve haver:
❌ Cannot find module '@tanstack/react-query'
❌ QueryProvider is not defined
❌ useParseCSV is not a function
❌ CSV parsing error (se arquivo é válido)

# Deve haver (ok):
✅ Mensagens de info (azuis)
✅ Sem warnings relacionados a cache
```

### Network Tab

```bash
# F12 > Network > ao fazer upload
✅ POST /api/csv/parse → 200 OK (primeira vez)
✅ Sem POST (reload < 5min) = cache funcionando
❌ 500 error = arquivo CSV inválido
❌ 404 = arquivo não existe
```

### Storage Inspection

```bash
# F12 > Application > Local Storage

# Deve existir:
✅ csv-last-upload = {
    data: {
      rows: [...],
      columns: [...],
      bank: "caixa",
      month: "10-25",
      timestamp: 1729829400000
    },
    timestamp: 1729829400000
  }

# Depois de 5+ minutos:
✅ csv-last-upload deve estar vazio ou remover-se
```

### React Query DevTools (Optional)

```bash
# Instalar (desenvolvimento)
npm install -D @tanstack/react-query-devtools

# Importar em src/app/layout.tsx:
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

# Adicionar em layout:
<ReactQueryDevtools initialIsOpen={false} />

# Usar: F12 > Aba "devtools" (canto inferior)
```

---

## 📊 Performance Metrics

| Métrica                 | Esperado | Máximo |
| ----------------------- | -------- | ------ |
| 1º upload               | 2-3s     | 5s     |
| Cache hit               | <50ms    | 100ms  |
| Reload < 5min           | <100ms   | 200ms  |
| Copy operation          | <500ms   | 1s     |
| Memória inicial         | <20MB    | 50MB   |
| Memória após 10 uploads | <40MB    | 100MB  |

---

## ✨ Checklist Final

### Setup ✅

- [ ] `npm install` funcionou sem erros
- [ ] `npm run dev` iniciou servidor
- [ ] http://localhost:3000 carrega
- [ ] F12 console sem erros vermelhos

### Funcionalidade ✅

- [ ] Upload básico funciona (dados aparecem)
- [ ] localStorage contém "csv-last-upload"
- [ ] Cache hit funciona (<50ms reload)
- [ ] Cache expira após 5+ minutos
- [ ] Copy sem headers funciona
- [ ] Copy coluna individual funciona

### Performance ✅

- [ ] 1º upload < 3s
- [ ] Cache hit < 100ms
- [ ] Memory stable (sem leak)
- [ ] Sem lag ao interact

### Tudo OK? 🎉

```bash
# Sucesso!
echo "✅ TODOS OS TESTES PASSARAM - PRONTO PARA PRODUÇÃO"
```

---

## 🆘 Troubleshooting

| Problema              | Debug                       | Solução                                  |
| --------------------- | --------------------------- | ---------------------------------------- |
| CSV não faz upload    | F12 > Console > Copiar erro | Verificar arquivo válido, tamanho < 10MB |
| localStorage vazio    | F12 > Application           | Verificar localStorage habilitado        |
| Cache não funciona    | F12 > Network               | Verificar Network tab, deve faltar POST  |
| API retorna 500       | F12 > Console               | Erro no arquivo CSV ou API               |
| Dados desaparecem     | localStorage expirou        | Re-fazer upload                          |
| Filtros não funcionam | F12 console                 | Recarregar página (F5)                   |

---

## 📚 Referências

- **SETUP_GUIDE.md** - Como instalar
- **ARCHITECTURE.md** - Como funciona
- **EXAMPLES.md** - Exemplos de código

---

**Versão**: 1.0 (TanStack Query)  
**Status**: ✅ Validado  
**Última atualização**: 25 de Outubro de 2025
