"use client";

import React, { useState } from "react";
import { Plus, Upload, X, AlertCircle, Settings } from "lucide-react";
import { ComparisonCSVUploader } from "@/components/upload";
import { Modal, Card } from "@/components";
import { useComparisonStore, type ComparedFile } from "@/store/comparisonStore";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";
import { TabsComparisonView } from "./TabsComparisonView";
import { ColumnMapper } from "./ColumnMapper";

export function ComparisonPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showColumnMapper, setShowColumnMapper] = useState(false);
  const { comparedFiles, removeFile, commonColumns } = useComparisonStore();

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
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition shadow-sm cursor-pointer"
          >
            <Upload size={20} />
            Adicionar Arquivo
          </button>
        </div>

        {/* Files Grid */}
        {comparedFiles && comparedFiles.length > 0 ? (
          <div className="space-y-6">
            {/* Info Alert */}
            {commonColumns.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-sm">
                  <strong>✓ Colunas comuns encontradas:</strong> {commonColumns.length}
                </p>
                <p className="text-blue-700 text-xs mt-2">
                  Colunas que existem em todos os arquivos: <strong>{commonColumns.join(", ")}</strong>
                </p>
              </div>
            )}

            {comparedFiles.length > 1 && commonColumns.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-yellow-900 font-medium">⚠️ Nenhuma coluna comum</p>
                  <p className="text-yellow-700 text-sm">Os arquivos não possuem colunas em comum. Verifique se são do mesmo banco.</p>
                </div>
              </div>
            )}

            {/* Files Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparedFiles.map((file: ComparedFile) => (
                <Card key={file.id} className="hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{BANK_TEMPLATES[file.bankId]?.name || file.bankId}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{file.bankId}</span>
                      </div>
                      <p className="text-xs text-gray-500">{new Date(file.uploadDate).toLocaleString("pt-BR")}</p>
                    </div>
                    <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-red-50 rounded transition cursor-pointer">
                      <X size={18} className="text-red-500" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      📊 <strong>{file.rowCount}</strong> registros
                    </p>
                    <p>
                      📋 <strong>{file.columns.length}</strong> colunas
                    </p>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">Colunas:</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{file.columns.join(", ")}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Add New File Card */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={32} className="text-gray-400 group-hover:text-blue-500" />
                <span className="text-gray-600 font-medium">Adicionar Arquivo</span>
              </button>
            </div>
          </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Análise de Comparação</h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{comparedFiles.length} bancos</span>
              </div>
              <button
                onClick={() => setShowColumnMapper(true)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
              >
                <Settings size={18} />
                Configurar Colunas
              </button>
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

      {/* Column Mapper */}
      <ColumnMapper isOpen={showColumnMapper} onClose={() => setShowColumnMapper(false)} />
    </div>
  );
}
