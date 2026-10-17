'use client';
// Floating "Ask Pip" button + chat panel, mounted once by the app shell on every page.
// On a lesson page it sends the lesson id so Pip answers about that lesson.

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, RotateCcw, Send, Square, X } from 'lucide-react';
import type { ShellAddonProps } from '@/core/types';
import { Button, cn, Markdown, Pip } from '@/components/ui';
import { getTutorLessonTitle } from '../actions';
import { lessonIdFromPath, MAX_HISTORY, MAX_MESSAGE_CHARS, QUICK_PROMPTS } from '../shared';

interface ChatItem {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  stopped?: boolean;
}

const PANEL_ID = 'pip-tutor-panel';

export function TutorLauncher({ user }: ShellAddonProps) {
  const pathname = usePathname();
  const lessonId = lessonIdFromPath(pathname);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // lessonId → title (null = no title available for this lesson)
  const [titles, setTitles] = useState<Record<string, string | null>>({});

  const nextId = useRef(1);
  const abortRef = useRef<AbortController | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const lessonTitle = lessonId ? titles[lessonId] : undefined;

  // Fetch the lesson title for the context chip once per lesson, only when the panel is open.
  useEffect(() => {
    if (!open || !lessonId || lessonId in titles) return;
    let cancelled = false;
    getTutorLessonTitle(lessonId)
      .then((res) => {
        if (!cancelled) setTitles((t) => ({ ...t, [lessonId]: res.ok && res.data ? res.data.title : null }));
      })
      .catch(() => {
        if (!cancelled) setTitles((t) => ({ ...t, [lessonId]: null }));
      });
    return () => {
      cancelled = true;
    };
  }, [open, lessonId, titles]);

  // Focus management: into the input on open, back to the launcher on close.
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  // Cancel any running stream when the shell unmounts (e.g. logout).
  useEffect(() => () => abortRef.current?.abort(), []);

  function newId() {
    return nextId.current++;
  }

  async function send(text: string) {
    const question = text.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!question || streaming) return;
    setError(null);
    setInput('');

    const userItem: ChatItem = { id: newId(), role: 'user', content: question };
    const replyId = newId();
    const history = [...messages, userItem]
      .filter((m) => m.content.trim().length > 0)
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
    setMessages((prev) => [...prev, userItem, { id: replyId, role: 'assistant', content: '' }]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const appendToReply = (chunk: string) =>
      setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, content: m.content + chunk } : m)));

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, ...(lessonId ? { lessonId } : {}) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? 'Pip could not answer just now. Try again in a moment.');
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        appendToReply(decoder.decode(value, { stream: true }));
      }
      appendToReply(decoder.decode());
    } catch (err) {
      if (controller.signal.aborted) {
        // Keep whatever arrived and mark it as stopped; drop an empty bubble.
        setMessages((prev) =>
          prev
            .map((m) => (m.id === replyId ? { ...m, stopped: true } : m))
            .filter((m) => m.id !== replyId || m.content.length > 0),
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== replyId && m.id !== userItem.id));
        setInput(question);
        setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setStreaming(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function resetChat() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  }

  function onPanelKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
    }
  }

  const last = messages.at(-1);
  const isThinking = streaming && last?.role === 'assistant' && last.content.length === 0;
  const showChips = !streaming;
  const firstName = user.name.split(' ')[0] || 'there';

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-haspopup="dialog"
        className={cn(
          'fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-pill border-2 border-line bg-mint py-1.5 pr-4 pl-1.5',
          'font-display font-semibold shadow-sticker transition-transform hover:-translate-y-0.5 hover:shadow-sticker-lg',
          'active:translate-y-0.5 active:shadow-none sm:right-6 sm:bottom-6',
          open && 'hidden',
        )}
      >
        <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-line bg-paper" aria-hidden>
          <Pip size={30} mood="happy" />
        </span>
        Ask Pip
      </button>

      {open ? (
        <section
          id={PANEL_ID}
          role="dialog"
          aria-modal="false"
          aria-labelledby="pip-tutor-title"
          onKeyDown={onPanelKeyDown}
          className={cn(
            'fixed inset-0 z-50 flex flex-col bg-cream animate-pop',
            'sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(40rem,calc(100vh-3rem))] sm:w-[26rem]',
            'sm:rounded-blob sm:border-2 sm:border-line sm:shadow-sticker-lg',
          )}
        >
          <header className="flex items-center gap-2 border-b-2 border-line bg-mint-soft px-3 py-2 sm:rounded-t-blob">
            <span aria-hidden>
              <Pip size={40} mood={streaming ? 'think' : 'happy'} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="pip-tutor-title" className="font-display text-lg leading-tight font-bold">
                Ask Pip
              </h2>
              <p className="truncate text-xs text-ink-soft">Your study buddy. Hints, not answers.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetChat} disabled={messages.length === 0} aria-label="Start a new chat">
              <RotateCcw className="h-4 w-4" aria-hidden />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Close Pip (Esc)">
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </header>

          {lessonId && lessonTitle !== null ? (
            <div className="border-b-2 border-line/20 px-3 py-2">
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-pill border-2 border-line bg-butter-soft px-2.5 py-0.5 text-xs font-semibold">
                <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">Talking about: {lessonTitle ?? 'this lesson'}</span>
              </span>
            </div>
          ) : null}

          <div ref={logRef} role="log" aria-label="Conversation with Pip" className="flex-1 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                <span aria-hidden>
                  <Pip size={72} mood="happy" />
                </span>
                <p className="font-display text-lg font-bold">Hi {firstName}, what are you stuck on?</p>
                <p className="text-sm text-ink-soft">
                  {lessonId
                    ? 'Ask anything about this lesson, or tap a quick question below.'
                    : 'Ask about anything you are learning. Open a lesson and I will know what you are reading.'}
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {messages.map((m) =>
                  m.role === 'user' ? (
                    <li key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-blob rounded-br-md border-2 border-line bg-sky-soft px-3 py-2 text-sm whitespace-pre-wrap">
                        <span className="sr-only">You: </span>
                        {m.content}
                      </div>
                    </li>
                  ) : (
                    <li key={m.id} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1">
                        <Pip size={28} mood={m.content ? 'happy' : 'think'} />
                      </span>
                      <div className="min-w-0 max-w-[85%] rounded-blob rounded-tl-md border-2 border-line bg-paper px-3 py-2 shadow-sticker-sm">
                        <span className="sr-only">Pip: </span>
                        {m.content ? (
                          <Markdown className="text-sm">{m.content}</Markdown>
                        ) : (
                          <TypingDots />
                        )}
                        {m.stopped ? <p className="mt-1 text-xs font-semibold text-ink-soft">Stopped</p> : null}
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>

          <div role="status" className="sr-only">
            {isThinking ? 'Pip is thinking' : streaming ? 'Pip is typing' : ''}
          </div>

          <div className="border-t-2 border-line bg-paper px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:rounded-b-blob">
            {error ? (
              <p role="alert" className="mb-2 rounded-xl border-2 border-line bg-coral-soft px-3 py-1.5 text-sm font-semibold text-coral-deep">
                {error}
              </p>
            ) : null}
            {showChips ? (
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1" aria-label="Quick questions" role="group">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    className="shrink-0 rounded-pill border-2 border-line bg-butter-soft px-2.5 py-1 text-xs font-semibold hover:bg-butter"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
            <form onSubmit={onSubmit} className="flex items-end gap-2">
              <label htmlFor="pip-tutor-input" className="sr-only">
                Message Pip
              </label>
              <textarea
                id="pip-tutor-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKeyDown}
                rows={2}
                maxLength={MAX_MESSAGE_CHARS}
                placeholder="Ask a question…"
                className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border-2 border-line bg-paper px-3 py-2 text-sm focus:ring-4 focus:ring-sky/50 focus:outline-none"
              />
              {streaming ? (
                <Button variant="secondary" onClick={stop} aria-label="Stop Pip's answer">
                  <Square className="h-4 w-4" aria-hidden /> Stop
                </Button>
              ) : (
                <Button type="submit" variant="primary" disabled={input.trim().length === 0} aria-label="Send message">
                  <Send className="h-4 w-4" aria-hidden />
                </Button>
              )}
            </form>
            <p className="mt-1.5 text-[0.7rem] text-ink-soft">Enter to send, Shift+Enter for a new line, Esc to close.</p>
          </div>
        </section>
      ) : null}
    </>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-2 py-1 text-sm text-ink-soft">
      <span className="flex gap-1" aria-hidden>
        <span className="h-2 w-2 animate-bounce rounded-full bg-mint-deep [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-mint-deep [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-mint-deep" />
      </span>
      Pip is thinking…
    </span>
  );
}
