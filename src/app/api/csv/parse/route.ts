import { NextRequest, NextResponse } from "next/server";
import { detectAndParseCSV } from "@/lib/csvParser";
import { logger } from "@/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const forcedBank = (formData.get("forcedBank") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Arquivo deve ser CSV" }, { status: 400 });
    }

    try {
      // Processar CSV
      const { rows, columns, bank, month } = await detectAndParseCSV(file, forcedBank);

      return NextResponse.json(
        {
          success: true,
          data: {
            rows,
            columns,
            bank,
            month,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    } catch (parseError) {
      const parseMessage = parseError instanceof Error ? parseError.message : "Erro desconhecido ao processar CSV";
      logger.error("Erro ao parsear CSV:", parseError);

      return NextResponse.json(
        {
          error: `Erro ao processar arquivo: ${parseMessage}`,
          details: parseMessage,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao processar requisição";
    logger.error("Erro na API /csv/parse:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
