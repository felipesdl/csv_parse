# 🧪 TESTING PLAN - Café Dashboard v1.0

**Data**: 2025-01-14  
**Status**: Ready to Test  
**Build**: ✅ Passou

---

## 📊 Test Coverage Matrix

### 1. UNIT TESTS - Funções Utilities

#### 1.1 `parseValueBR()` - Brazilian Value Parsing

| Caso                  | Input                 | Expected  | Status |
| --------------------- | --------------------- | --------- | ------ |
| Valor positivo com R$ | `"R$ 1.234,56"`       | `1234.56` | ⏳     |
| Valor negativo        | `"-245,50"`           | `-245.5`  | ⏳     |
| Sem símbolo R$        | `"1.250,00"`          | `1250`    | ⏳     |
| Valor vazio           | `""`                  | `0`       | ⏳     |
| Null/undefined        | `null` ou `undefined` | `0`       | ⏳     |
| Espaços em branco     | `" 100,00 "`          | `100`     | ⏳     |
| Vírgula decimal       | `"100,50"`            | `100.5`   | ⏳     |
| Ponto milhar          | `"1.000,00"`          | `1000`    | ⏳     |

#### 1.2 `formatDate()` - Date Formatting

| Caso              | Input                | Format        | Expected             | Status |
| ----------------- | -------------------- | ------------- | -------------------- | ------ |
| Data PT-BR        | `"2025-01-14"`       | `"full"`      | `"14/01/2025 00:00"` | ⏳     |
| Date only         | `"2025-01-14"`       | `"date-only"` | `"14/01/2025"`       | ⏳     |
| Day only          | `"2025-01-14"`       | `"day-only"`  | `"14"`               | ⏳     |
| Portuguese format | `"14/01/2025 23:59"` | `"full"`      | `"14/01/2025 23:59"` | ⏳     |
| Localized date    | `"janeiro 14, 2025"` | `"full"`      | `"14/01/2025 00:00"` | ⏳     |

#### 1.3 `formatValue()` - Main Dispatcher

| Caso                      | Input                 | Settings                        | Expected              | Status |
| ------------------------- | --------------------- | ------------------------------- | --------------------- | ------ |
| Data + hora               | `"15/09/2025 23:59"`  | `full`                          | `"15/09/2025 23:59"`  | ⏳     |
| Apenas data               | `"15/09/2025"`        | `date-only`                     | `"15/09/2025"`        | ⏳     |
| Valor negativo → positivo | `"-100,00"`           | `showNegativeAsPositive: true`  | `"100,00"`            | ⏳     |
| Valor negativo mantém     | `"-100,00"`           | `showNegativeAsPositive: false` | `"-100,00"`           | ⏳     |
| Descrição (texto)         | `"Transferência PIX"` | `any`                           | `"Transferência PIX"` | ⏳     |

#### 1.4 `isDateValue()` & `isNumericValue()`

| Caso              | Input          | Function           | Expected | Status |
| ----------------- | -------------- | ------------------ | -------- | ------ |
| Data DD/MM/YYYY   | `"15/09/2025"` | `isDateValue()`    | `true`   | ⏳     |
| Data D/M/YYYY     | `"5/9/2025"`   | `isDateValue()`    | `true`   | ⏳     |
| Número inteiro    | `"100"`        | `isNumericValue()` | `true`   | ⏳     |
| Número decimal BR | `"1.250,00"`   | `isNumericValue()` | `true`   | ⏳     |
| Texto             | `"Descrição"`  | `isNumericValue()` | `false`  | ⏳     |

---

### 2. INTEGRATION TESTS - CSV Upload & Parsing

#### 2.1 Caixa Econômica Upload

**File**: `test_caixa.csv` (delimiter: `,`)

```csv
Data,Descrição,Valor
15/01/2025,Saque,-500.00
16/01/2025,Depósito,1000.00
```

| Teste                    | Expected                      | Status |
| ------------------------ | ----------------------------- | ------ |
| File detected como Caixa | `bankId === "caixa"`          | ⏳     |
| Delimiter correto (,)    | Parsed sem erros              | ⏳     |
| Rows: 2                  | `tableData.rows.length === 2` | ⏳     |
| Valor formatado          | "-500,00" / "1.000,00"        | ⏳     |
| Data formatada           | "15/01/2025"                  | ⏳     |

#### 2.2 Inter Upload

**File**: `test_inter.csv` (delimiter: `,`)

```csv
Data,Descrição,Valor
2025-01-15,Transferência,-250.50
2025-01-16,Depósito,500.00
```

