"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Check, Plus, Trash2, X } from "lucide-react";
import { useComparisonStore, type ColumnMapping, type ComparedFile } from "@/store/comparisonStore";
import { formatBankReference } from "@/utils/referenceFormatter";

interface ColumnMapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ColumnMapper({ isOpen, onClose }: ColumnMapperProps) {
  const { comparedFiles, commonColumns, columnMappings, setColumnMapping } = useComparisonStore();
  const [localMapping, setLocalMapping] = useState<ColumnMapping>(columnMappings);
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // Auto-detect and auto-save column mappings
  useEffect(() => {
    // Filtrar apenas arquivos ativos para auto-mapeamento
    const activeFiles = comparedFiles.filter((f) => f.isActive);

    if (activeFiles.length < 2) {
      setLocalMapping(columnMappings);
      return;
    }

    const autoMapping: ColumnMapping = {};
    const processedPairs = new Set<string>();

    // Para cada arquivo ativo, tentar encontrar correspondências
    for (const file of activeFiles) {
      for (const column of file.columns) {
        const columnLower = column.toLowerCase();

        // Procurar por coluna similar em outros arquivos ativos
        for (const otherFile of activeFiles) {
          if (otherFile.id === file.id) continue;

          for (const otherColumn of otherFile.columns) {
            const otherLower = otherColumn.toLowerCase();

            // Estratégia de matching: remover espaços, pontuação e comparar
            const normalized1 = columnLower.replace(/[^\w]/g, "");
            const normalized2 = otherLower.replace(/[^\w]/g, "");

            // Se tiverem similaridade alta ou estiverem na lista comum
            if (
              normalized1 === normalized2 ||
              (normalized1.includes("data") && normalized2.includes("data")) ||
              (normalized1.includes("valor") && normalized2.includes("valor")) ||
              (normalized1.includes("descri") && normalized2.includes("descri"))
            ) {
              // Criar uma chave única para este par de colunas para evitar duplicação
              const pairKey = [file.id, column, otherFile.id, otherColumn].sort().join("|");

              if (!processedPairs.has(pairKey)) {
                processedPairs.add(pairKey);

                // Use a normalized standardName that's consistent across files
                // This ensures "Data" and "Data Lançamento" map to the same group
                const standardName = column.toLowerCase().includes("lancamento")
                  ? "Data Lançamento"
                  : otherColumn.toLowerCase().includes("lancamento")
                  ? "Data Lançamento"
                  : column;

                if (!autoMapping[standardName]) {
                  autoMapping[standardName] = {};
                }
                autoMapping[standardName][file.id] = column;
                autoMapping[standardName][otherFile.id] = otherColumn;
              }
            }
          }
        }
      }
    }

    setLocalMapping(autoMapping);
    // Auto-save the mapping immediately - no need for manual confirmation
    setColumnMapping(autoMapping);
  }, [comparedFiles, setColumnMapping]);

  const handleColumnSelect = (standardName: string, fileId: string, actualColumn: string) => {
    // If we're adding a new mapping, check if this column is already mapped elsewhere
    // and consolidate under the first mapped name if applicable
    setLocalMapping((prev) => {
      const newMapping = { ...prev };

      // Check if this column is already mapped under a different standardName
      let existingStandardName: string | null = null;
      for (const [name, fileMap] of Object.entries(newMapping)) {
        if (fileMap[fileId] === actualColumn) {
          existingStandardName = name;
          break;
        }
      }

      // If the column is already mapped, don't create a duplicate mapping
      if (existingStandardName && existingStandardName !== standardName) {
        // Remove the old standardName if all columns have been reassigned
        if (Object.keys(newMapping[standardName] || {}).length === 0) {
          delete newMapping[standardName];
        }

        // Add to existing mapping instead
        if (!newMapping[existingStandardName]) {
          newMapping[existingStandardName] = {};
        }
        newMapping[existingStandardName][fileId] = actualColumn;
      } else {
        // Normal case: add to the mapping
        if (!newMapping[standardName]) {
          newMapping[standardName] = {};
        }
        newMapping[standardName][fileId] = actualColumn;
      }

      return newMapping;
    });
  };

  const handleRemoveMapping = (standardName: string) => {
    setLocalMapping((prev) => {
      const newMapping = { ...prev };
      delete newMapping[standardName];
      return newMapping;
    });
    setExpandedColumns((prev) => {
      const next = new Set(prev);
      next.delete(standardName);
      return next;
    });
  };

