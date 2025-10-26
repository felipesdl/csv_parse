// Test script para validar o SplitTableView
// Este arquivo é apenas para documentação do teste

const testData = [
{ "Data Lançamento": "29/08/2025", "Histórico": "Pix enviado", "Descrição": "Elon Pisanti Ribeiro", "Valor": "-2.000,00", "Saldo": "33.949,36" },
{ "Data Lançamento": "26/08/2025", "Histórico": "Pix recebido", "Descrição": "Axon Capital I", "Valor": "50.000,00", "Saldo": "46.208,06" },
{ "Data Lançamento": "27/08/2025", "Histórico": "Pix enviado", "Descrição": "J20 Imóveis", "Valor": "-3.200,00", "Saldo": "35.949,36" },
{ "Data Lançamento": "20/08/2025", "Histórico": "Pix recebido", "Descrição": "Axon Capital I", "Valor": "5.000,00", "Saldo": "4.968,19" },
];

// Esperado após SplitTableView:
// Positivos:
// - 50.000,00
// - 5.000,00
// Total: 2 linhas

// Negativos:
// - -2.000,00
// - -3.200,00
// Total: 2 linhas
