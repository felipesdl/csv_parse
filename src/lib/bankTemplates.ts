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
    delimiter: ",",
    expectedColumns: ["Data", "Descrição", "Valor"],
    dateColumn: "Data",
    descriptionColumn: "Descrição",
    valueColumn: "Valor",
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
};

export const AUTO_DETECT_KEYWORDS: Record<string, string[]> = {
  caixa: ["caixa", "econômica", "econômica federal", "cef", "bco c6", "c6 s.a", "dados lançamento", "pix enviado", "pix recebido", "pagamento efetuado"],
  inter: ["inter", "banco inter", "bco inter", "data lançamento"],
  itau: ["itaú", "itau", "itau bank"],
  bradesco: ["bradesco", "banco bradesco"],
  santander: ["santander", "banco santander"],
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

  if (!headerLine) return ","; // fallback

  // Testar diferentes delimitadores
  const delimiters = [";", ",", "\t", "|"];
  let bestDelimiter = ",";
  let maxColumns = 0;

  for (const delim of delimiters) {
    const columnCount = (headerLine.match(new RegExp(`\\${delim}`, "g")) || []).length + 1;
    // Preferir delimitadores que resultem em 3+ colunas
    if (columnCount >= 3 && columnCount > maxColumns) {
      maxColumns = columnCount;
      bestDelimiter = delim;
    }
  }

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
