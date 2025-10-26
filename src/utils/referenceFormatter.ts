import { BANK_TEMPLATES } from "@/lib/bankTemplates";

/**
 * Formata o nome de referência do extrato com banco e mês
 * Exemplo: "Banco Inter - Set. 2025"
 * @param bankId - ID do banco (ex: "inter")
 * @param month - Mês em formato string (ex: "2025-09" ou "Setembro 2025")
 * @returns String formatada com nome do banco e mês abreviado
 */
export function formatBankReference(bankId: string, month: string): string {
  const bankTemplate = BANK_TEMPLATES[bankId];
  const bankName = bankTemplate?.name || bankId;

  // Se o mês já está em formato "YYYY-MM", converter para mês abreviado
  if (month.includes("-")) {
    const [year, monthNum] = month.split("-");
    const monthIndex = parseInt(monthNum) - 1;
    const monthNames = ["Jan.", "Fev.", "Mar.", "Abr.", "Mai.", "Jun.", "Jul.", "Ago.", "Set.", "Out.", "Nov.", "Dez."];
    const formattedMonth = monthNames[monthIndex] || month;
    return `${bankName} - ${formattedMonth} ${year}`;
  }

  // Se já está em outro formato, tentar usar como está
  return `${bankName} - ${month}`;
}

/**
 * Extrai e formata apenas o mês a partir da string de mês
 * Exemplo: "2025-09" → "Set. 2025"
 * @param month - Mês em formato string
 * @returns String formatada com mês abreviado e ano
 */
export function formatMonthOnly(month: string): string {
  if (month.includes("-")) {
    const [year, monthNum] = month.split("-");
    const monthIndex = parseInt(monthNum) - 1;
    const monthNames = ["Jan.", "Fev.", "Mar.", "Abr.", "Mai.", "Jun.", "Jul.", "Ago.", "Set.", "Out.", "Nov.", "Dez."];
    const formattedMonth = monthNames[monthIndex] || month;
    return `${formattedMonth} ${year}`;
  }
  return month;
}
