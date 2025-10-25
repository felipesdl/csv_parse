# 🏗️ Café Dashboard - Importador de CSV Bancário# 🏗️ Café Dashboard - Importador de CSV BancárioThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Um dashboard moderno e intuitivo para importação, manipulação e exportação de dados bancários em formato CSV com **filtros avançados por coluna** (v0.2.0).Um dashboard moderno e intuitivo para importação, manipulação e exportação de dados bancários em formato CSV.## Getting Started

## 🌟 Características Principais## 🌟 Características PrincipaisFirst, run the development server:

### ✨ Upload Inteligente### ✨ Upload Inteligente```bash

- 🎯 Detecção automática de banco (Caixa, Itaú, Bradesco, Santander)- 🎯 Detecção automática de banco (Caixa, Itaú, Bradesco, Santander)npm run dev

- 📤 Suporte a drag & drop e clique

- 🏦 Seleção manual de banco com fallback- 📤 Suporte a drag & drop e clique# or

- 📅 Detecção automática de mês/ano

- 🏦 Seleção manual de banco com fallbackyarn dev

### 📊 Tabela Interativa Poderosa

- 📅 Detecção automática de mês/ano# or

- ⬆️⬇️ Ordenação por qualquer coluna

- 🔍 Filtro global em tempo realpnpm dev

- 🎯 **Filtros avançados por coluna (NOVO!)**

  - 📝 Filtro de texto (busca por substring)### 📊 Tabela Interativa Poderosa# or

  - 🔢 Filtro numérico (valor exato)

  - ✓ Filtro seleção (múltiplos valores)- ⬆️⬇️ Ordenação por qualquer colunabun dev

  - 🚀 Detecção automática de tipo de coluna

- ✅ Seleção múltipla de linhas- 🔍 Filtro global em tempo real```

- 👁️ Mostrar/ocultar colunas

- 🚨 Detecção automática de duplicatas- ✅ Seleção múltipla de linhas

- 🗑️ Deletar linhas individuais ou em lote

- 👁️ Mostrar/ocultar colunasOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 💾 Persistência

- 🚨 Detecção automática de duplicatas

- 💿 Salvamento em localStorage

- 🔄 Carregamento automático ao recarregar- 🗑️ Deletar linhas individuais ou em loteYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- 🧹 Limpeza fácil de dados

### 💾 PersistênciaThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### 📤 Export/Cópia

- 💿 Salvamento em localStorage

- 📋 Copiar para clipboard (formato tabular)

- 📥 Exportar como CSV com delimitador correto- 🔄 Carregamento automático ao recarregar## Learn More

- 🎯 Suporta seleção parcial

- ✨ **Respeita filtros avançados aplicados (NOVO!)**- 🧹 Limpeza fácil de dados

## 🚀 Quick StartTo learn more about Next.js, take a look at the following resources:

### 1. Instalação### 📤 Export/Cópia

````bash- 📋 Copiar para clipboard (formato tabular)- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

# Navegar até o projeto

cd cafe_dashboard- 📥 Exportar como CSV com delimitador correto- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



# Instalar dependências- 🎯 Suporta seleção parcial

yarn install

```You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



### 2. Executar## 🚀 Quick Start



```bash## Deploy on Vercel

yarn dev

```### 1. Instalação



