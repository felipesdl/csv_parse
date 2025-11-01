"use client";

import React, { useState, useMemo } from "react";
import { Plus, Upload, X, Settings, FolderOpen, Eye, EyeOff } from "lucide-react";
import { ComparisonCSVUploader } from "@/components/upload";
import { Modal, Card } from "@/components";
import { FloatingComparisonChatButton } from "@/components/chat";
import { useComparisonStore, type ComparedFile } from "@/store/comparisonStore";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";
import { formatBankReference } from "@/utils/referenceFormatter";
import { parseValueBR } from "@/utils/formatUtils";
import { TabsComparisonView } from "./TabsComparisonView";
import { ColumnMapper } from "./ColumnMapper";

interface FileStats {
  totalCredito: number;
  totalDebito: number;
  saldoLiquido: number;
  dataInicial: string | null;
  dataFinal: string | null;
  countCredito: number;
  countDebito: number;
}

// Função auxiliar para parsear datas no formato dd/mm/yyyy
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export function ComparisonPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showColumnMapper, setShowColumnMapper] = useState(false);
  const { comparedFiles, removeFile, toggleFileActive, commonColumns } = useComparisonStore();

  // Calcular estatísticas de cada arquivo
  const filesStats = useMemo(() => {
    const statsMap = new Map<string, FileStats>();

    comparedFiles.forEach((file) => {
      const template = BANK_TEMPLATES[file.bankId];
      const typeCol = template?.typeColumn;
      const dateCol = template?.dateColumn;
      const valueCol = "Valor"; // Sempre normalizado

      let fileCredito = 0;
      let fileDebito = 0;
      let fileCountCredito = 0;
      let fileCountDebito = 0;
      let dataInicial: Date | null = null;
      let dataFinal: Date | null = null;

      if (file.data && file.data.length > 0) {
        for (const row of file.data) {
          const valor = parseValueBR(row[valueCol]);

          if (valor !== 0) {
            // Calcular crédito/débito
            if (typeCol && row[typeCol]) {
              const tipoStr = String(row[typeCol]).toUpperCase();
              if (tipoStr.includes("CRÉDITO")) {
                fileCredito += valor;
                fileCountCredito++;
              } else if (tipoStr.includes("DÉBITO")) {
                fileDebito += valor;
                fileCountDebito++;
              }
            } else {
              if (valor > 0) {
                fileCredito += valor;
                fileCountCredito++;
              } else {
                fileDebito += valor;
                fileCountDebito++;
              }
            }
          }

          // Calcular datas inicial e final
          if (dateCol && row[dateCol]) {
            const dateStr = String(row[dateCol]);
            const date = parseDate(dateStr);
            if (date) {
              if (!dataInicial || date < dataInicial) {
                dataInicial = date;
              }
              if (!dataFinal || date > dataFinal) {
                dataFinal = date;
              }
            }
          }
        }
      }

      statsMap.set(file.id, {
        totalCredito: fileCredito,
        totalDebito: fileDebito,
        saldoLiquido: fileCredito + fileDebito,
        dataInicial: dataInicial ? dataInicial.toLocaleDateString("pt-BR") : null,
        dataFinal: dataFinal ? dataFinal.toLocaleDateString("pt-BR") : null,
        countCredito: fileCountCredito,
        countDebito: fileCountDebito,
      });
    });

    return statsMap;
  }, [comparedFiles]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
  };

  return (
    <div className="w-full py-8 px-[16px] h-full overflow-auto">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Comparação de Bancos</h1>
            <p className="text-gray-600">Importe múltiplos arquivos de bancos diferentes para comparação</p>
          </div>
          <div className="flex gap-3">
            {comparedFiles && comparedFiles.length > 0 && (
              <>
                <button
                  onClick={() => setShowFilesModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition shadow-sm cursor-pointer"
                >
                  <FolderOpen size={20} />
                  Gerenciar Arquivos ({comparedFiles.length})
                </button>
                <button
                  onClick={() => setShowColumnMapper(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition shadow-sm cursor-pointer"
                >
                  <Settings size={20} />
                  Configurar Colunas
                </button>
              </>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition shadow-sm cursor-pointer"
            >
              <Upload size={20} />
              Adicionar Arquivo
            </button>
          </div>
        </div>

        {/* Files Grid */}
        {comparedFiles && comparedFiles.length > 0 ? (
          <div className="space-y-6">{/* Conteúdo vazio - alertas removidos */}</div>
        ) : (
          <Card className="text-center" padding="lg">
            <p className="text-gray-900 mb-4 text-lg">Nenhum arquivo adicionado</p>
            <p className="text-sm text-gray-600 mb-6">Importe arquivos de diferentes bancos para começar a comparação</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition cursor-pointer"
            >
              <Upload size={20} />
              Selecionar Arquivo
            </button>
          </Card>
        )}

        {/* Comparison Charts Section */}
        {comparedFiles && comparedFiles.length > 1 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Análise de Comparação</h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{comparedFiles.length} bancos</span>
              {commonColumns.length > 0 && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium" title={`Colunas: ${commonColumns.join(", ")}`}>
                  ✓ {commonColumns.length} em comum
                </span>
              )}
              {comparedFiles.length > 1 && commonColumns.length === 0 && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium" title="Nenhuma coluna comum encontrada">
                  ⚠️ 0 em comum
                </span>
              )}
            </div>

            <TabsComparisonView onOpenColumnMapper={() => setShowColumnMapper(true)} />
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Adicionar Arquivo para Comparação" size="md">
        <div className="p-6">
          <ComparisonCSVUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      </Modal>

      {/* Files Management Modal */}
      <Modal isOpen={showFilesModal} onClose={() => setShowFilesModal(false)} title="Arquivos Adicionados" size="3xl">
        <div className="p-6">
          {comparedFiles && comparedFiles.length > 0 ? (
            <div className="space-y-4">
              {/* Files Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparedFiles.map((file: ComparedFile) => {
                  const stats = filesStats.get(file.id);
                  return (
                    <Card key={file.id} className={`hover:shadow-md transition ${!file.isActive ? "opacity-50 bg-gray-50" : ""}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{formatBankReference(file.bankId, file.month || "")}</h3>
                            {!file.isActive && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Inativo</span>}
                          </div>
                          {stats && stats.dataInicial && stats.dataFinal && (
                            <p className="text-xs text-gray-600 mt-1">
                              📅 {stats.dataInicial} a {stats.dataFinal}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleFileActive(file.id)}
                            className={`p-1 rounded transition cursor-pointer ${
                              file.isActive ? "hover:bg-orange-50 text-orange-600" : "hover:bg-green-50 text-green-600"
                            }`}
                            title={file.isActive ? "Desativar arquivo" : "Ativar arquivo"}
                          >
                            {file.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-red-50 rounded transition cursor-pointer" title="Remover arquivo">
                            <X size={18} className="text-red-500" />
                          </button>
                        </div>
                      </div>

                      {stats ? (
                        <div className="space-y-3">
                          {/* Créditos */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">💚 Créditos:</span>
                            <span className="text-sm font-semibold text-green-700">
                              R$ {stats.totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 -mt-2 text-right">{stats.countCredito} transações</div>

                          {/* Débitos */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">❤️ Débitos:</span>
                            <span className="text-sm font-semibold text-red-700">
                              R$ {Math.abs(stats.totalDebito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 -mt-2 text-right">{stats.countDebito} transações</div>

                          {/* Saldo Líquido */}
                          <div className="pt-2 border-t flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">💰 Saldo Líquido:</span>
                            <span className="text-sm font-bold" style={{ color: stats.saldoLiquido >= 0 ? "#16a34a" : "#dc2626" }}>
                              R$ {stats.saldoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Carregando estatísticas...</div>
                      )}
                    </Card>
                  );
                })}

                {/* Add New File Card */}
                <button
                  onClick={() => {
                    setShowFilesModal(false);
                    setShowUploadModal(true);
                  }}
                  className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[200px]"
                >
                  <Plus size={32} className="text-gray-400 group-hover:text-blue-500" />
                  <span className="text-gray-600 font-medium">Adicionar Arquivo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Nenhum arquivo adicionado</p>
              <button
                onClick={() => {
                  setShowFilesModal(false);
                  setShowUploadModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition cursor-pointer"
              >
                <Upload size={20} />
                Selecionar Arquivo
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Column Mapper */}
      <ColumnMapper isOpen={showColumnMapper} onClose={() => setShowColumnMapper(false)} />

      {/* Floating AI Chat Button for Comparison */}
      <FloatingComparisonChatButton />
    </div>
  );
}