| Teste                    | Expected             | Status |
| ------------------------ | -------------------- | ------ |
| File detected como Inter | `bankId === "inter"` | ⏳     |
| Date conversion          | "15/01/2025"         | ⏳     |
| Valor em formato BR      | "-250,50" / "500,00" | ⏳     |

#### 2.3 Itaú Upload

**File**: `test_itau.csv` (delimiter: `,`)

| Teste                   | Expected            | Status |
| ----------------------- | ------------------- | ------ |
| File detected como Itaú | `bankId === "itau"` | ⏳     |
| Parsing correto         | No errors           | ⏳     |

#### 2.4 Bradesco Upload

**File**: `test_bradesco.csv` (delimiter: `,`)

| Teste                       | Expected                | Status |
| --------------------------- | ----------------------- | ------ |
| File detected como Bradesco | `bankId === "bradesco"` | ⏳     |
| Parsing correto             | No errors               | ⏳     |

#### 2.5 OnilX Upload

**File**: `test_onilx.csv` (delimiter: `;`)

| Teste                    | Expected             | Status |
| ------------------------ | -------------------- | ------ |
| File detected como OnilX | `bankId === "onilx"` | ⏳     |
| Delimiter detectado (;)  | Parsed corretamente  | ⏳     |

#### 2.6 Santander Upload ⭐ CRÍTICO

**File**: `test_santander.csv` (delimiter: `;`, com 5 linhas metadata)

```
SANTANDER - EXTRATO AGOSTO 2025
Data de Extração: 14/01/2025
Agência: 1234-5
Conta: 67890-1
Período: 01/08/2025 a 31/08/2025
Data,Descrição,Crédito,Débito
15/08/2025,Depósito,500.00,
16/08/2025,Transferência,,250.50
```

| Teste                        | Expected                           | Status |
| ---------------------------- | ---------------------------------- | ------ |
| File detected como Santander | `bankId === "santander"`           | ⏳     |
| Metadata removida            | 5 linhas skipped                   | ⏳     |
| Crédito/Débito consolidado   | `Valor: 500.00` / `Valor: -250.50` | ⏳     |
| Data formatada               | "15/08/2025"                       | ⏳     |
| Rows: 2                      | Apenas dados (sem header)          | ⏳     |
| Column renamed               | Crédito + Débito → `Valor`         | ⏳     |

---

### 3. FORMATTING TESTS - Dashboard

#### 3.1 Format Panel Controls

| Controle                  | Ação              | Expected                       | Status |
| ------------------------- | ----------------- | ------------------------------ | ------ |
| Date Format: Full         | Radio selecionado | `"15/09/2025 23:59"`           | ⏳     |
| Date Format: Date Only    | Radio selecionado | `"15/09/2025"`                 | ⏳     |
| Date Format: Day Only     | Radio selecionado | `"15"`                         | ⏳     |
| Show Negative as Positive | Checkbox ligado   | `-100` → `100`                 | ⏳     |
| Split by Pos/Neg          | Checkbox ligado   | 2 tabelas: positivos/negativos | ⏳     |

#### 3.2 Formatting Apply

| Dado              | Setting                         | Result             | Status |
| ----------------- | ------------------------------- | ------------------ | ------ |
| Data "15/01/2025" | `date-only`                     | Exibe "15/01/2025" | ⏳     |
| Valor "-500,00"   | `showNegativeAsPositive: true`  | Exibe "500,00"     | ⏳     |
| Valor "-500,00"   | `showNegativeAsPositive: false` | Exibe "-500,00"    | ⏳     |

---

### 4. COMPARISON VIEW TESTS

#### 4.1 Format Panel in Comparison

| Teste                     | Expected                   | Status |
| ------------------------- | -------------------------- | ------ |
| Formatting Panel appears  | Visível na comparison view | ⏳     |
| Date Format changes apply | Tabelas atualizam          | ⏳     |
| Negative values toggle    | Tabelas atualizam          | ⏳     |
| Settings isoladas         | Não afeta dashboard        | ⏳     |

#### 4.2 Consolidated View

| Teste                        | Expected                   | Status |
| ---------------------------- | -------------------------- | ------ |
| Total crédito correto        | Soma dos valores positivos | ⏳     |
| Total débito correto         | Soma dos valores negativos | ⏳     |
| Saldo líquido correto        | Crédito - Débito           | ⏳     |
| Consolidation view renderiza | No errors                  | ⏳     |

---

### 5. EXPORT TESTS

#### 5.1 Copy to Clipboard

