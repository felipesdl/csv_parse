import { OpenAI } from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages, tableData } = await req.json();

    // Prepara contexto dos dados da tabela
    const contextMessage = tableData
      ? `
Contexto dos dados carregados:
- Banco: ${tableData.bank || "Não especificado"}
- Mês/Período: ${tableData.month || "Não especificado"}
- Total de transações: ${tableData.rows?.length || 0}
- Colunas disponíveis: ${tableData.columns?.join(", ") || "Nenhuma"}

Todas as transações completas:
${JSON.stringify(tableData.rows || [], null, 2)}

Estatísticas básicas:
${calculateBasicStats(tableData.rows)}
`
      : "Nenhum dado carregado ainda. Solicite ao usuário que faça upload de um arquivo CSV primeiro.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0.1, // Temperatura baixa para respostas mais determinísticas
      messages: [
        {
          role: "system",
          content: `Você é um assistente financeiro EXTREMAMENTE RESTRITO que APENAS analisa dados fornecidos.

⚠️ REGRAS CRÍTICAS - NUNCA VIOLE:
1. NUNCA invente, assuma ou especule sobre dados que não estão explicitamente fornecidos
2. NUNCA mencione transações, valores ou estabelecimentos que não existem nos dados fornecidos
3. NUNCA faça suposições sobre categorias, padrões ou tendências sem base nos dados reais
4. Se uma pergunta não puder ser respondida com os dados disponíveis, diga: "Não tenho dados suficientes para responder isso"
5. SEMPRE cite valores exatos e estabelecimentos exatamente como aparecem nos dados
6. NUNCA adicione informações externas ou conhecimento geral sobre finanças
7. APENAS calcule, conte, ordene e analise o que está explicitamente nos dados

COMPORTAMENTO OBRIGATÓRIO:
- Se perguntarem sobre algo não presente nos dados: "Essa informação não está nos dados fornecidos"
- Se os dados não tiverem uma coluna/campo: "Não há coluna [nome] nos dados carregados"
- Se perguntarem sobre período diferente: "Os dados carregados são apenas de [período atual]"
- Sempre responda em português brasileiro
- Use emojis apenas para destacar números e categorias (💰 📊 📈 ⚠️ ✅)
- Seja objetivo, direto e factual
- Use formato brasileiro para valores (R$ 1.234,56)

FORMATO DE RESPOSTA:
- Liste valores e transações EXATAMENTE como aparecem nos dados
- Cite linha/índice quando relevante
- Não interprete ou infira intenções do usuário
- Não dê conselhos financeiros genéricos
- Apenas análise factual dos dados fornecidos

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
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao processar mensagem. Verifique sua chave da OpenAI.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

function calculateBasicStats(rows: any[] | undefined) {
  if (!rows || rows.length === 0) return "Sem dados para análise";

  try {
    // Tenta encontrar coluna de valor
    const valorColumn = Object.keys(rows[0]).find((key) => key.toLowerCase().includes("valor") || key.toLowerCase().includes("value"));

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
- Créditos totais: R$ ${totalCredits.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Débitos totais: R$ ${totalDebits.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Saldo líquido: R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Transações positivas: ${values.filter((v) => v > 0).length}
- Transações negativas: ${values.filter((v) => v < 0).length}
`;
  } catch (error) {
    return "Erro ao calcular estatísticas";
  }
}
