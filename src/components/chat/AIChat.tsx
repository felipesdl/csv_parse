"use client";

import { useChat } from "ai/react";
import type { Message } from "ai/react";
import { useDataStore } from "@/store/dataStore";
import { Send, Sparkles, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui";
import { useEffect, useRef } from "react";

interface AIChatProps {
  onClose?: () => void;
}

export function AIChat({ onClose }: AIChatProps = {}) {
  const { tableData } = useDataStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      tableData: tableData
        ? {
            bank: tableData.bank,
            month: tableData.month,
            rows: tableData.rows,
            columns: tableData.columns,
          }
        : null,
    },
  });

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sugestões de perguntas
  const suggestions = [
    "Quanto gastei este mês?",
    "Quais são meus 5 maiores gastos?",
    "Identifique padrões nos meus gastos",
    "Há transações duplicadas?",
    "Me dê 3 dicas para economizar",
  ];

  const hasData = tableData && tableData.rows && tableData.rows.length > 0;

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-600" size={24} />
          <h3 className="font-semibold text-gray-900">Assistente Financeiro IA</h3>
        </div>
        <div className="flex items-center gap-3">
          {hasData && <div className="text-xs text-gray-500">📊 {tableData.rows.length} transações</div>}
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition" title="Fechar chat">
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* No data warning */}
        {!hasData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 text-sm">⚠️ Nenhum dado carregado. Faça upload de um arquivo CSV primeiro para usar o chat!</p>
          </div>
        )}

        {/* Welcome message */}
        {messages.length === 0 && hasData && (
          <div className="text-center py-8">
            <div className="mb-4">
              <Sparkles className="mx-auto text-purple-600" size={48} />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Olá! Sou seu assistente financeiro 👋</h4>
            <p className="text-gray-600 mb-6 text-sm">Pergunte qualquer coisa sobre seus dados bancários!</p>
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-xs text-gray-500 font-medium mb-3">💡 Sugestões:</p>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const event = {
                      preventDefault: () => {},
                    } as React.FormEvent;
                    handleInputChange({
                      target: { value: suggestion },
                    } as React.ChangeEvent<HTMLInputElement>);
                    // Pequeno delay para garantir que o input foi atualizado
                    setTimeout(() => handleSubmit(event), 100);
                  }}
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition border border-gray-200 hover:border-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message: Message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-lg ${
                message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900 border border-gray-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              <span className={`text-xs mt-2 block ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                {new Date(message.createdAt || Date.now()).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="text-purple-600 animate-spin" />
                <span className="text-sm text-gray-600">Analisando...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <X className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-red-900 font-medium text-sm">Erro ao processar mensagem</p>
                <p className="text-red-700 text-xs mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 pt-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={hasData ? "Pergunte sobre seus dados..." : "Carregue um CSV primeiro..."}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-500"
            disabled={isLoading || !hasData}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !hasData}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium text-sm"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">💡 Powered by OpenAI GPT-4</p>
      </div>
    </Card>
  );
}
