# Suporte ao Banco Santander - Implementação

## 📋 Resumo

Adicionado suporte completo para extratos do Banco Santander com tratamento especial para débito/crédito em colunas separadas, consolidadas automaticamente em uma coluna "Valor" única.

## 🏦 Características do Santander

- **Delimitador**: Ponto e vírgula (`;`)
- **Estrutura de Débito/Crédito**: Colunas separadas
  - `Crédito (R$)` - valores positivos
  - `Débito (R$)` - valores negativos
- **Cabeçalho**: 5 linhas de metadados (empresa, conta, período)
- **Colunas esperadas**: Data, Descrição, Crédito (R$), Débito (R$)

## 🔧 Mudanças Realizadas

### 1. **Extensão do BankTemplate** (types/index.ts)

Adicionados campos opcionais:

- `creditColumn?: string` - Nome da coluna de créditos
- `debitColumn?: string` - Nome da coluna de débitos
- `skipHeaderRows?: number` - Número de linhas de cabeçalho a pular

### 2. **Template Santander Configurado** (bankTemplates.ts)

```typescript
santander: {
  id: "santander",
  name: "Santander",
  delimiter: ";",
  expectedColumns: ["Data", "Descrição", "Crédito (R$)", "Débito (R$)"],
  dateColumn: "Data",
  descriptionColumn: "Descrição",
  valueColumn: "Valor", // Gerado automaticamente
  creditColumn: "Crédito (R$)",
  debitColumn: "Débito (R$)",
  skipHeaderRows: 5,
}
```

### 3. **Parser Aprimorado** (csvParser.ts)

#### Consolidação de Débito/Crédito

- ✅ Detecta se o banco tem `creditColumn` e `debitColumn`
- ✅ Converte valores brasileiros (1.000,00 → 1000.00)
- ✅ Crédito positivo, Débito negativo
- ✅ Cria coluna "Valor" com valores consolidados
- ✅ Remove as colunas originais de débito/crédito

#### Validação Personalizada

- ✅ Para Santander: valida as 4 colunas principais
- ✅ Para outros bancos: mantém validação padrão
- ✅ Mensagens de erro claras e específicas

### 4. **Detecção Melhorada** (bankTemplates.ts)

Adicionadas keywords específicas:

- "crédito (r$)", "débito (r$)" - estrutura Santander
- "conta corrente", "agencia de marketing" - contexto Santander

## 📊 Fluxo de Processamento

```
Arquivo CSV (Santander)
    ↓
Parse com delimiter ";"
    ↓
Remove 5 linhas de cabeçalho
    ↓
Lê colunas: Data, Descrição, Crédito, Débito
    ↓
Para cada linha:
  - Credito > 0 → Valor = +Credito
  - Debito > 0 → Valor = -Debito
    ↓
Resultado: [Data, Descrição, Valor]
```

## 📝 Exemplo de Transformação

**Entrada (Santander CSV):**

```
Data                | Descrição              | Crédito (R$) | Débito (R$)
Quarta, 24/09/2025  | PREST. EMPREST         | 0,00         | 557,78
Terça, 23/09/2025   | TARIFA MANUTENCAO      | 0,00         | 2,00
Quinta, 11/09/2025  | PIX RECEBIDO           | 5.000,00     | 0,00
```

**Saída (Consolidada):**

```
Data                | Descrição              | Valor
Quarta, 24/09/2025  | PREST. EMPREST         | -557,78
Terça, 23/09/2025   | TARIFA MANUTENCAO      | -2,00
Quinta, 11/09/2025  | PIX RECEBIDO           | 5000,00
```

## 🎯 Funcionamento no Dashboard

1. **Upload**: Usuário seleciona arquivo Santander
2. **Seleção**: Marca como "Santander" no modal
3. **Parse**: Sistema converte Crédito/Débito → Valor
4. **Exibição**: Tabelas mostram formato unificado com "Valor"
5. **Operações**:
   - ✅ Cópia de dados
   - ✅ Exportação CSV
   - ✅ Filtros e sorting
   - ✅ Comparação com outros bancos

## 🔀 Compatibilidade com Comparação

Ao comparar Santander com outros bancos (Inter, Caixa, etc):

- ✅ Todas as tabelas mostram coluna "Valor" unificada
- ✅ Mapeamento de colunas funciona normalmente
- ✅ Referência: "Banco Santander - Set. 2025"

## 🚀 Próximos Passos (Opcional)

- Adicionar suporte a outros bancos com débito/crédito separados
- Implementar lógica para detectar melhor o número de linhas de cabeçalho
- Adicionar teste com mais extratos Santander
- Documentar estrutura para outros bancos brasileiros

## 📁 Arquivos Modificados

```
src/
├── types/index.ts                    [EDITADO] - BankTemplate estendido
├── lib/
│   ├── bankTemplates.ts              [EDITADO] - Template Santander + keywords
│   └── csvParser.ts                  [EDITADO] - Consolidação Débito/Crédito
└── components/upload/
    └── ComparisonCSVUploader.tsx     [JÁ FUNCIONANDO] - Preserva mês
```

## ✅ Validação

- ✅ Nenhum erro TypeScript
- ✅ Estrutura coerente com outros bancos
- ✅ Conversão de valores robusta
- ✅ Preservação de mês para referência
- ✅ Compatível com comparação de múltiplos bancos
