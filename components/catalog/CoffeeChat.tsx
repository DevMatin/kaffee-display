'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Link } from '@/lib/i18n-utils';
import { useTranslations } from 'next-intl';

type Preferences = {
  regionId?: string;
  roastLevel?: string;
  brewMethodId?: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: {
    name: string;
    slug: string | null;
    reason?: string;
  }[];
};

interface CoffeeChatProps {
  preferences: Preferences;
  onRecommendations?: (slugs: string[]) => void;
}

export function CoffeeChat({ preferences, onRecommendations }: CoffeeChatProps) {
  const t = useTranslations('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);
  const quickPrompts = t.raw('quickPrompts') as string[];

  useEffect(() => {
    // Nur die Chat-Box scrollen, nicht die ganze Seite
    const el = listRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length]);

  function handleReset() {
    setMessages([]);
    setInput('');
    setError('');
    onRecommendations?.([]);
  }

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          preferences,
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
        recommendations: data.recommendations || [],
      };

      setMessages((prev) => [...prev, assistant]);
      if (onRecommendations) {
        const slugs = (data.recommendations || [])
          .map((r: { slug?: string | null }) => r.slug)
          .filter(Boolean) as string[];
        onRecommendations(slugs);
      }
      setInput('');
    } catch (err: any) {
      setError(err?.message || t('failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 shadow-sm sticky top-6">
      <div className="flex items-center justify-between mb-4 gap-3">
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

      <div className="space-y-3 mb-4">
        <Textarea
          value={input}
          onChange={setInput}
          rows={4}
          placeholder={t('placeholder')}
        />
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => setInput(text)}
              className="text-xs px-3 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-cream)] hover:border-[var(--color-brown)] transition"
            >
              {text}
            </button>
          ))}
        </div>
        <Button onClick={handleSend} disabled={loading}>
          {loading ? t('loading') : t('send')}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div ref={listRef} className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('tip')}
          </p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-3 ${msg.role === 'user' ? 'bg-[var(--color-cream)] text-[var(--color-espresso)]' : 'bg-[var(--color-beige-light)] text-[var(--color-espresso)]'}`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>

            {msg.role === 'assistant' && msg.recommendations && msg.recommendations.length > 0 && (
              <div className="mt-3 space-y-2">
                {msg.recommendations.map((rec, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-semibold text-[var(--color-brown)]">{rec.name}</div>
                    {rec.reason && <div className="text-[var(--color-text-secondary)]">{rec.reason}</div>}
                    {rec.slug && (
                      <Link
                        className="text-[var(--color-brown)] underline"
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
        ))}
      </div>
    </div>
  );
}


