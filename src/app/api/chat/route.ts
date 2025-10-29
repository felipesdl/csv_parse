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
      messages: [
        {
          role: "system",
          content: `Você é um assistente financeiro especializado em análise de extratos bancários brasileiros.

REGRAS IMPORTANTES:
1. Sempre responda em português brasileiro
2. Use emojis para tornar as respostas mais amigáveis (💰 📊 📈 ⚠️ ✅ etc)
3. Seja objetivo e direto nas respostas
4. Quando analisar valores, sempre use formato brasileiro (R$ 1.234,56)
5. Se identificar padrões ou anomalias, sempre avise o usuário
6. Forneça insights acionáveis, não apenas dados brutos
7. Se não tiver dados suficientes, seja honesto e peça mais informações

CAPACIDADES:
- Analisar gastos por categoria
- Identificar transações duplicadas
- Calcular médias e totais
- Detectar padrões de consumo
- Comparar períodos
- Identificar anomalias
- Sugerir otimizações financeiras

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
