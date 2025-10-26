"use client";

import React, { useEffect, useState } from "react";
import { RotateCcw, Save, Plus, Upload } from "lucide-react";
import { CSVUploader } from "../upload";
import { ErrorAlert } from "./ErrorAlert";
import { Modal } from "../modal";
import { useDataStore } from "@/store/dataStore";
import { DataTable } from "./DataTable";
import { useToast } from "@/hooks/useToast";

export function ImporterDashboard() {
  const { tableData, error, setError, reset, saveToLocalStorage, loadFromLocalStorage } = useDataStore();
  const { confirm } = useToast();
  const [mounted, setMounted] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Usar empty dependency array - apenas executar uma vez no mount
  useEffect(() => {
    setMounted(true);
    loadFromLocalStorage();
  }, []); // Empty array - executar apenas uma vez!

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full py-8 px-[16px] h-full overflow-auto">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header com Upload Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard de Importação</h1>
            <p className="text-gray-900">Faça upload de arquivos CSV bancários para visualizar, editar e exportar dados</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition shadow-sm"
          >
            <Upload size={20} />
            Upload
          </button>
        </div>

        {/* Error Alert */}
        <ErrorAlert error={error} onClose={() => setError(null)} />

        {/* Main Content */}
        {tableData ? (
          <div className="space-y-6">
            {/* Ações */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveToLocalStorage}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium transition"
              >
                <Save size={18} />
                Salvar Localmente
              </button>

              <button
                onClick={() => {
                  setShowUploadModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition cursor-pointer"
              >
                <Plus size={18} />
                Nova Importação
              </button>

              <button
                onClick={() => {
                  confirm(
                    "Deseja descartar todos os dados?",
                    () => {
                      reset();
                    },
                    {
                      confirmText: "Sim, limpar",
                      cancelText: "Cancelar",
                      description: "Todos os dados carregados serão perdidos.",
                    }
                  );
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition"
              >
                <RotateCcw size={18} />
                Limpar Dados
              </button>
            </div>

            {/* Footer Info */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-sm text-gray-900">
              <p>ℹ️ Dados salvos em: {new Date(tableData.uploadDate).toLocaleString("pt-BR")}</p>
            </div>

            {/* Table - Full Width */}
            <DataTable />
          </div>
        ) : (
          <div className="bg-white p-16 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-900 mb-4 text-lg">Nenhum arquivo carregado</p>
            <p className="text-sm text-gray-700 mb-6">Faça upload de um arquivo CSV para começar</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition"
            >
              <Upload size={20} />
              Selecionar Arquivo
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Importar Arquivo CSV" size="md">
        <div className="p-6">
          <CSVUploader onUploadSuccess={() => setShowUploadModal(false)} />
        </div>
      </Modal>
    </div>
  );
}
