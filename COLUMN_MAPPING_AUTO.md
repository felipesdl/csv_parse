# Auto-Mapping de Colunas

## O que mudou?

Anteriormente, o sistema de mapeamento de colunas funcionava assim:

1. ❌ Você abria o modal de "Mapeamento de Colunas"
2. ❌ O sistema sugeria automaticamente as colunas similares
3. ❌ **Você precisava clicar em "Salvar Mapeamento"** manualmente
4. ❌ Só depois as colunas apareciam juntas na tabela de comparação

## Agora funciona assim:

1. ✅ Você carrega 2 ou mais arquivos CSV
2. ✅ **O mapeamento é feito automaticamente** (no background, sem precisar abrir nenhum modal)
3. ✅ As colunas similares aparecem **imediatamente** juntas na tabela:
   - "Data" + "Data Lançamento" → aparecem como "Data Lançamento"
   - "Valor" + "Valor" → aparecem como "Valor"
   - "Descrição" + "Descrição" → aparecem como "Descrição"

## Por que colunas de diferentes datas não ficavam juntas?

Porque diferentes bancos usam nomes diferentes para a coluna de data:

- **Inter**: `Data`
- **Caixa**: `Data Lançamento`
- **Itaú**: `Data` ou `Data Lançamento`

Sem o mapeamento, elas eram tratadas como colunas diferentes, então apareciam em colunas separadas na tabela.

## Como o auto-mapeamento funciona?

O sistema busca por padrões de similaridade:

- Nomes normalizados (remover espaços, pontuação)
- Palavras-chave (se tiver "data" em ambas, são similares)
- Palavras-chave (se tiver "valor" em ambas, são similares)
- Palavras-chave (se tiver "descri" em ambas, são similares)

## E se eu quiser customizar o mapeamento?

Você ainda pode:

1. Abrir o modal "Mapeamento de Colunas"
2. Expandir uma coluna mapeada
3. Alterar qual coluna de cada banco representa aquele padrão
4. **A mudança é salva automaticamente** quando você seleciona

## Modal de Mapeamento

O modal agora mostra:

- ✅ Colunas detectadas e auto-mapeadas
- ✓ **"Mapeamento aplicado automaticamente"** (sem precisar clicar em botão)
- Opção de adicionar novas colunas customizadas
- Opção de remover mapeamentos

## Benefício

Agora você não precisa aplicar manualmente o mapeamento toda vez. As colunas de datas aparecem juntas automaticamente!
