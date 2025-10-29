/**
 * Constantes globais do sistema
 */

/**
 * Tempo de expiração de cache de upload (em ms)
 */
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Cores para gráficos de crédito
 */
export const COLORS_CREDIT = ["#22c55e", "#16a34a", "#22863a", "#1e7e34"];

/**
 * Cores para gráficos de débito
 */
export const COLORS_DEBIT = ["#ef4444", "#dc2626", "#991b1b", "#7f1d1d"];

/**
 * Cores genéricas para gráficos
 */
export const COLORS_GENERIC = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

/**
 * Palavras-chave para detectar headers em CSVs
 */
export const HEADER_KEYWORDS = [
  "data",
  "lançamento",
  "histórico",
  "descrição",
  "valor",
  "saldo",
  "referência",
  "tipo",
  "transação",
  "razão social",
  "cpf/cnpj",
];

/**
 * Configurações padrão de formatação
 */
export const DEFAULT_FORMAT_SETTINGS = {
  dateFormat: "full" as const,
  showNegativeAsPositive: false,
  splitByPosNeg: false,
};

/**
 * Mensagens de erro padrão
 */
export const ERROR_MESSAGES = {
  BANK_REQUIRED: "É necessário selecionar o banco manualmente",
  CSV_EMPTY: "CSV vazio ou inválido",
  CSV_PARSE_ERROR: "Erro ao parsear CSV",
  NO_FILES_LOADED: "Nenhum arquivo carregado",
  INVALID_FORMAT: "Formato de arquivo inválido",
  MISSING_COLUMNS: "Colunas esperadas não encontradas",
} as const;

/**
 * Labels de botões e ações
 */
export const LABELS = {
  ADD_FILE: "Adicionar Arquivo",
  REMOVE: "Remover",
  UPLOAD: "Carregar",
  EXPORT: "Exportar",
  COPY: "Copiar",
  DELETE: "Deletar",
  CANCEL: "Cancelar",
  SAVE: "Salvar",
  CLOSE: "Fechar",
  SELECT_BANK: "Selecione o Banco",
} as const;
