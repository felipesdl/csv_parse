# Bank Reference Naming Convention - Implementação

## 📋 Resumo

Implementado sistema unificado de nomenclatura para referências de extratos bancários em toda a aplicação. Agora todos os extratos usam o formato: **"Banco Nome - Mês Abreviado Ano"** (ex: "Banco Inter - Set. 2025")

## 🔧 Mudanças Realizadas

### 1. **Função Utilitária - `referenceFormatter.ts`**

- Localização: `src/utils/referenceFormatter.ts`
- Funções:
  - `formatBankReference(bankId, month)` - Formata com banco e mês
  - `formatMonthOnly(month)` - Apenas o mês formatado
- Suporta formato "YYYY-MM" convertendo para "Mês Abreviado YYYY"

### 2. **Extensão de Tipos**

- `src/types/index.ts` - Adicionado `month?: string` em `ComparedFile`
- `src/store/comparisonStore.ts` - Mesmo tipo atualizado

### 3. **Dashboard Principal (DataTable.tsx)**

- ✅ Label "Banco" e "Período" combinados em "Referência"
- ✅ Exibe: "Banco Inter - Set. 2025"
- ✅ Arquivo exportado renomeado: "Banco*Inter*-_Set.\_2025_[timestamp].csv"

### 4. **Upload de Comparação (ComparisonCSVUploader.tsx)**

- ✅ Agora salva o `month` do arquivo na estrutura `ComparedFile`
- ✅ Preserva mês extraído do CSV para referência posterior

### 5. **Componentes de Comparação Atualizados**

- **ColumnMapper.tsx**: Exibe "Banco Nome - Mês" ao mapear colunas
- **CompleteDataView.tsx**: Coluna "Banco" mostra referência completa
- **ComparativeAnalysis.tsx**: Gráficos usam nome completo
- **ExtractTablesView.tsx**: Tabelas exibem referência completa
- **ConsolidationView.tsx**: Consolidação com referência completa

## 📝 Exemplo de Uso

### Antes (sem referência):

```
Banco: Inter
Período: 2025-09
```

### Depois (com referência):

```
Referência: Banco Inter - Set. 2025
```

## 💾 Formato do Mês

| Número | Mês       | Formato   |
| ------ | --------- | --------- |
| 01     | Janeiro   | Jan. YYYY |
| 02     | Fevereiro | Fev. YYYY |
| 09     | Setembro  | Set. YYYY |
| 12     | Dezembro  | Dez. YYYY |

## 🎯 Benefícios

✅ **Unificação**: Mesmo formato em todo o sistema
✅ **Clareza**: Nome do banco + período em uma única string
✅ **Compatibilidade**: Funciona em comparação de arquivos
✅ **Exportação**: Nomes de arquivos mais descritivos
✅ **Manutenibilidade**: Função centralizada para mudanças futuras

## 🔍 Arquivos Afetados

```
src/
├── utils/
│   └── referenceFormatter.ts          [NOVO]
├── types/
│   └── index.ts                       [EDITADO]
├── store/
│   └── comparisonStore.ts             [EDITADO]
├── components/
│   ├── layout/
│   │   └── DataTable.tsx              [EDITADO]
│   ├── upload/
│   │   └── ComparisonCSVUploader.tsx  [EDITADO]
│   └── comparison/
│       ├── ColumnMapper.tsx           [EDITADO]
│       ├── CompleteDataView.tsx       [EDITADO]
│       ├── ComparativeAnalysis.tsx    [EDITADO]
│       ├── ExtractTablesView.tsx      [EDITADO]
│       └── ConsolidationView.tsx      [EDITADO]
```

## 🚀 Próximos Passos (Opcional)

- Adicionar suporte a períodos customizados (se necessário)
- Implementar formato de período em outras idiomas
- Adicionar teste unitário para `referenceFormatter`
- Considerar cache da formatação se performance for um problema
