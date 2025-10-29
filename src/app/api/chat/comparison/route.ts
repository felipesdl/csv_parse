import { OpenAI } from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages, comparisonData } = await req.json();

    // Prepara contexto dos dados de comparação
    const contextMessage =
      comparisonData && comparisonData.files?.length > 0
        ? `
Contexto dos dados de comparação carregados:
- Total de arquivos comparados: ${comparisonData.files.length}
- Colunas comuns em todos os arquivos: ${comparisonData.commonColumns?.join(", ") || "Nenhuma"}

DETALHES DE CADA ARQUIVO:

${comparisonData.files
  .map(
    (file: any, index: number) => `
📄 ARQUIVO ${index + 1}:
- Banco: ${file.bankName || file.bankId}
- Mês/Período: ${file.month || "Não especificado"}
- Data de Upload: ${new Date(file.uploadDate).toLocaleDateString("pt-BR")}
- Total de transações: ${file.rowCount}
- Colunas disponíveis: ${file.columns.join(", ")}

Todas as transações do arquivo:
${JSON.stringify(file.data, null, 2)}

Estatísticas do arquivo:
${calculateBasicStats(file.data, file.bankName || file.bankId)}
`
  )
  .join("\n---\n")}

ANÁLISE COMPARATIVA:
${generateComparativeStats(comparisonData.files)}
`
        : "Nenhum arquivo de comparação carregado. Solicite ao usuário que faça upload de múltiplos arquivos CSV na página de comparação.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0.1, // Temperatura baixa para respostas mais determinísticas
      messages: [
        {
          role: "system",
          content: `Você é um assistente financeiro EXTREMAMENTE RESTRITO especializado em COMPARAÇÃO de múltiplos extratos bancários.

⚠️ REGRAS CRÍTICAS - NUNCA VIOLE:
1. NUNCA invente, assuma ou especule sobre dados que não estão explicitamente fornecidos
2. NUNCA mencione transações, valores ou estabelecimentos que não existem nos dados fornecidos
3. NUNCA faça suposições sobre categorias, padrões ou tendências sem base nos dados reais
4. Se uma pergunta não puder ser respondida com os dados disponíveis, diga: "Não tenho dados suficientes para responder isso"
5. SEMPRE cite valores exatos, estabelecimentos e bancos exatamente como aparecem nos dados
6. NUNCA adicione informações externas ou conhecimento geral sobre finanças
7. APENAS calcule, conte, ordene, compare e analise o que está explicitamente nos dados
8. Quando comparar, SEMPRE identifique claramente qual banco/arquivo você está referenciando

COMPORTAMENTO OBRIGATÓRIO PARA COMPARAÇÃO:
- Sempre identifique os arquivos por banco e período (ex: "No Itaú de outubro...")
- Compare valores entre arquivos apenas quando os dados existirem em ambos
- Se perguntarem sobre algo não presente: "Essa informação não está nos dados fornecidos"
- Se os dados não tiverem uma coluna/campo: "Não há coluna [nome] em [banco/arquivo]"
- Destaque diferenças e semelhanças de forma clara e objetiva
- Use tabelas comparativas quando apropriado
- Sempre responda em português brasileiro
- Use emojis para identificar bancos e destacar diferenças (💰 📊 📈 📉 ⚠️ ✅ 🏦)
- Seja objetivo, direto e factual
- Use formato brasileiro para valores (R$ 1.234,56)

CAPACIDADES DE COMPARAÇÃO:
- Comparar gastos totais entre bancos/períodos
- Identificar transações duplicadas entre contas
- Comparar categorias de gastos
- Analisar diferenças de padrão de consumo
- Comparar entradas e saídas entre períodos
- Identificar transações que aparecem em um banco mas não em outro

FORMATO DE RESPOSTA:
- Liste valores e transações EXATAMENTE como aparecem nos dados
- Sempre identifique o banco/arquivo ao citar dados
- Não interprete ou infira intenções do usuário
- Não dê conselhos financeiros genéricos
- Apenas análise factual e comparativa dos dados fornecidos

${contextMessage}`,
        },
        ...messages,
      ],
    });

    // Converte o stream do OpenAI para o formato Server-Sent Events (SSE)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              // Formato SSE esperado pelo useChat do AI SDK
              const data = `0:"${content.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Comparison Chat API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao processar mensagem de comparação. Verifique sua chave da OpenAI.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

function calculateBasicStats(rows: any[] | undefined, bankName: string) {
  if (!rows || rows.length === 0) return "Sem dados para análise";

  try {
    // Tenta encontrar coluna de valor
    const valorColumn = Object.keys(rows[0]).find(
      (key) => key.toLowerCase().includes("valor") || key.toLowerCase().includes("value") || key.toLowerCase().includes("lancamento")
    );

    if (!valorColumn) return "Coluna de valor não encontrada";

    const values = rows
      .map((row) => {
        const val = String(row[valorColumn]).replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
        return parseFloat(val);
      })
      .filter((val) => !isNaN(val));

    const totalCredits = values.filter((v) => v > 0).reduce((a, b) => a + b, 0);
    const totalDebits = values.filter((v) => v < 0).reduce((a, b) => a + Math.abs(b), 0);
    const balance = totalCredits - totalDebits;

    return `
- Créditos totais (${bankName}): R$ ${totalCredits.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Débitos totais (${bankName}): R$ ${totalDebits.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Saldo líquido (${bankName}): R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Transações positivas: ${values.filter((v) => v > 0).length}
- Transações negativas: ${values.filter((v) => v < 0).length}
`;
  } catch (error) {
    return "Erro ao calcular estatísticas";
  }
}

function generateComparativeStats(files: any[]) {
  if (!files || files.length === 0) return "";

  try {
    const stats = files
      .map((file) => {
        const valorColumn = Object.keys(file.data[0] || {}).find(
          (key) => key.toLowerCase().includes("valor") || key.toLowerCase().includes("value") || key.toLowerCase().includes("lancamento")
        );

        if (!valorColumn) return null;

        const values = file.data
          .map((row: any) => {
            const val = String(row[valorColumn]).replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
            return parseFloat(val);
          })
          .filter((val: number) => !isNaN(val));

        const totalCredits = values.filter((v: number) => v > 0).reduce((a: number, b: number) => a + b, 0);
        const totalDebits = values.filter((v: number) => v < 0).reduce((a: number, b: number) => a + Math.abs(b), 0);

        return {
          bank: file.bankName || file.bankId,
          month: file.month,
          credits: totalCredits,
          debits: totalDebits,
          balance: totalCredits - totalDebits,
          transactionCount: file.rowCount,
        };
      })
      .filter(Boolean);

    if (stats.length === 0) return "";

    const totalCredits = stats.reduce((sum, s) => sum + (s?.credits || 0), 0);
    const totalDebits = stats.reduce((sum, s) => sum + (s?.debits || 0), 0);
    const totalBalance = totalCredits - totalDebits;

    return `
VISÃO GERAL COMPARATIVA:

Totais Consolidados:
- Créditos totais (todos os bancos): R$ ${totalCredits.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Débitos totais (todos os bancos): R$ ${totalDebits.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Saldo líquido total: R$ ${totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Por Banco:
${stats
  .map(
    (s) => `
- ${s?.bank} (${s?.month || "sem período"}):
  • Créditos: R$ ${(s?.credits || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  • Débitos: R$ ${(s?.debits || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  • Saldo: R$ ${(s?.balance || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  • Transações: ${s?.transactionCount || 0}
`
  )
  .join("\n")}
`;
  } catch (error) {
    return "Erro ao gerar estatísticas comparativas";
  }
}
