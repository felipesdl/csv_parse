"use client";

import React, { useState, useMemo } from "react";
import { BarChart3, Table2, TrendingUp, Database } from "lucide-react";
import { useComparisonStore } from "@/store/comparisonStore";
import { BANK_TEMPLATES } from "@/lib/bankTemplates";
import { ComparativeAnalysis } from "./ComparativeAnalysis";
import { ExtractTablesView } from "./ExtractTablesView";
import { ConsolidationView } from "./ConsolidationView";
import { CompleteDataView } from "./CompleteDataView";

type TabType = "analysis" | "extracts" | "consolidation" | "complete-data";

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: "analysis", label: "Análise Comparativa", icon: <BarChart3 size={18} /> },
  { id: "extracts", label: "Extratos Detalhados", icon: <Table2 size={18} /> },
  { id: "consolidation", label: "Consolidação", icon: <TrendingUp size={18} /> },
  { id: "complete-data", label: "Dados Completos", icon: <Database size={18} /> },
];

interface TabsComparisonViewProps {
  onOpenColumnMapper: () => void;
}

export function TabsComparisonView({ onOpenColumnMapper }: TabsComparisonViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("analysis");
  const { comparedFiles } = useComparisonStore();

  if (!comparedFiles || comparedFiles.length < 2) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 cursor-pointer ${
                activeTab === tab.id ? "text-blue-600 border-blue-600 bg-blue-50" : "text-gray-700 border-transparent hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "analysis" && <ComparativeAnalysis onOpenColumnMapper={onOpenColumnMapper} />}
          {activeTab === "extracts" && <ExtractTablesView />}
          {activeTab === "consolidation" && <ConsolidationView />}
          {activeTab === "complete-data" && <CompleteDataView />}
        </div>
      </div>
    </div>
  );
}
