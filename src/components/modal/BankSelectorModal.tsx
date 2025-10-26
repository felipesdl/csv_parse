"use client";

import React, { useState } from "react";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";
import { Modal } from "@/components/modal";

export interface BankSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bankId: string) => void;
  suggestedBank?: string | null;
  fileName: string;
}

export function BankSelectorModal({ isOpen, onClose, onConfirm, suggestedBank, fileName }: BankSelectorProps) {
  const [selectedBank, setSelectedBank] = useState(suggestedBank || "");

  const banks = Object.entries(BANK_TEMPLATES)
    .filter(([id]) => id !== "generic")
    .map(([id, template]) => ({
      id,
      name: template.name,
    }));

  const handleConfirm = () => {
    if (selectedBank) {
      onConfirm(selectedBank);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Identificar Banco" size="lg">
      <div className="p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-3">
            <strong>Arquivo:</strong> {fileName}
          </p>
          {suggestedBank && (
            <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded mb-4">
              ✓ Banco detectado: <strong>{BANK_TEMPLATES[suggestedBank]?.name || "Desconhecido"}</strong>
            </p>
          )}
          <p className="text-sm text-gray-700 font-medium mb-3">{suggestedBank ? "Confirmar banco ou selecionar outro:" : "Selecione o banco:"}</p>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {banks.map((bank) => (
            <label
              key={bank.id}
              className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50"
              style={{
                borderColor: selectedBank === bank.id ? "#2563eb" : "#e5e7eb",
                backgroundColor: selectedBank === bank.id ? "#eff6ff" : "white",
              }}
            >
              <input
                type="radio"
                name="bank"
                value={bank.id}
                checked={selectedBank === bank.id}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-4 h-4"
              />
              <span className="ml-3 text-gray-900 font-medium">{bank.name}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 font-medium transition cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedBank}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition cursor-pointer"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}
