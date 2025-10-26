"use client";

import React, { useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { validateCSVForComparison } from "@/lib/csvParser";
import { useParseCSV } from "@/hooks/useCSVOperations";
import { useComparisonStore } from "@/store/comparisonStore";
import { BankSelectorModal } from "@/components/modal/BankSelectorModal";
import { ValidationError } from "@/types";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";

interface ComparisonCSVUploaderProps {
  onUploadSuccess?: () => void;
}

interface PendingFileData {
  rows: any[];
  columns: string[];
  bank: string | null;
  month: string | null;
  fileName: string;
}

export function ComparisonCSVUploader({ onUploadSuccess }: ComparisonCSVUploaderProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFileData | null>(null);
  const { addFile, updateCommonColumns } = useComparisonStore();

  const { mutate: parseCSV, isPending: isLoading } = useParseCSV();

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    setCurrentFile(file);
    setValidationErrors([]);
    setUploadError(null);

    // Sempre mostrar o seletor de banco - sem detecção automática
    setCurrentFile(file);
    setPendingFile({
      rows: [],
      columns: [],
      bank: null,
      month: null,
      fileName: file.name,
    });
    setShowBankSelector(true);
  };

  const handleBankConfirm = (bankId: string) => {
    if (!currentFile || !pendingFile) return;

    // Agora fazer o parse com o banco forçado
    parseCSV(
      { file: currentFile, forcedBank: bankId },
      {
        onSuccess: (data) => {
          const { rows, columns, month } = data;

          // Validação flexível para comparação (não exige colunas específicas)
          const errors = validateCSVForComparison(rows, columns);

          if (errors.length > 0) {
            setValidationErrors(errors);
            setShowBankSelector(false);
            return;
          }

          // Arquivo validado - adicionar ao store
          const newFile = {
            id: crypto.randomUUID(),
            bankId,
            bankName: BANK_TEMPLATES[bankId]?.name || bankId,
            uploadDate: new Date().toISOString(),
            rowCount: rows.length,
            data: rows,
            columns: columns,
          };

          addFile(newFile);
          updateCommonColumns();
          setPendingFile(null);
          setCurrentFile(null);
          setShowBankSelector(false);
          onUploadSuccess?.();
        },
        onError: (error: Error) => {
          setUploadError(error.message);
          setShowBankSelector(false);
        },
      }
    );
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
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input File Hidden */}
      <input ref={fileInputRef} type="file" accept=".csv" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} className="hidden" />

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-8 text-center cursor-pointer transition bg-gradient-to-b from-gray-50 to-white"
      >
        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">{currentFile ? currentFile.name : "Arrastar arquivo aqui ou clique para selecionar"}</p>
        <p className="text-sm text-gray-600">Aceita apenas arquivos CSV</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 text-sm">⏳ Processando arquivo...</p>
        </div>
      )}

      {/* Errors */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-900 font-medium">Erro no upload</p>
            <p className="text-red-700 text-sm">{uploadError}</p>
          </div>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-900 font-medium mb-2">⚠️ Erros de validação:</p>
          <ul className="text-yellow-800 text-sm space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bank Selector Modal */}
      {pendingFile && (
        <BankSelectorModal
          isOpen={showBankSelector}
          onClose={() => {
            setShowBankSelector(false);
            setPendingFile(null);
            setCurrentFile(null);
          }}
          onConfirm={handleBankConfirm}
          suggestedBank={pendingFile.bank}
          fileName={pendingFile.fileName}
        />
      )}
    </div>
  );
}
