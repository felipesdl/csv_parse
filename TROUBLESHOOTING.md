# 🔧 Troubleshooting & FAQ

## ❓ Perguntas Frequentes

### P: Como faço para testar a aplicação?

**R:** Siga estes passos:

1. `yarn dev` para iniciar o servidor
2. Abra http://localhost:3000
3. Arraste um arquivo CSV
4. Use `teste_caixa.csv` para um teste rápido

### P: Qual arquivo CSV devo usar para testar?

**R:** Você tem três opções:

1. `teste_caixa.csv` - Simples, 16 linhas
2. `teste_caixa_com_duplicatas.csv` - Com duplicatas
3. `061000273753_15_02102025_073825.csv` - Seu arquivo real

### P: Onde estão meus dados salvos?

**R:** Em `localStorage` do navegador:

- Abra DevTools (F12)
- Vá para "Application" → "Local Storage"
- Procure por `cafe_dashboard_table_data`

### P: Como exportar dados?

**R:** Dois jeitos:

1. **Copiar**: Clique "Copiar" → Cola em Excel/Sheets
2. **CSV**: Clique "Exportar CSV" → Faz download

### P: Como deletar todos os dados?

**R:** Clique em "Limpar Dados" → Confirme → Tudo apagado

### P: Posso usar meu próprio formato de CSV?

**R:** Sim! Siga os passos em `DESENVOLVIMENTO_FUTURO.md` na seção "Adicionar Novo Banco"

## 🐛 Problemas Comuns & Soluções

### ❌ Erro: "CSV vazio ou inválido"

**Causa:** Arquivo não tem dados ou formato errado
**Solução:**

```
1. Verifique se o arquivo tem dados reais
2. Tente com teste_caixa.csv
3. Certifique-se que é um arquivo .csv válido
```

### ❌ Erro: "Colunas esperadas não encontradas"

**Causa:** Formato de arquivo diferente do esperado
**Solução:**

```
1. Ao aparecer o diálogo, selecione o banco manualmente
2. Confirme o mês
3. Sistema adaptará automaticamente
```

### ❌ Erro: "Dados não persistem ao recarregar"

**Causa:** Não clicou "Salvar Localmente"
**Solução:**

```
1. Faça as mudanças desejadas
2. Clique "Salvar Localmente"
3. Agora recarregue (F5)
4. Dados estarão lá
```

### ❌ Tabela não aparece após upload

**Causa:** Validação falhou silenciosamente
**Solução:**

```
1. Abra DevTools (F12) → Console
2. Procure por mensagens de erro
3. Consulte os logs no terminal
4. Use um arquivo de teste simples
```

### ❌ Cópia para clipboard não funciona

**Causa:** Navegador não suporta Clipboard API
**Solução:**

```
1. Use um navegador moderno (Chrome, Firefox, Safari, Edge)
2. Tente exportar como CSV ao invés
3. Ou use copy manual (Ctrl+A, Ctrl+C)
```

### ❌ Banco não detectado automaticamente

**Causa:** Arquivo de um banco não suportado
**Solução:**

```
1. Selecione manualmente o banco no diálogo
2. Digite o mês (opcional)
3. Confira em FUNCIONALIDADES.md bancos suportados
```

### ❌ Página branca, nada aparece

**Causa:** Erro de compilação ou servidor não iniciado
**Solução:**

```
1. Abra terminal
2. Rode yarn dev
3. Aguarde "Ready" aparecer
4. Recarregue a página
5. Se persistir, verifique Node.js versão
```

### ❌ Lentidão com muitos dados

**Causa:** Tabela com 1000+ linhas
**Solução:**

```
1. Use o filtro para reduzir linhas visíveis
2. Selecione apenas colunas necessárias
3. Divida em múltiplos arquivos
4. Relatório de performance: Consulte DESENVOLVIMENTO_FUTURO.md
```

### ❌ localStorage está cheio

**Causa:** Muitos dados salvos
**Solução:**

```
1. Clique "Limpar Dados"
2. Ou delete manualmente no DevTools
3. localStorage.removeItem('cafe_dashboard_table_data')
```

### ❌ Duplicatas não aparecem destacadas

**Causa:** Linhas não são idênticas pixel-a-pixel
**Solução:**