| Teste          | Expected                        | Status |
| -------------- | ------------------------------- | ------ |
| Dados copiados | Toast: "Copied to clipboard"    | ⏳     |
| Format mantido | Valores com formatting aplicado | ⏳     |

#### 5.2 Export to CSV

| Teste               | Expected                  | Status |
| ------------------- | ------------------------- | ------ |
| CSV downloaded      | Arquivo downloaded        | ⏳     |
| Headers corretos    | Todas as colunas visíveis | ⏳     |
| Formatting aplicado | Dados formatados no CSV   | ⏳     |
| Delimitador correto | Properly delimited        | ⏳     |

---

### 6. EDGE CASES

#### 6.1 Empty/Invalid Files

| Caso                     | Expected                                | Status |
| ------------------------ | --------------------------------------- | ------ |
| Empty file               | Error: "Arquivo vazio"                  | ⏳     |
| Wrong delimiter          | Error: "Não conseguimos detectar banco" | ⏳     |
| Missing required columns | Error shown                             | ⏳     |
| Only headers             | Error: "Nenhum dado encontrado"         | ⏳     |

#### 6.2 Special Characters & Values

| Caso                  | Input                 | Expected             | Status |
| --------------------- | --------------------- | -------------------- | ------ |
| Acentuação            | `"Transferência PÍX"` | Preserved            | ⏳     |
| Especial chars        | `"R$ -1.000,00"`      | Parsed: `-1000`      | ⏳     |
| Very long description | `"A" * 500`           | Truncated or wrapped | ⏳     |
| Unicode emoji         | `"💰"`                | Handled gracefully   | ⏳     |

#### 6.3 Large Files

| Caso             | Size           | Expected             | Status |
| ---------------- | -------------- | -------------------- | ------ |
| 1000 rows        | ~100KB CSV     | Parsed e renderizado | ⏳     |
| 10000 rows       | ~1MB CSV       | Performance OK?      | ⏳     |
| Multiple uploads | 3x 500KB files | Comparison funciona? | ⏳     |

#### 6.4 Portuguese Date Variants

| Formato   | Input                           | Expected | Status |
| --------- | ------------------------------- | -------- | ------ |
| Completo  | `"janeiro 15, 2025"`            | Parsed   | ⏳     |
| Abreviado | `"jan 15, 2025"`                | Parsed   | ⏳     |
| Com hora  | `"15 de janeiro de 2025 14:30"` | Parsed   | ⏳     |

---

## 🎯 Test Execution Priority

### Tier 1 - CRITICAL (Must Pass)

- [ ] Santander CSV parse com metadata skip
- [ ] Crédito/Débito consolidation para Valor
- [ ] parseValueBR centralizado funciona
- [ ] Build sem erros
- [ ] FormatSettings aplicam corretamente

### Tier 2 - HIGH (Should Pass)

- [ ] Todos 6 bancos fazem upload
- [ ] Formatting Panel em comparison view
- [ ] Export funciona
- [ ] Comparison view renderiza

### Tier 3 - MEDIUM (Nice to Have)

- [ ] Portuguese date parsing
- [ ] Large file handling
- [ ] Edge cases

### Tier 4 - LOW (Future)

- [ ] Performance optimization
- [ ] Advanced filtering
- [ ] Custom templates

---

## 📝 Test Report Template

```
# Test Run: [DATE]
**Tester**: [NAME]
**Build Version**: [VERSION]
**Environment**: [LOCAL/STAGING/PROD]

## Results Summary
- Tier 1: X/Y passed ✅
- Tier 2: X/Y passed ✅
- Tier 3: X/Y passed ⏳
- Total: X/Y passed

## Issues Found
1. [Issue Title]
   - Severity: CRITICAL/HIGH/MEDIUM/LOW
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]
   - Screenshot: [if applicable]

## Sign-off
✅ Ready for production
⚠️ Ready with known issues
❌ Not ready
```

---

## 🚀 Next Steps After Testing

1. **All Tier 1 Pass** → Tier 2
2. **All Tier 1 & 2 Pass** → Candidate for v1.0.1
3. **All Tiers Pass** → Release v1.1
4. **Any CRITICAL failure** → Debug & retest

---

## 📚 Testing Resources

**Test Data Files**: `docs/test-files/`

- `test_caixa.csv`
- `test_inter.csv`
- `test_itau.csv`
- `test_bradesco.csv`
- `test_onilx.csv`
- `test_santander.csv` ⭐

**Browser DevTools**: F12 for console errors
**Network Tab**: Check CSV upload requests
**Application Tab**: Check localStorage for saved data