Abra [http://localhost:3000](http://localhost:3000) no navegador.The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



### 3. Usar```bash



1. **Upload**: Arraste um arquivo CSV bancário ou clique para selecionar# Navegar até o projetoCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

2. **Filtros**: Clique em "Filtros Avançados" para filtrar por coluna

3. **Manipular**: Use a tabela para ordenar, selecionar dados filtradoscd cafe_dashboard

4. **Exportar**: Copie para clipboard ou exporte como CSV (com filtros aplicados)

5. **Salvar**: Clique em "Salvar Localmente" para persistir# Instalar dependências

yarn install

## 📁 Estrutura do Projeto```



```### 2. Executar

src/

├── app/```bash

│   ├── layout.tsx          # Layout raizyarn dev

│   ├── page.tsx            # Página principal```

│   └── globals.css         # Estilos globais

├── components/Abra [http://localhost:3000](http://localhost:3000) no navegador.

│   ├── CSVUploader.tsx      # Componente de upload

│   ├── DataTable.tsx        # Tabela interativa com filtros### 3. Usar

│   ├── ErrorAlert.tsx       # Alertas de erro

│   ├── ImporterDashboard.tsx # Componente raiz1. **Upload**: Arraste um arquivo CSV bancário ou clique para selecionar

│   └── index.ts            # Exportações2. **Manipular**: Use a tabela para ordenar, filtrar, selecionar dados

├── lib/3. **Exportar**: Copie para clipboard ou exporte como CSV

│   ├── bankTemplates.ts    # Configuração de bancos4. **Salvar**: Clique em "Salvar Localmente" para persistir

│   ├── csvParser.ts        # Parser e validação

│   └── exportUtils.ts      # Utilitários de export## 📁 Estrutura do Projeto

├── store/

│   └── dataStore.ts        # Store Zustand```

└── types/src/

    └── index.ts            # Tipos TypeScript├── app/

```│   ├── layout.tsx          # Layout raiz

│   ├── page.tsx            # Página principal

## 🛠️ Tecnologias│   └── globals.css         # Estilos globais

├── components/

| Tecnologia         | Versão  | Propósito        |│   ├── CSVUploader.tsx      # Componente de upload

| ------------------ | ------- | ---------------- |│   ├── DataTable.tsx        # Tabela interativa

| **Next.js**        | 16.0.0  | Framework React  |│   ├── ErrorAlert.tsx       # Alertas de erro

| **React**          | 19.2.0  | Biblioteca UI    |│   ├── ImporterDashboard.tsx # Componente raiz

| **TypeScript**     | ^5      | Type safety      |│   └── index.ts            # Exportações

| **Tailwind CSS**   | ^4      | Styling          |├── lib/

| **TanStack Table** | 8.21.3  | Tabela avançada  |│   ├── bankTemplates.ts    # Configuração de bancos

| **Zustand**        | 5.0.8   | State management |│   ├── csvParser.ts        # Parser e validação

| **PapaParse**      | 5.5.3   | Parser CSV       |│   └── exportUtils.ts      # Utilitários de export

| **Lucide React**   | 0.548.0 | Ícones           |├── store/

│   └── dataStore.ts        # Store Zustand

## 📋 Bancos Suportados└── types/

    └── index.ts            # Tipos TypeScript

### Caixa Econômica ✅```



- Delimitador: `;`## 🛠️ Tecnologias

- Auto-detecção: Sim

- Colunas: Data, Descrição, Valor, Tipo de transação, Referência, Lançamento futuro| Tecnologia         | Versão  | Propósito        |

| ------------------ | ------- | ---------------- |

### Itaú ✅| **Next.js**        | 16.0.0  | Framework React  |

| **React**          | 19.2.0  | Biblioteca UI    |

- Delimitador: `,`| **TypeScript**     | ^5      | Type safety      |

- Auto-detecção: Sim| **Tailwind CSS**   | ^4      | Styling          |

- Colunas mínimas: Data, Descrição, Valor| **TanStack Table** | 8.21.3  | Tabela avançada  |

| **Zustand**        | 5.0.8   | State management |

### Bradesco ✅| **PapaParse**      | 5.5.3   | Parser CSV       |

| **Lucide React**   | 0.548.0 | Ícones           |

- Delimitador: `,`

- Auto-detecção: Sim## 📋 Bancos Suportados

- Colunas mínimas: Data, Descrição, Valor

### Caixa Econômica ✅

### Santander ✅

- Delimitador: `;`

- Delimitador: `,`- Auto-detecção: Sim

- Auto-detecção: Sim- Colunas: Data, Descrição, Valor, Tipo de transação, Referência, Lançamento futuro

- Colunas mínimas: Data, Descrição, Valor

### Itaú ✅

## 🎯 Filtros Avançados (Novo!)

- Delimitador: `,`

Os filtros avançados permitem separar e filtrar dados por qualquer coluna, baseado nas headers específicas de cada arquivo:- Auto-detecção: Sim

- Colunas mínimas: Data, Descrição, Valor

### Tipos de Filtro

### Bradesco ✅

**1. Filtro de Texto**

- Aplica-se a colunas de texto (ex: Descrição)- Delimitador: `,`

- Busca por substring (contém)- Auto-detecção: Sim

- Exemplo: Filtrar "PIX" em Descrição- Colunas mínimas: Data, Descrição, Valor



**2. Filtro Seleção (Multi-valor)**### Santander ✅

- Aplica-se a colunas com valores discretos

- Mostra todos os valores únicos (máx. 20)- Delimitador: `,`

- Exemplo: Selecionar apenas "DÉBITO" ou "CRÉDITO"- Auto-detecção: Sim

- Colunas mínimas: Data, Descrição, Valor

**3. Filtro Numérico**

- Aplica-se a colunas numéricas## 🧪 Testing

- Filtra por valor exato

- Exemplo: Apenas transações de 1000.50Consulte [GUIA_TESTE.md](./GUIA_TESTE.md) para:



### Exemplos de Uso- ✅ Checklist completo de testes

- 📋 Casos de uso

```- 🔍 Validação de erros

Arquivo com: Data | Descrição | Valor | Tipo de transação- 📊 Testes de responsividade



Caso 1: Apenas débitos### Arquivos de Teste

→ Filtros Avançados > Tipo de transação > Selecione "DÉBITO"

```bash

Caso 2: Apenas valores positivos# Teste básico (16 linhas)

→ Filtros Avançados > Valor > Digite "1000"teste_caixa.csv



Caso 3: Combinação# Teste com duplicatas

→ Ativar ambos os filtros simultaneamenteteste_caixa_com_duplicatas.csv

````

# Arquivo real do banco (100+ linhas)

## 🧪 Testing061000273753_15_02102025_073825.csv

````

Consulte [GUIA_TESTE.md](./GUIA_TESTE.md) para:

## 💾 LocalStorage

- ✅ Checklist completo de testes (60+ casos)

- 📋 Testes de filtros avançados (15+ casos específicos)Os dados são armazenados em `localStorage` sob a chave: `cafe_dashboard_table_data`

- 🔍 Validação de erros

- 📊 Testes de responsividade## 🚧 Roadmap



### Arquivos de Teste- [ ] Integração com MongoDB

- [ ] Autenticação de usuários

```bash- [ ] Mais templates de bancos

# Teste básico (16 linhas)- [ ] Histórico de importações

teste_caixa.csv- [ ] Gráficos e analytics



# Teste com duplicatas## 📝 Documentação

teste_caixa_com_duplicatas.csv

- **[FUNCIONALIDADES.md](./FUNCIONALIDADES.md)** - Documentação detalhada de funcionalidades

# Arquivo real do banco (100+ linhas)- **[GUIA_TESTE.md](./GUIA_TESTE.md)** - Guia completo de testes

061000273753_15_02102025_073825.csv

```---



## 💾 LocalStorage**Versão:** 0.1.0 | **Atualizado:** Outubro de 2025


Os dados são armazenados em `localStorage` sob a chave: `cafe_dashboard_table_data`

Acesse no DevTools:

```javascript
JSON.parse(localStorage.getItem("cafe_dashboard_table_data"));
````

## 📚 Documentação

- **[FUNCIONALIDADES.md](./FUNCIONALIDADES.md)** - Documentação detalhada de funcionalidades incluindo filtros
- **[GUIA_TESTE.md](./GUIA_TESTE.md)** - Guia completo de testes (60+ testes)
- **[ESTRUTURA_PROJETO.md](./ESTRUTURA_PROJETO.md)** - Arquitetura técnica e sistema de filtros
- **[SUMARIO_IMPLEMENTACAO.md](./SUMARIO_IMPLEMENTACAO.md)** - Resumo técnico
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - FAQ e debugging

## 🚧 Roadmap

- [ ] Integração com MongoDB
- [ ] Autenticação de usuários
- [ ] Mais templates de bancos
- [ ] Histórico de importações
- [ ] Gráficos e analytics
- [ ] Filtros salvos como presets

## 📊 Changelog

### v0.2.0 (Atual)

- ✅ **Filtros avançados por coluna (novo!)**
- ✅ Suporte a 3 tipos de filtro (texto, seleção, numérico)
- ✅ Detecção automática de tipo de coluna
- ✅ Múltiplos filtros simultâneos
- ✅ Filtros respeitados em export e cópia
- ✅ Cores de texto mais escuras para melhor legibilidade
- ✅ UI de controles aprimorada

### v0.1.0 (Anterior)

- ✅ Upload de CSV com detecção de banco
- ✅ Tabela interativa com sorting e filtro global
- ✅ Detecção de duplicatas
- ✅ Export como CSV e cópia para clipboard
- ✅ localStorage para persistência
- ✅ Interface responsiva com Tailwind CSS

---

**Versão:** 0.2.0 | **Atualizado:** Outubro de 2025 | **Status:** ✅ Completo e Testado
