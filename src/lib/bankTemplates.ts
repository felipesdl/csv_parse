import { BankTemplate } from "@/types";

export const BANK_TEMPLATES: Record<string, BankTemplate> = {
  caixa: {
    id: "caixa",
    name: "Caixa Econômica",
    delimiter: ";",
    expectedColumns: ["Data", "Descrição", "Valor", "Tipo de transação", "Referência", "Lançamento futuro"],
    dateColumn: "Data",
    descriptionColumn: "Descrição",
    valueColumn: "Valor",
    typeColumn: "Tipo de transação",
    referenceColumn: "Referência",
    futureColumn: "Lançamento futuro",
  },
  inter: {
    id: "inter",
    name: "Banco Inter",
    delimiter: ";",
    expectedColumns: ["Data Lançamento", "Histórico", "Descrição", "Valor", "Saldo"],
    dateColumn: "Data Lançamento",
    descriptionColumn: "Descrição",
    valueColumn: "Valor",
  },
  itau: {
    id: "itau",
    name: "Itaú",
    delimiter: ",",
    expectedColumns: ["Data", "Descrição", "Valor"],
    dateColumn: "Data",
    descriptionColumn: "Descrição",
    valueColumn: "Valor",
  },
  bradesco: {
    id: "bradesco",
    name: "Bradesco",
    delimiter: ",",
    expectedColumns: ["Data", "Descrição", "Valor"],
    dateColumn: "Data",
    descriptionColumn: "Descrição",
    valueColumn: "Valor",
  },
  santander: {
    id: "santander",
    name: "Santander",
    delimiter: ";",
    expectedColumns: ["Data", "Descrição", "Crédito (R$)", "Débito (R$)"],
    dateColumn: "Data",
    descriptionColumn: "Descrição",
    valueColumn: "Valor", // Campo computado a partir de Crédito/Débito
    creditColumn: "Crédito (R$)",
    debitColumn: "Débito (R$)",
    skipHeaderRows: 5, // Pular as 5 linhas de metadados (linhas 0-4), manter cabeçalho na linha 5
  },
  generic: {
    id: "generic",
    name: "Genérico",
    delimiter: ",",
    expectedColumns: [],
    dateColumn: "Data",
    descriptionColumn: "Descrição",
    valueColumn: "Valor",
  },
  onilx: {
    id: "onilx",
    name: "OnilX",
    delimiter: ";",
    expectedColumns: ["Data", "Descrição", "Valor", "Tipo de transação", "Referência", "Lançamento futuro"],
    dateColumn: "Data",
    descriptionColumn: "Descrição",
    valueColumn: "Valor",
    typeColumn: "Tipo de transação",
    referenceColumn: "Referência",
    futureColumn: "Lançamento futuro",
  },
};

export const AUTO_DETECT_KEYWORDS: Record<string, string[]> = {
  caixa: ["caixa", "econômica", "econômica federal", "cef", "bco c6", "c6 s.a", "dados lançamento", "pix enviado", "pix recebido", "pagamento efetuado"],
  inter: ["inter", "banco inter", "bco inter", "data lançamento"],
  itau: ["itaú", "itau", "itau bank"],
  bradesco: ["bradesco", "banco bradesco"],
  santander: ["santander", "banco santander", "crédito (r$)", "débito (r$)", "conta corrente", "agencia de marketing"],
  onilx: ["onilx", "onil x", "onil exchange"],
};

export function detectBankFromContent(content: string): string | null {
  const normalizedContent = content.toLowerCase();

  for (const [bank, keywords] of Object.entries(AUTO_DETECT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedContent.includes(keyword)) {
        return bank;
      }
    }
  }

  return null;
}

export function getTemplateByBank(bankId: string): BankTemplate {
  return BANK_TEMPLATES[bankId] || BANK_TEMPLATES.generic;
}

/**
 * Detecta o delimitador correto analisando as primeiras linhas do arquivo
 * Procura pela linha do cabeçalho e verifica qual delimitador resulta em mais colunas
 */
export function detectDelimiter(content: string): string {
  const lines = content.split("\n").filter((l) => l.trim());

  // Procurar por uma linha que pareça um cabeçalho (com keywords)
  const headerKeywords = ["data", "lançamento", "histórico", "descrição", "valor", "saldo"];
  let headerLine = "";

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (headerKeywords.some((kw) => lowerLine.includes(kw))) {
      headerLine = line;
      break;
    }
  }

  if (!headerLine) {
    console.warn("[detectDelimiter] Nenhum header encontrado, usando delimitador padrão ','");
    return ","; // fallback
  }

  // Se a linha contiver "Data Lançamento", é muito provável que seja Banco Inter com ; como delimitador
  if (headerLine.toLowerCase().includes("data lançamento")) {
    console.log("[detectDelimiter] Detectado 'Data Lançamento', usando delimitador ';' (Banco Inter)");
    return ";";
  }

  // Testar diferentes delimitadores
  const delimiters = [";", ",", "\t", "|"];
  const delimiterScores: Record<string, number> = {};

  for (const delim of delimiters) {
    const columnCount = (headerLine.match(new RegExp(`\\${delim}`, "g")) || []).length + 1;
    console.log(`[detectDelimiter] Delimitador "${delim}": ${columnCount} colunas em "${headerLine.substring(0, 60)}..."`);

    // Score basado em número de colunas (preferir 3+)
    if (columnCount >= 3) {
      delimiterScores[delim] = columnCount;
    } else if (columnCount >= 2) {
      delimiterScores[delim] = columnCount - 0.5; // Penalizar um pouco
    } else {
      delimiterScores[delim] = 0;
    }
  }

  // Encontrar o delimitador com maior score
  let bestDelimiter = ",";
  let maxScore = 0;

  for (const delim of delimiters) {
    const score = delimiterScores[delim] || 0;
    if (score > maxScore) {
      maxScore = score;
      bestDelimiter = delim;
    }
  }

  console.log(`[detectDelimiter] Delimitador escolhido: "${bestDelimiter}" com score ${maxScore}`);
  return bestDelimiter;
}

export function detectMonthFromData(dateString: string): string | null {
  // Esperado formato: DD/MM/YYYY ou DD/MM/YYYY HH:MM:SS
  const dateRegex = /\d{2}\/(\d{2})\/(\d{4})/;
  const match = dateString.match(dateRegex);

  if (match) {
    const month = match[1];
    const year = match[2];
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return `${monthNames[parseInt(month) - 1]} de ${year}`;
  }

  return null;
}
