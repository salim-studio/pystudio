import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  HelpCircle, 
  Bug, 
  Zap, 
  Check, 
  Copy, 
  Bot, 
  User, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Language, AppMode } from '../types';
import { translations } from '../translations';
import { safeFetch } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  mode: AppMode;
  currentCode?: string;
  currentError?: any;
  onInsertCodeToCell?: (code: string) => void;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  language,
  mode,
  currentCode = '',
  currentError = null,
  onInsertCodeToCell
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: language === 'ar'
        ? 'مرحباً! أنا معلم بايثون الذكي. كيف يمكنني مساعدتك اليوم في فهم الأكواد أو حل المشكلات البرمجية؟'
        : language === 'fr'
        ? 'Bonjour ! Je suis votre tuteur Python IA. Comment puis-je vous aider aujourd\'hui à comprendre le code ou résoudre des erreurs ?'
        : 'Hello! I am your AI Python Tutor. I can explain code line-by-line, debug error tracebacks, optimize algorithms, or explain statistical formulas. How can I help you today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const t = translations[language];

  if (!isOpen) return null;

  const sendMessage = async (promptText: string, actionType: string = 'general') => {
    if (!promptText.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: promptText }];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const res = await safeFetch<{ response?: string }>('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          code: currentCode,
          error: currentError,
          language,
          mode,
          action: actionType
        })
      }, 15000);

      if (res.ok && res.data?.response) {
        setMessages([...newMessages, { role: 'assistant', content: res.data.response }]);
      } else {
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: res.error || (language === 'ar' 
            ? 'عذراً، حدث انقطاع مؤقت في الاتصال. يمكنك إعادة المحاولة وسأساعدك فوراً!' 
            : 'Apologies, there was a temporary connection issue. Please try again!')
        }]);
      }
    } catch {
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: language === 'ar' 
          ? 'تعذر الاتصال بالمعلم الذكي مؤقتاً. يرجى إعادة المحاولة.' 
          : 'Unable to reach the AI tutor temporarily. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="w-80 sm:w-96 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-full z-20 shrink-0 select-none">
      {/* Header */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-xs text-neutral-900 dark:text-white">
              {t.aiTutor}
            </h2>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
              Powered by Gemini 2.5
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Actions Bar */}
      <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-wrap gap-1 text-[11px]">
        <button
          onClick={() => sendMessage('Please explain the selected code line-by-line and show what each step accomplishes.', 'explain')}
          disabled={loading || !currentCode}
          className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-purple-500 disabled:opacity-40 transition-colors"
        >
          <HelpCircle className="w-3 h-3 text-emerald-500" />
          <span>Explain Code</span>
        </button>

        {currentError && (
          <button
            onClick={() => sendMessage('Please analyze this error and provide the corrected code snippet.', 'debug')}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 hover:bg-red-100 disabled:opacity-40 transition-colors"
          >
            <Bug className="w-3 h-3 text-red-500" />
            <span>Debug Error</span>
          </button>
        )}

        <button
          onClick={() => sendMessage('How can I optimize or improve this code following Python best practices and PEP 8?', 'optimize')}
          disabled={loading || !currentCode}
          className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-purple-500 disabled:opacity-40 transition-colors"
        >
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Optimize</span>
        </button>

        <button
          onClick={() => sendMessage('Give me an interactive hint on what step to take next without giving away the full answer.', 'hint')}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-purple-500 disabled:opacity-40 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span>Get Hint</span>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed space-y-2 select-text ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white font-medium rounded-tr-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800/70 text-neutral-800 dark:text-neutral-200 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.role === 'assistant' && (
                <div className="flex items-center justify-end gap-2 pt-1 text-[10px] text-neutral-400">
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-0.5"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-center text-xs text-neutral-400 italic pl-8">
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1">AI Tutor is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a question about Python..."
            disabled={loading}
            className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
