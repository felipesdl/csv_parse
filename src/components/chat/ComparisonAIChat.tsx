"use client";

import { useChat } from "ai/react";
import type { Message } from "ai/react";
import { useComparisonStore } from "@/store/comparisonStore";
import { Send, Sparkles, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ComparisonAIChatProps {
  onClose?: () => void;
}

export function ComparisonAIChat({ onClose }: ComparisonAIChatProps = {}) {
  const { comparedFiles, commonColumns } = useComparisonStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasData = comparedFiles && comparedFiles.length > 0;

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
    api: "/api/chat/comparison",
    id: `comparison-chat-${comparedFiles?.length || 0}`, // Force re-render when files change
    body: {
      comparisonData: hasData
        ? {
            files: comparedFiles,
            commonColumns: commonColumns,
          }
        : null,
    },
  });

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sugestões de perguntas para comparação
  const suggestions = [
    "Compare os gastos totais entre os bancos",
    "Qual banco teve mais despesas?",
    "Identifique transações duplicadas entre as contas",
    "Compare as categorias de gastos",
    "Mostre diferenças nos padrões de consumo",
  ];

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-600" size={24} />
          <h3 className="font-semibold text-gray-900">Chat IA - Comparação</h3>
        </div>
        <div className="flex items-center gap-3">
          {hasData && (
            <div className="text-xs text-gray-500">
              🏦 {comparedFiles.length} {comparedFiles.length === 1 ? "arquivo" : "arquivos"}
            </div>
          )}
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
            <p className="text-yellow-800 text-sm">⚠️ Nenhum arquivo para comparar. Adicione pelo menos um arquivo CSV na página de comparação!</p>
          </div>
        )}

        {/* Welcome message */}
        {messages.length === 0 && hasData && (
          <div className="text-center py-8">
            <div className="mb-4">
              <Sparkles className="mx-auto text-purple-600" size={48} />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Olá! 👋</h4>
            <p className="text-gray-600 text-sm mb-6">
              Estou analisando <strong>{comparedFiles.length} arquivo(s)</strong> para comparação.
              <br />
              Faça perguntas sobre as diferenças entre eles!
            </p>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium mb-3">💡 Sugestões:</p>
              <div className="flex flex-col gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(suggestion);
                      // Enviar automaticamente após um pequeno delay para garantir que o input foi atualizado
                      setTimeout(() => {
                        const form = document.querySelector('form') as HTMLFormElement;
                        if (form) {
                          form.requestSubmit();
                        }
                      }, 50);
                    }}
                    className="text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm transition cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((message: Message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] px-4 py-3 rounded-lg ${
                message.role === "user" ? "bg-purple-600 text-white" : "bg-gray-100 border border-gray-200 text-gray-900"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="text-sm prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-table:my-3 overflow-x-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Loading message */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="text-purple-600 animate-spin" />
                <span className="text-sm text-gray-600">Comparando dados...</span>
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
            placeholder={hasData ? "Compare os dados dos arquivos..." : "Adicione arquivos primeiro..."}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-500"
            disabled={isLoading || !hasData}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !hasData}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium text-sm"
          >
            <Send size={18} />
            Enviar
          </button>
        </form>
      </div>
    </Card>
  );
}
