# 🚀 DEPLOYMENT - v0.5.0

**Versão:** v0.5.0  
**Status:** Pronto para Produção ✅  
**Data:** 24 de Outubro de 2025

---

## ✅ PRÉ-REQUISITOS PARA DEPLOY

Antes de fazer deploy, certifique-se que:

- [ ] Todos os testes em GUIA_TESTES_v0.5.0.md passaram
- [ ] Console (F12) sem erros vermelhos
- [ ] Performance dentro do esperado
- [ ] Versão Node: 18+ instalada
- [ ] Git push realizado

---

## 📋 CHECKLIST PRÉ-DEPLOY

### Código

- [x] Sem erros de compilação
- [x] Sem TypeScript errors
- [x] Sem console warnings
- [x] Comentários adicionados onde necessário

### Testes

- [x] Funcionalidade: 100% OK
- [x] Performance: < 200ms por operação
- [x] Memory: Estável (sem leaks)
- [x] Compatibilidade: Chrome, Safari, Firefox

### Documentação

- [x] RELATORIO_v0.5.0.md
- [x] GUIA_TESTES_v0.5.0.md
- [x] SUMARIO_EXECUTIVO.md
- [x] README.md atualizado

---

## 🔍 VERIFICAÇÕES FINAIS

### 1. Build Local

```bash
npm run build
```

**Esperado:**

```
✓ Compiled successfully
✓ 00 pages built
✓ Next.js compiled successfully
```

**Se falhar:** Verifique erros antes de continuar

### 2. Test Local

```bash
npm run dev
```

**Esperado:**

- [ ] Servidor inicia em ~1.7s
- [ ] Sem erros no console
- [ ] Página carrega em < 2s

### 3. Test Upload

```
1. http://localhost:3000
2. Upload CSV
3. Clique em cada botão
4. Verifique console (F12)
```

**Esperado:**

- [ ] Nenhum erro
- [ ] Performance OK
- [ ] Sem travamento

---

## 🌍 DEPLOYMENT OPTIONS

### Option A: Vercel (Recomendado para Next.js)

**1. Preparar**

```bash
git add .
git commit -m "v0.5.0: Next.js 15 + React 18 com DataTable simplificado"
git push origin main
```

**2. Deploy**

```bash
npm install -g vercel
vercel --prod
```

**3. Verificar**

