"use client";

import React from "react";
import { Copy, Download, Trash2, Filter } from "lucide-react";
import { Button } from "../ui";

interface TableControlsProps {
  selectedCount: number;
  hasFilters: boolean;
  filterCount: number;
  onCopy: () => void;
  onExport: () => void;
  onDelete: () => void;
  onFilters: () => void;
}

export function TableControls({ selectedCount, hasFilters, filterCount, onCopy, onExport, onDelete, onFilters }: TableControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {selectedCount > 0 && (
        <div className="flex gap-2 items-center px-3 py-2 bg-blue-50 rounded text-sm text-blue-800 border border-blue-200">
          <span className="font-medium">{selectedCount} linha(s)</span>
          <Button variant="danger" size="sm" onClick={onDelete} className="!px-2 !py-1">
            <Trash2 size={14} />
          </Button>
        </div>
      )}
      <Button variant="primary" size="md" onClick={onCopy} className="gap-2">
        <Copy size={18} />
        Copiar
      </Button>
      <Button variant="success" size="md" onClick={onExport} className="gap-2">
        <Download size={18} />
        Exportar CSV
      </Button>
      <Button variant={hasFilters ? "primary" : "secondary"} size="md" onClick={onFilters} className="gap-2">
        <Filter size={18} />
        Filtros {hasFilters && `(${filterCount})`}
      </Button>
    </div>
  );
}
