import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { DesktopNav } from '../components/DesktopNav';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ApiError, getSupportMessages, postSupportMessage, type SupportMessage } from '../lib/api';

const POLL_MS = 5000;

export default function Support() {
  const { user, authReady } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const m = await getSupportMessages();
      setMessages(m);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    setLoading(true);
    setLoadError(false);
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [authReady, user?.id, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!authReady) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted md:pt-16 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">{t.processing}</p>
        </div>
      </>
    );
  }

  if (!user) {
    return <Navigate to="/auth?return=/support" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const send = async () => {
    const b = text.trim();
    if (!b) return;
    try {
      const msg = await postSupportMessage(b);
      setMessages((prev) => [...prev, msg]);
      setText('');
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) toast.error(t.orderError);
      else toast.error(t.orderError);
    }
  };

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-24 md:pb-8 md:pt-16 flex flex-col">
        <Header title={t.chatSupport} showBack />
        <div className="flex-1 max-w-lg mx-auto w-full px-4 py-3 flex flex-col min-h-[60vh]">
          <p className="text-xs text-muted-foreground mb-2">{t.chatSupportDesc}</p>
          {loadError && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 flex flex-wrap items-center gap-2">
              <span className="flex-1 min-w-0">{t.loadFailed}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 border-amber-300"
                onClick={() => {
                  setLoading(true);
                  void load();
                }}
              >
                {t.tryAgain}
              </Button>
            </div>
          )}
          {loading ? (
            <p className="text-sm text-muted-foreground">{t.processing}</p>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 rounded-xl bg-card text-card-foreground border border-border p-3 min-h-[280px] max-h-[55vh]">
              {messages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">{t.noThreadsYet}</p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.fromAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.fromAdmin
                        ? 'bg-muted/50 text-foreground rounded-tl-sm'
                        : 'bg-red-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {m.orderId && (
                      <p className="text-[10px] opacity-80 mb-0.5">#{m.orderId}</p>
                    )}
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className={`text-[10px] mt-1 ${m.fromAdmin ? 'text-muted-foreground' : 'text-red-100'}`}>
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              className="flex-1 min-h-[44px] max-h-32 rounded-lg border border-border px-3 py-2 text-sm resize-y"
              placeholder={t.supportTypeMessage}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <Button type="button" className="bg-red-600 hover:bg-red-700 shrink-0" onClick={() => void send()}>
              {t.supportSend}
            </Button>
          </div>
          <Link to="/orders" className="text-center text-sm text-red-600 mt-3 underline">
            {t.myOrders}
          </Link>
        </div>
      </div>
    </>
  );
}