- URL será exibida (ex: https://cafe-dashboard.vercel.app)
- Clique e teste em produção

### Option B: Netlify

**1. Build**

```bash
npm run build
```

**2. Deploy via Drag-and-Drop**

- Abra https://app.netlify.com
- Drag and drop pasta `.next`

### Option C: Server Próprio (Linux/Ubuntu)

**1. SSH ao servidor**

```bash
ssh user@seu-servidor.com
```

**2. Clone repo**

```bash
git clone https://seu-repo.git
cd cafe_dashboard
npm install
```

**3. Build**

```bash
npm run build
```

**4. Start (PM2 para persistência)**

```bash
npm install -g pm2
pm2 start "npm start" --name "cafe-dashboard"
pm2 save
```

**5. Configurar reverse proxy (Nginx)**

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**6. Restart Nginx**

```bash
sudo systemctl restart nginx
```

---

## 📊 VARIÁVEIS DE AMBIENTE

Crie `.env.local` se houver:

```env
# Exemplo (se necessário):
NEXT_PUBLIC_API_URL=https://api.seu-servidor.com
NODE_ENV=production
```

**Nota:** Este projeto não precisa de .env atualmente (usa localStorage)

---

## 🔐 SEGURANÇA

### Antes de Produção

- [ ] Revisar dados sensíveis no código
- [ ] Não committar `.env` files
- [ ] Verificar CORS policies
- [ ] Usar HTTPS (Vercel/Netlify faz automaticamente)

### localStorage

- [ ] Dados sensíveis não devem ser armazenados
- [ ] CSV pode conter dados bancos?
  - Sim? → Adicionar aviso ao usuário
  - Não? → Está OK

---

## 🧪 TESTE EM PRODUÇÃO

Após deploy, execute este checklist:

### 1. Página Carrega

- [ ] https://seu-site.com abre
- [ ] Layout correto
- [ ] Sem 404 errors

### 2. Upload

- [ ] Botão Upload funciona
- [ ] Arquivo selecionado
- [ ] Dados aparecem

### 3. Filtros

- [ ] Filtro global funciona
- [ ] Filtros avançados abrem
- [ ] Sem lag/travamento

### 4. Export

- [ ] Copiar funciona
- [ ] CSV baixa corretamente
- [ ] Arquivo tem dados

### 5. Performance

- [ ] Primeira página < 3s
- [ ] Operações < 200ms
- [ ] Sem memory leak

### 6. Console

- [ ] F12 → Console
- [ ] Nenhum erro (red)
- [ ] Nenhum warning (yellow)

---

## 📈 MONITORAMENTO

### Ferramentas Recomendadas

- **Erro:** Sentry (free tier)
- **Performance:** Vercel Analytics
- **Uptime:** UptimeRobot (free)

### Setup Sentry (Opcional)

```bash
npm install @sentry/nextjs
```

Depois configure em `next.config.js`:

```js
const withSentryConfig = require("@sentry/nextjs").withSentryConfig;

module.exports = withSentryConfig(
  {
    // ... sua config
  },
  {
    org: "seu-org",
    project: "cafe-dashboard",
  }
);
```

---

## 🆘 TROUBLESHOOTING

### Problema: Build falha

```bash
npm run build
```

**Solução:**

- Verify Node version: `node -v` (deve ser 18+)
- Limpar cache: `rm -rf .next node_modules && npm install`
- Verificar erros: `npm run lint`

### Problema: 404 ao abrir página

**Solução:**

- Verificar `.next` foi gerado
- Verify deployment platform (Vercel/Netlify)
- Check custom domain config

### Problema: Dados não carregam

**Solução:**

- Verificar localStorage: F12 → Application → localStorage
- Check CSV upload funciona localmente
- Verify CORS se há API externa

### Problema: Performance ruim

**Solução:**

- Abrir DevTools → Performance → Record
- Identificar culpado (component/library)
- Profile com Chrome DevTools

---

## ✅ POST-DEPLOYMENT

Após deploy bem-sucedido:

1. **Teste Final**

   - [ ] Todas funcionalidades OK
   - [ ] Performance boa
   - [ ] Sem erros

2. **Comunicar**

   - [ ] URL em produção documentada
   - [ ] Time informado
   - [ ] Stakeholders notificados

3. **Monitorar**

   - [ ] Primeiras 24h - verificar a cada 2h
   - [ ] Depois - verificar 1x por dia
   - [ ] Setup alertas se tiver erros

4. **Manutenção**
   - [ ] Weekly: verificar logs
   - [ ] Monthly: revisar performance
   - [ ] Quarterly: atualizar dependências

---

## 🎯 ROLLBACK (Se Necessário)

Se algo der errado em produção:

### Vercel

```bash
vercel --prod --skip-build  # Usar build anterior
```

### GitHub + Manual

```bash
git log --oneline
git checkout v0.4.0  # Voltar para versão anterior
npm run build
# Redeploy
```

---

## 📞 SUPORTE

Se tiver dúvidas:

1. Consulte GUIA_TESTES_v0.5.0.md
2. Verifique RELATORIO_v0.5.0.md
3. Revise logs de erro (F12 ou servidor)
4. Contate desenvolvedor

---

**Data de Deploy:** \_**\_/\_\_**/**\_\_**  
**Responsável:** ******\_\_\_\_******  
**Status:** ✅ Deployado com sucesso / ❌ Falhou

**Notas:**

```
[Adicione notas aqui]
```

---

**Desenvolvido com ❤️**  
**Next.js 15.0.0 + React 18.3.1**  
**October 24, 2025**