  // Auto-save manual changes to mappings
  useEffect(() => {
    // Only save if localMapping is different from stored columnMappings
    if (JSON.stringify(localMapping) !== JSON.stringify(columnMappings)) {
      setColumnMapping(localMapping);
    }
  }, [localMapping, columnMappings, setColumnMapping]);
  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;

    setLocalMapping((prev) => {
      const newMapping = { ...prev };
      newMapping[newColumnName] = {};
      return newMapping;
    });

    setExpandedColumns((prev) => {
      const next = new Set(prev);
      next.add(newColumnName);
      return next;
    });

    setNewColumnName("");
    setShowAddColumn(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Mapeamento de Colunas</h2>
          <p className="text-sm text-gray-600 mt-2">Configure como as colunas de diferentes bancos devem ser comparadas</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {comparedFiles.length < 2 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-900">Adicione pelo menos 2 arquivos para configurar mapeamento de colunas</p>
            </div>
          ) : (
            <>
              {/* Auto-detected mappings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Colunas Detectadas</h3>
                  <button
                    onClick={() => setShowAddColumn(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition cursor-pointer"
                  >
                    <Plus size={16} />
                    Adicionar Coluna
                  </button>
                </div>

                {/* Add Column Modal */}
                {showAddColumn && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-sm font-medium text-blue-900">Digite o nome da coluna a mapear:</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddColumn();
                          }
                        }}
                        placeholder="Ex: Referência, Categoria, Status..."
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900 placeholder-gray-500"
                        autoFocus
                      />
                      <button
                        onClick={handleAddColumn}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition cursor-pointer"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setShowAddColumn(false);
                          setNewColumnName("");
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium transition cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {Object.entries(localMapping).map(([standardName, fileMapping]) => (
                  <div key={standardName} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between p-4 hover:bg-gray-100 transition">
                      <button
                        onClick={() => {
                          setExpandedColumns((prev) => {
                            const next = new Set(prev);
                            if (next.has(standardName)) {
                              next.delete(standardName);
                            } else {
                              next.add(standardName);
                            }
                            return next;
                          });
                        }}
                        className="flex-1 text-left flex items-center gap-3 cursor-pointer"
                      >
                        <ChevronDown size={20} className={`transition flex-shrink-0 ${expandedColumns.has(standardName) ? "rotate-180" : ""}`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{standardName}</p>
                          <p className="text-xs text-gray-600">
                            Mapeado em {Object.keys(fileMapping).length} de {comparedFiles.length} arquivos
                            {comparedFiles.filter((f) => f.isActive).length < comparedFiles.length && (
                              <span className="text-gray-500"> ({comparedFiles.filter((f) => f.isActive).length} ativos)</span>
                            )}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMapping(standardName);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition cursor-pointer flex-shrink-0 ml-2"
                        title="Remover este mapeamento"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {expandedColumns.has(standardName) && (
                      <div className="mt-0 space-y-3 border-t p-4">
                        {comparedFiles.map((file) => {
                          // Get columns already mapped in other groups for this file
                          const mappedInOthers = new Set<string>();
                          for (const [otherStandardName, fileMap] of Object.entries(localMapping)) {
                            if (otherStandardName !== standardName && fileMap[file.id]) {
                              mappedInOthers.add(fileMap[file.id]);
                            }
                          }

                          // Filter available columns
                          const availableColumns = file.columns.filter((col) => !mappedInOthers.has(col) || fileMapping[file.id] === col);

                          return (
                            <div key={file.id} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                {formatBankReference(file.bankId, file.month || "")}
                                {!file.isActive && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Inativo</span>}
                              </label>
                              <select
                                value={fileMapping[file.id] || ""}
                                onChange={(e) => handleColumnSelect(standardName, file.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900"
                              >
                                <option value="">Selecione uma coluna</option>
                                {availableColumns.map((col) => (
                                  <option key={col} value={col}>
                                    {col}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* All available columns */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Todas as colunas disponíveis:</strong>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  {comparedFiles.map((file) => (
                    <div key={file.id}>
                      <p className="text-xs font-semibold text-blue-700 mb-2">{formatBankReference(file.bankId, file.month || "")}</p>
                      <ul className="text-xs text-blue-600 space-y-1">
                        {file.columns.map((col) => (
                          <li key={col}>• {col}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition cursor-pointer">
            Fechar
          </button>
          <div className="text-xs text-green-600 font-medium flex items-center gap-1">✓ Mapeamento aplicado automaticamente</div>
        </div>
      </div>
    </div>
  );
}
