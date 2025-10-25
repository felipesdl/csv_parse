# 🚀 Guia de Desenvolvimento Futuro

## MongoDB Integration

### 1. Setup

```bash
yarn add mongoose
```

### 2. Criar Schema

```typescript
// src/lib/db/models/Import.ts
import mongoose from "mongoose";

const importSchema = new mongoose.Schema({
  userId: String,
  bankName: String,
  month: String,
  data: Array,
  columnSettings: Array,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Import = mongoose.model("Import", importSchema);
```

### 3. API Routes

```typescript
// src/app/api/imports/route.ts
import { Import } from "@/lib/db/models/Import";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const import_ = new Import(data);
  await import_.save();
  return NextResponse.json(import_);
}

export async function GET(req: NextRequest) {
  const imports = await Import.find({});
  return NextResponse.json(imports);
}
```

### 4. Atualizar Store

```typescript
// Adicionar ao useDataStore
saveToServer: async () => {
  const state = get();
  if (state.tableData) {
    const response = await fetch('/api/imports', {
      method: 'POST',
      body: JSON.stringify({
        tableData: state.tableData,
        columnSettings: state.columnSettings,
      }),
    });
    return response.json();
  }
},

loadFromServer: async (importId: string) => {
  const response = await fetch(`/api/imports/${importId}`);
  const data = await response.json();
  set({ tableData: data.tableData, columnSettings: data.columnSettings });
},
```

## Autenticação

### 1. Usar NextAuth

```bash
yarn add next-auth
```

### 2. Configurar Session

```typescript
// src/lib/auth.ts
export const authOptions = {
  providers: [
    // Adicionar provedores (GitHub, Google, etc)
  ],
};
```

### 3. Proteger API Routes

```typescript
// src/app/api/imports/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  // ... resto do código
}
```

## Gráficos e Analytics

### 1. Instalar Recharts

```bash
yarn add recharts
```

### 2. Criar Componentes de Gráfico

```typescript
// src/components/Charts/
// - TotalBancoChart.tsx
// - TransactionTypeChart.tsx
// - MonthlyTrendChart.tsx
```

### 3. Adicionar Dados

```typescript
export function generateChartData(rows: ParsedRow[], valueColumn: string) {
  // Processamento de dados
  return formattedData;
}
```

## Validação Customizável

### 1. Criar Sistema de Regras

```typescript
// src/lib/validation/rules.ts
export interface ValidationRule {
  name: string;
  field: string;
  type: "required" | "number" | "date" | "custom";
  message: string;
}

export const DEFAULT_RULES: ValidationRule[] = [
  {
    name: "dataRequired",
    field: "Data",
    type: "required",
    message: "Data é obrigatória",
  },
];
```

### 2. Aplicar Validações

```typescript
export function validateRows(rows: ParsedRow[], rules: ValidationRule[]) {
  const errors: ValidationError[] = [];
  rows.forEach((row, idx) => {
    rules.forEach((rule) => {
      if (rule.type === "required" && !row[rule.field]) {
        errors.push({
          rowIndex: idx,
          field: rule.field,
          message: rule.message,
        });
      }
    });
  });
  return errors;
}
```

## Agendamento de Imports

### 1. Usar Node-Cron

```bash
yarn add node-cron
```

### 2. Criar Job

```typescript
// src/lib/jobs/scheduledImports.ts
import cron from "node-cron";

export function startScheduledImports() {
  // Toda segunda-feira às 9h
  cron.schedule("0 9 * * 1", async () => {
    console.log("Executando import agendado");
    // Lógica de import
  });
}
```

## Dark Mode

### 1. Adicionar Suporte Tailwind

```typescript
// tailwind.config.ts
export default {
  darkMode: "class",
  theme: {
    extend: {},
  },
};
```

### 2. Criar Provider

```typescript
// src/components/ThemeProvider.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("light");

  return <div className={theme}>{children}</div>;
}
```

## Export para Excel

### 1. Instalar ExcelJS

```bash
yarn add exceljs
```

### 2. Criar Função

```typescript
// src/lib/exportUtils.ts
export async function exportToExcel(rows: ParsedRow[], columns: string[], filename: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Dados");

  // Adicionar headers
  worksheet.addRow(columns);

  // Adicionar dados
  rows.forEach((row) => {
    worksheet.addRow(columns.map((col) => row[col]));
  });

  // Download
  await workbook.xlsx.writeFile(filename);
}
```

## Testes Automatizados

### 1. Setup Jest

```bash
yarn add -D jest @testing-library/react
```

### 2. Testes de Parser

```typescript
// __tests__/lib/csvParser.test.ts
describe("CSV Parser", () => {
  it("deve fazer parse de CSV com semicolon", async () => {
    const file = new File(["Data;Valor\n01/01/2025;100"], "test.csv");
    const result = await parseCSV(file, ";");
    expect(result.rows.length).toBe(1);
  });
});
```

### 3. Testes de Componentes

```typescript
// __tests__/components/DataTable.test.tsx
describe("DataTable", () => {
  it("deve ordenar dados ao clicar no header", () => {
    render(<DataTable />);
    const header = screen.getByText("Data");
    fireEvent.click(header);
    // assertions
  });
});
```

## CI/CD

### 1. GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: yarn build
      - run: yarn test
```

## Deploy

### 1. Vercel

```bash
vercel
```

### 2. Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
CMD ["yarn", "start"]
```

## Performance

### 1. Otimizações

- [ ] Lazy load de componentes
- [ ] Memoização com useMemo
- [ ] Virtual scrolling para grandes datasets
- [ ] Web workers para parsing

### 2. Monitoring

```bash
yarn add -D @sentry/nextjs
```

## Segurança

### 1. Rate Limiting

```bash
yarn add express-rate-limit
```

### 2. Validação de CORS

```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.ALLOWED_ORIGINS || "*",
          },
        ],
      },
    ];
  },
};
```

## Roadmap Priorizado

### Fase 1 (Próximas 2 semanas)

- [ ] Integração MongoDB
- [ ] Autenticação básica
- [ ] Histórico de imports

### Fase 2 (Mês seguinte)

- [ ] Gráficos básicos
- [ ] Dark mode
- [ ] Mais bancos

### Fase 3 (Trimestre)

- [ ] Export Excel
- [ ] Validação customizável
- [ ] Testes automatizados

### Fase 4 (Futuro)

- [ ] Agendamento
- [ ] Mobile app
- [ ] Integrações externas

---

**Last Updated:** Outubro 2025
**Version:** 0.1.0
