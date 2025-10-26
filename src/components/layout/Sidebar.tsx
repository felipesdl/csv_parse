"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: <BarChart3 size={20} />,
    description: "Importar e gerenciar dados bancários",
  },
  {
    id: "comparison",
    label: "Comparação",
    href: "/comparison",
    icon: <TrendingUp size={20} />,
    description: "Comparar dados entre diferentes bancos",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white border-r border-slate-700 flex flex-col h-full transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Toggle Button */}
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <div className={`w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0`}>
          ☕
        </div>
        <button onClick={toggleSidebar} className="p-1 hover:bg-slate-700 rounded transition cursor-pointer" title={sidebarOpen ? "Minimizar" : "Expandir"}>
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
          return (
            <Link key={item.id} href={item.href}>
              <button
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                  isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
                title={sidebarOpen ? "" : item.label}
              >
                <span className={`flex-shrink-0 mt-0.5 ${isActive ? "text-blue-200" : "group-hover:text-blue-400"}`}>{item.icon}</span>
                {sidebarOpen && (
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.description && (
                      <span className={`text-xs mt-0.5 ${isActive ? "text-blue-100" : "text-slate-400 group-hover:text-slate-300"}`}>{item.description}</span>
                    )}
                  </div>
                )}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-700 bg-slate-900/50">{sidebarOpen && <p className="text-xs text-slate-400 text-center">v1.0.0</p>}</div>
    </aside>
  );
}
