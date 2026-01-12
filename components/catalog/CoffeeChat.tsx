'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/lib/i18n-utils';
import { useTranslations, useLocale } from 'next-intl';

function useGridHeight() {
  const [height, setHeight] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      const grid = document.getElementById('coffee-grid');
      if (grid) {
        setHeight(grid.offsetHeight);
      }
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    const grid = document.getElementById('coffee-grid');
    if (grid) {
      resizeObserver.observe(grid);
    }

    return () => {
      if (grid) {
        resizeObserver.unobserve(grid);
      }
    };
  }, []);

  return height;
}

type Preferences = {
  regionId?: string;
  roastLevel?: string;
  brewMethodId?: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  question?: string;
  answerOptions?: string[];
  suggestions?: string[];
  recommendations?: {
    name: string;
    slug: string | null;
    reason?: string;
  }[];
  isFinal?: boolean;
};

interface CoffeeChatProps {
  preferences: Preferences;
  onRecommendations?: (slugs: string[]) => void;
}

export function CoffeeChat({ preferences, onRecommendations }: CoffeeChatProps) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const [chatMode, setChatMode] = useState<'easy' | 'advanced'>('easy');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const gridHeight = useGridHeight();

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length]);

  useEffect(() => {
    if (!isStarted && messages.length === 0 && !loading && chatMode === 'easy') {
      handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted, messages.length, chatMode]);

  function handleReset() {
    setMessages([]);
    setInput('');
    setError('');
    setIsStarted(false);
    setShowCustomInput(null);
    onRecommendations?.([]);
  }

  async function handleStart() {
    setIsStarted(true);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          locale,
          chatMode,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`${t('fetchError')}: ${errText}`);
      }

      const data = await res.json();
      const assistant: ChatMessage = {
        role: 'assistant',
        content: data.answer || t('noAnswer'),
        question: data.question,
        answerOptions: data.answerOptions || [],
        suggestions: data.suggestions || [],
        recommendations: data.recommendations || [],
        isFinal: data.isFinal || false,
      };

      setMessages([assistant]);
    } catch (err: any) {
      setError(err?.message || t('failed'));
      setIsStarted(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(answer: string) {
    const userMsg: ChatMessage = { role: 'user', content: answer };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError('');
    setShowCustomInput(null);
    setInput('');

    try {
      const history = [...messages, userMsg].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: answer,
          history,
          preferences,
          locale,
          chatMode,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`${t('fetchError')}: ${errText}`);
      }

      const data = await res.json();
      const assistant: ChatMessage = {
        role: 'assistant',
        content: data.answer || t('noAnswer'),
        question: data.question,
        answerOptions: data.answerOptions || [],
        suggestions: data.suggestions || [],
        recommendations: data.recommendations || [],
        isFinal: data.isFinal || false,
      };

      setMessages((prev) => [...prev, assistant]);
      if (data.isFinal && onRecommendations && data.recommendations) {
        const slugs = data.recommendations
          .map((r: { slug?: string | null }) => r.slug)
          .filter(Boolean) as string[];
        onRecommendations(slugs);
      }
    } catch (err: any) {
      setError(err?.message || t('failed'));
    } finally {
      setLoading(false);
    }
  }

  function handleCustomAnswer(messageIndex: number) {
    if (!input.trim()) return;
    handleAnswer(input.trim());
  }

  async function handleSend() {
    if (!input.trim()) return;
    await handleAnswer(input.trim());
  }

  function handleSuggestion(suggestion: string) {
    handleAnswer(suggestion);
  }

  return (
    <div 
      className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 shadow-sm w-full flex flex-col overflow-hidden"
      style={{ height: gridHeight ? `${gridHeight}px` : '600px' }}
    >
      <div className="flex items-center justify-between mb-4 gap-3 flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-espresso)]">{t('title')}</h2>
          <span className="text-sm text-[var(--color-text-secondary)]">{t('subtitle')}</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-espresso)] hover:border-[var(--color-brown)] transition"
          disabled={loading}
        >
          {t('reset')}
        </button>
      </div>

      <div className="flex mb-4 flex-shrink-0 border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setChatMode('easy')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition text-center ${
            chatMode === 'easy'
              ? 'border-b-2 border-[var(--color-brown)] text-[var(--color-brown)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-espresso)]'
          }`}
          disabled={loading}
        >
          {t('easyChat')}
        </button>
        <button
          type="button"
          onClick={() => setChatMode('advanced')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition text-center ${
            chatMode === 'advanced'
              ? 'border-b-2 border-[var(--color-brown)] text-[var(--color-brown)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-espresso)]'
          }`}
          disabled={loading}
        >
          {t('advancedChat')}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex-shrink-0">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {chatMode === 'advanced' && (
        <div className="mb-4 space-y-3 flex-shrink-0">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('advancedPrompt')}
          </p>
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {(t.raw('advancedSuggestions') as string[]).map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  disabled={loading}
                  className="text-xs px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brown)] hover:bg-[var(--color-cream)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim()) {
                  handleSend();
                }
              }}
              placeholder={t('advancedPlaceholder')}
              disabled={loading}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brown)] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="text-sm px-5 py-2.5 rounded-lg border border-[var(--color-brown)] bg-[var(--color-brown)] text-white hover:bg-[var(--color-espresso)] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {t('send')}
            </button>
          </div>
        </div>
      )}

      <div 
        ref={listRef} 
        className="space-y-4 flex-1 overflow-y-auto min-h-0 scrollbar-visible pr-2"
      >
        {messages.length === 0 && !loading && chatMode === 'easy' && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('tip')}
          </p>
        )}
        {messages.length === 0 && !loading && chatMode === 'advanced' && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('advancedPlaceholder')}
          </p>
        )}

        {messages.map((msg, idx) => {
          if (chatMode === 'advanced' && msg.answerOptions && msg.answerOptions.length > 0 && !msg.isFinal) {
            return null;
          }
          return (
            <div
              key={idx}
              className={`rounded-xl p-3 ${msg.role === 'user' ? 'bg-[var(--color-cream)] text-[var(--color-espresso)]' : 'bg-[var(--color-beige-light)] text-[var(--color-espresso)]'}`}
            >
            <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>

            {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && chatMode === 'advanced' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {msg.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestion(suggestion)}
                    disabled={loading}
                    className="text-xs px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brown)] hover:bg-[var(--color-cream)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {msg.role === 'assistant' && msg.answerOptions && msg.answerOptions.length > 0 && !msg.isFinal && chatMode === 'easy' && (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {msg.answerOptions.map((option, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAnswer(option)}
                      disabled={loading}
                      className="text-sm px-5 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brown)] hover:bg-[var(--color-cream)] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {option}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(idx)}
                    disabled={loading || showCustomInput === idx}
                    className="text-sm px-5 py-2.5 rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brown)] hover:bg-[var(--color-cream)] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {t('customAnswer')}
                  </button>
                </div>
                {showCustomInput === idx && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && input.trim()) {
                          handleCustomAnswer(idx);
                        }
                      }}
                      placeholder={t('customPlaceholder')}
                      disabled={loading}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brown)] disabled:opacity-50"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCustomAnswer(idx)}
                        disabled={loading || !input.trim()}
                        className="flex-1 text-sm px-5 py-2.5 rounded-lg border border-[var(--color-brown)] bg-[var(--color-brown)] text-white hover:bg-[var(--color-espresso)] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {t('send')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomInput(null);
                          setInput('');
                        }}
                        disabled={loading}
                        className="flex-1 text-sm px-5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-cream)] transition disabled:opacity-50 font-medium"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {msg.role === 'assistant' && msg.isFinal && msg.recommendations && msg.recommendations.length > 0 && (
              <div className="mt-3 space-y-3">
                {msg.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <div className="font-semibold text-[var(--color-brown)] mb-1">{rec.name}</div>
                    {rec.reason && <div className="text-sm text-[var(--color-text-secondary)] mb-2">{rec.reason}</div>}
                    {rec.slug && (
                      <Link
                        className="inline-block text-sm px-4 py-2 rounded-full border border-[var(--color-brown)] text-[var(--color-brown)] hover:bg-[var(--color-brown)] hover:text-white transition"
                        href={`/kaffees/${rec.slug}`}
                      >
                        {t('toCoffee')}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
            </div>
          );
        })}

        {loading && (
          <div className="rounded-xl p-3 bg-[var(--color-beige-light)] text-[var(--color-espresso)]">
            <p className="text-sm">{t('loading')}</p>
          </div>
        )}
      </div>
    </div>
  );
}