```
1. Duplicatas só marcam se 100% iguais
2. Espaços em branco contam
3. Verifique manualmente dados similares
```

## 🔍 Debug & Logging

### Habilitar console logs

```typescript
// Em qualquer componente
console.log("Debug:", tableData);
console.log("Store:", useDataStore.getState());
```

### Verificar localStorage

```javascript
// No console do navegador
JSON.parse(localStorage.getItem("cafe_dashboard_table_data"));
```

### Ver estado Zustand

```javascript
// No console
import { useDataStore } from "@/store/dataStore";
useDataStore.getState();
```

## 🚀 Performance

### Se estiver lento:

```
1. Desabra extensões do navegador
2. Limpe cache (Ctrl+Shift+Delete)
3. Use modo incógnito
4. Teste em outro navegador
5. Verifique RAM/CPU disponível
```

### Se estiver muito lento:

```
1. Divida arquivo em partes menores
2. Use filtro para reduzir dados visíveis
3. Exporte apenas colunas necessárias
4. Considere usar Virtual Scrolling (Future)
```

## 🔐 Segurança

### Dados são seguros?

**Sim:**

- Tudo é processado no navegador
- Nenhum dado é enviado externamente
- localStorage é local do seu navegador
- Nenhum rastreamento

### Devo me preocupar?

**Não:**

- Dados bancários não saem do seu computador
- localStorage é isolado por domínio
- Outros sites não acessam seus dados
- Funciona offline também

## 📱 Mobile

### Em celular/tablet?

```
1. Aplicação é responsiva
2. Touch funciona em checkboxes
3. Scroll horizontal automático se necessário
4. Testem em iPhone, Android, iPad
```

### Não funciona em mobile?

```
1. Verifique navegador (use Chrome/Safari/Edge)
2. Limpe cache
3. Permita JavaScript
4. localStorage pode estar desabilitado
```

## 🌐 Navegadores Suportados

| Navegador | Versão | Suporte |
| --------- | ------ | ------- |
| Chrome    | 90+    | ✅ Full |
| Firefox   | 88+    | ✅ Full |
| Safari    | 14+    | ✅ Full |
| Edge      | 90+    | ✅ Full |
| Opera     | 76+    | ✅ Full |
| IE 11     | -      | ❌ Não  |

## 🔄 Build & Deploy

### Build para produção

```bash
yarn build
yarn start
```

### Verificar build

```bash
# Sem erros?
yarn build

# Tudo OK?
yarn start
# E teste em http://localhost:3000
```

### Deploy para Vercel

```bash
# Instale Vercel CLI
yarn add -g vercel

# Deploy
vercel

# Seguir instruções
```

## 📝 Logs Úteis

### Terminal durante yarn dev

```
✓ Ready in XXXms = Sucesso
Error during compilation = Problema TypeScript
GET / 200 = Página carregou
GET / 500 = Erro no servidor
```

### Console do Navegador (F12)

```
Sem erros = Bom sinal
Erro vermelho = Problema
Warning amarelo = Avisos (geralmente OK)
```

## 🆘 Preciso de Mais Ajuda?

### Verifique:

1. **README.md** - Começar
2. **FUNCIONALIDADES.md** - Como funciona
3. **GUIA_TESTE.md** - Validar tudo
4. **SUMARIO_IMPLEMENTACAO.md** - Técnico

### Código-fonte:

1. Componentes bem estruturados
2. Comentários explicativos
3. Tipos TypeScript claros
4. Funções bem nomeadas

### Se não encontrar a solução:

1. Verifique DevTools Console (F12)
2. Procure a mensagem de erro aqui
3. Revise código fonte relevante
4. Consulte documentação oficial das libraries

## 🎓 Aprender Mais

### Sobre tecnologias usadas:

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TanStack Table](https://tanstack.com/table)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)

### Exemplos de uso:

- Ver componentes em `/src/components`
- Ver lógica em `/src/lib`
- Ver tipos em `/src/types`

## 📞 Contato

Se encontrar bugs ou tiver sugestões:

1. Verifique GUIA_TESTE.md
2. Confirme que é reproduzível
3. Documente os passos
4. Consulte arquivos de documentação

---

**Última atualização:** Outubro 2025
**Versão:** 0.1.0
