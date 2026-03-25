import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ApiError, getSupportMessages, postSupportMessage, type SupportMessage } from '../lib/api';
import { toast } from 'sonner';

const POLL_MS = 5000;

export function ChatWidget() {
  const { user, authReady } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-support-chat', handleOpen);
    return () => window.removeEventListener('open-support-chat', handleOpen);
  }, []);

  const load = async () => {
    try {
      const m = await getSupportMessages();
      setMessages(m);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady || !user || user.role === 'admin' || !isOpen) return;
    setLoading(true);
    setLoadError(false);
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [authReady, user?.id, user?.role, isOpen]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isOpen]);

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

  if (!authReady || !user || user.role === 'admin') return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-4 md:bottom-24 md:right-8 w-80 md:w-96 bg-card text-card-foreground shadow-2xl rounded-3xl overflow-hidden z-50 ring-1 ring-border/50 flex flex-col h-[500px] max-h-[70vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">{t.chatSupport}</h3>
                  <p className="text-[10px] text-red-50">{t.chatSupportDesc}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {loadError && (
                <div className="text-xstext-amber-900 bg-amber-50 p-2 rounded-xl text-center border border-amber-200 shadow-sm">
                  {t.loadFailed}
                </div>
              )}
              {loading && !loadError && (
                <p className="text-xs text-muted-foreground text-center py-4">{t.processing}</p>
              )}
              {!loading && !loadError && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                  <MessageCircle className="w-10 h-10" />
                  <p className="text-sm">{t.noThreadsYet}</p>
                </div>
              )}
              {messages.map((m) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={m.id}
                  className={`flex ${m.fromAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      m.fromAdmin
                        ? 'bg-card border border-border text-foreground rounded-tl-sm'
                        : 'bg-red-600 border border-red-700 text-white rounded-tr-sm'
                    }`}
                  >
                    {m.orderId && <p className="text-[10px] opacity-70 mb-0.5 font-medium">#{m.orderId}</p>}
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className={`text-[9px] mt-1 font-medium ${m.fromAdmin ? 'text-muted-foreground/70' : 'text-red-100/70'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-card border-t border-border flex items-end gap-2 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <textarea
                className="flex-1 max-h-32 min-h-[44px] rounded-2xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 bg-muted/50 resize-none transition-all"
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
              <button
                onClick={() => void send()}
                disabled={!text.trim()}
                className="w-11 h-11 shrink-0 bg-red-600 hover:bg-red-700 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-all shadow-md shadow-red-600/20"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-28 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-red-600 to-red-500 text-white rounded-full shadow-lg shadow-red-600/30 flex items-center justify-center z-40 ring-4 ring-background"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
