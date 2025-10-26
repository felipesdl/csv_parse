"use client";

import React, { useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { validateCSV, createTableData } from "@/lib/csvParser";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";
import { useDataStore } from "@/store/dataStore";
import { ValidationError } from "@/types";
import { useParseCSV } from "@/hooks/useCSVOperations";
import { BankSelectorModal } from "@/components/modal/BankSelectorModal";

interface CSVUploaderProps {
  onUploadSuccess?: () => void;
}

export function CSVUploader({ onUploadSuccess }: CSVUploaderProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const { setTableData, setError } = useDataStore();

  // TanStack Query Mutation para parse do CSV via API
  const { mutate: parseCSV, isPending: isLoading } = useParseCSV();

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    setCurrentFile(file);
    setValidationErrors([]);
    setError(null);
    setShowBankSelector(true); // Sempre mostrar seletor de banco
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".csv")) {
        handleFileSelect(file);
      } else {
        setError("Por favor, selecione um arquivo CSV válido");
      }
    }
  };

  const handleBankConfirm = (bankId: string) => {
    if (!currentFile) return;

    setValidationErrors([]);

    // Chamar mutation com banco forçado
    parseCSV(
      { file: currentFile, forcedBank: bankId },
      {
        onSuccess: (data) => {
          const { rows, columns, month } = data;
          const tableData = createTableData(rows, columns, bankId, month);
          setTableData(tableData);
          onUploadSuccess?.();
          setCurrentFile(null);
          setShowBankSelector(false);
        },
        onError: (error: Error) => {
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer bg-gray-50"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
          disabled={isLoading}
        />

        <Upload className="mx-auto mb-4 text-blue-500" size={40} />
        <p className="text-lg font-medium text-gray-900 mb-2">{isLoading ? "Processando arquivo..." : "Arraste um arquivo CSV aqui"}</p>
        <p className="text-sm text-gray-700">ou clique para selecionar um arquivo</p>
      </div>

      {/* Bank Selector Modal */}
      <BankSelectorModal
        isOpen={showBankSelector}
        onClose={() => {
          setShowBankSelector(false);
          setCurrentFile(null);
        }}
        onConfirm={handleBankConfirm}
        fileName={currentFile?.name || ""}
      />

      {/* Error Dialog */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-2 mb-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <h3 className="font-medium text-red-900">Erro ao processar arquivo</h3>
          </div>

          <div className="text-sm text-red-900 mb-4">
            {validationErrors.map((error, idx) => (
              <div key={idx} className="mb-2">
                • {error.message}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setValidationErrors([]);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
