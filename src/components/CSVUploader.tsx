"use client";

import React, { useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { detectAndParseCSV, validateCSV, createTableData } from "@/lib/csvParser";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";
import { useDataStore } from "@/store/dataStore";
import { ValidationError } from "@/types";

interface CSVUploaderProps {
  onUploadSuccess?: () => void;
}

export function CSVUploader({ onUploadSuccess }: CSVUploaderProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [bankOption, setBankOption] = useState<string | null>(null);
  const [monthOption, setMonthOption] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null); // Guardar o arquivo
  const { setTableData, setLoading, setError } = useDataStore();

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    setCurrentFile(file); // Guardar o arquivo para uso posterior
    setIsLoading(true);
    setValidationErrors([]);
    setError(null);

    try {
      // Detectar e fazer parsing
      const { rows, columns, bank, month } = await detectAndParseCSV(file);

      // Validar
      const errors = validateCSV(rows, columns, bank);

      if (errors.length > 0) {
        // Se houver erros de detecção, perguntar ao usuário
        if (errors.some((e) => e.type === "missing-columns")) {
          setValidationErrors(errors);
          setBankOption(null);
          setMonthOption(month);
          return;
        }
        setValidationErrors(errors);
        return;
      }

      // Se detectou duplicatas, avisar depois
      if (rows.length > 0) {
        const tableData = createTableData(rows, columns, bank, month);
        setTableData(tableData);
        onUploadSuccess?.();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido ao processar arquivo";
      setError(message);
      console.error("Erro:", err);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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

  const handleBankConfirm = async () => {
    if (!bankOption || !currentFile) return;

    setIsLoading(true);
    setValidationErrors([]);

    try {
      // Passar o banco forçado para usar o delimitador correto
      const { rows, columns, month } = await detectAndParseCSV(currentFile, bankOption);
      const tableData = createTableData(rows, columns, bankOption, month);
      setTableData(tableData);
      onUploadSuccess?.();
      setCurrentFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
    } finally {
      setIsLoading(false);
      setBankOption(null);
      setMonthOption(null);
    }
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

      {/* Error Dialog */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-2 mb-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <h3 className="font-medium text-yellow-900">Arquivo não detectado automaticamente</h3>
          </div>

          <p className="text-sm text-yellow-900 mb-4">Por favor, selecione o banco correto:</p>

          <select
            value={bankOption || ""}
            onChange={(e) => setBankOption(e.target.value || null)}
            className="w-full p-2 border border-yellow-300 rounded mb-4 text-sm text-gray-900"
          >
            <option value="">Selecione um banco...</option>
            {Object.entries(BANK_TEMPLATES).map(([id, template]) => (
              <option key={id} value={id}>
                {template.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleBankConfirm}
              disabled={!bankOption || isLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded text-sm font-medium hover:bg-yellow-700 disabled:bg-gray-300"
            >
              Confirmar
            </button>
            <button
              onClick={() => {
                setValidationErrors([]);
                setBankOption(null);
                setMonthOption(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm font-medium hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
