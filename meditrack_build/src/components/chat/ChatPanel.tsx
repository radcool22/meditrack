'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, MessageSquare, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatPanelProps {
  reportId: string;
  isReady: boolean;
}

export default function ChatPanel({ reportId, isReady }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load existing messages
  useEffect(() => {
    if (!isReady) return;

    async function loadMessages() {
      try {
        const res = await fetch(`/api/chat?reportId=${reportId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, [reportId, isReady]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessageType = {
      id: `temp-${Date.now()}`,
      report_id: reportId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, message: userMessage }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      console.error('Chat error:', err);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          report_id: reportId,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!isReady) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <div className="text-center py-6">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">
            Chat will be available after report analysis
          </p>
        </div>
      </Card>
    );
  }

  const quickQuestions = [
    'Is this report normal?',
    'What should I do next?',
    'Is this dangerous?',
    'Explain in simple terms',
  ];

  return (
    <Card padding="none" className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        <Bot className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-sm text-slate-800">
          Ask about this report
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-blue-100 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">
              Ask me anything about your report
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-1.5 rounded-full text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-100'
                    : 'bg-slate-100'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-blue-600" />
                ) : (
                  <Bot className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-md'
                    : 'bg-slate-100 text-slate-700 rounded-tl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-slate-600" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-4 py-3 border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your report..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-200 focus:border-blue-500 transition-all"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </Card>
  );
}
