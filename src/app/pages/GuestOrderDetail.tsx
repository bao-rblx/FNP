import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { MapPin, Clock, CreditCard, CheckCircle2, Bell, Copy, Check, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { BackButton } from '../components/BackButton';
import { DesktopNav } from '../components/DesktopNav';
import { Button } from '../components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { products } from '../data/products';
import { getGuestOrder, ApiError, type ApiOrder } from '../lib/api';
import type { CartItem, Order } from '../data/products';

function toOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    items: o.items as CartItem[],
    total: o.total,
    status: o.status as Order['status'],
    createdAt: new Date(o.createdAt),
    estimatedTime: o.estimatedTime,
    deliveryAddress: o.deliveryAddress,
    pickupLocation: o.pickupLocation,
    paymentMethod: o.paymentMethod,
    cancelReason: o.cancelReason,
    notifications: o.notifications,
    guestName: o.guestName,
    guestPhone: o.guestPhone,
  };
}

export default function GuestOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); setOrder(null); return; }
    let cancelled = false; setOrder(null); setLoading(true);
    getGuestOrder(id)
      .then((o) => { if (!cancelled) setOrder(toOrder(o)); })
      .catch((e) => { if (!cancelled) setOrder(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'processing': return t.processing_status;
      case 'ready': return t.ready;
      case 'completed': return t.completed;
      case 'cancelled': return t.cancelled;
      default: return status;
    }
  };

  const copyToClipboard = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success(t.copiedToClipboard);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted pb-20 md:pt-16">
          <Header title={t.guestOrderDetail} showBack />
          <div className="max-w-md mx-auto px-4 pt-20 text-center text-muted-foreground text-sm">{t.processing}</div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted pb-20 md:pt-16">
          <Header title={t.guestOrderDetail} showBack />
          <div className="max-w-md mx-auto px-4 pt-20 text-center space-y-4">
            <p className="text-muted-foreground">{t.guestOrderNotFound}</p>
            <Link to="/orders" className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold">{t.guestOrderLookupBtn}</Link>
          </div>
        </div>
      </>
    );
  }

  const statusSteps = [
    { label: t.orderStepPlaced, completed: true },
    { label: t.processing_status, completed: ['processing', 'ready', 'completed'].includes(order.status) },
    { label: t.ready, completed: ['ready', 'completed'].includes(order.status) },
    { label: t.completed, completed: order.status === 'completed' },
  ];

  const itemSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const payLabel = order.paymentMethod === 'cash' ? t.cash : t.cardPayment;

  return (
    <div className="min-h-screen bg-muted pb-36 md:pb-12 md:pt-16">
      <DesktopNav />
      <Header title={t.guestOrderDetail} showBack />

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <BackButton />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{t.guestOrderDetail}</p>
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-xl md:text-2xl tracking-tight">{order.id}</h1>
              <button
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                title={t.copyOrderId}
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{order.createdAt.toLocaleString('vi-VN')}</p>
          </div>
          <span className={`self-start md:self-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-border/50">
              <h2 className="font-bold text-base mb-5 tracking-tight">{t.orderStatus}</h2>
              <div className="relative">
                {order.status === 'cancelled' ? (
                   <div className="flex items-start mb-4">
                     <div className="mr-4"><div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-600 text-white"><X className="w-5 h-5" /></div></div>
                     <div className="pt-1"><p className="font-medium text-red-600">{t.cancelled}</p></div>
                   </div>
                ) : statusSteps.map((step, index) => {
                  const isActive = step.completed && (index === statusSteps.length - 1 || !statusSteps[index + 1].completed);
                  return (
                    <div key={step.label} className="flex items-start mb-4 last:mb-0">
                      <div className="relative flex flex-col items-center mr-4">
                        <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-red-600 text-white' : 'bg-accent text-gray-400'}`}>
                          {isActive && <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-75"></div>}
                          <div className="relative z-10 w-full h-full rounded-full flex items-center justify-center bg-[inherit]">
                            {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 bg-gray-400 rounded-full" />}
                          </div>
                        </div>
                        {index < statusSteps.length - 1 && <div className={`w-0.5 h-8 ${step.completed && statusSteps[index + 1].completed ? 'bg-red-600' : 'bg-accent'}`} />}
                      </div>
                      <div className="flex-1 pt-1"><p className={`font-medium ${step.completed ? 'text-foreground' : 'text-gray-400'}`}>{step.label}</p></div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {order.notifications && order.notifications.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mb-4"><Bell className="w-5 h-5" />{t.orderUpdatesFromStore}</div>
                <ul className="space-y-3 text-sm">
                  {order.notifications.map((n) => (
                    <li key={n.id} className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-amber-100">
                      <p className="font-medium">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm ring-1 ring-border/50 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2.5 rounded-xl"><User className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="font-bold text-sm">{t.customerInfo}</p>
                    <p className="text-sm text-muted-foreground">{order.guestName || t.guestName} - {order.guestPhone || t.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-border/50">
                  <div className="bg-red-100 p-2.5 rounded-xl"><MapPin className="w-5 h-5 text-red-600" /></div>
                  <div>
                    <p className="font-bold text-sm">{order.pickupLocation ? t.pickup : t.delivery}</p>
                    <p className="text-sm text-muted-foreground">{order.pickupLocation || order.deliveryAddress}</p>
                  </div>
                </div>
                {order.estimatedTime && (
                  <div className="flex items-start gap-4 pt-4 border-t border-border/50">
                    <div className="bg-green-100 p-2.5 rounded-xl"><Clock className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <p className="font-bold text-sm">{t.estimatedTime}</p>
                      <p className="text-sm text-muted-foreground">{order.estimatedTime}</p>
                    </div>
                  </div>
                )}
              </motion.div>
          </div>

          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-border/50">
              <h2 className="font-bold text-base mb-5 tracking-tight">{t.orderSummary}</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 bg-muted/30 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{language === "en" ? (item.nameEn || products.find(p => p.id === item.id)?.nameEn || item.name) : item.name}</p>
                      <p className="text-xs text-muted-foreground">{t.quantity}: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.subtotal}</span>
                  <span>{formatPrice(itemSubtotal)}</span>
                </div>
                {order.total > itemSubtotal && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.shippingFee}</span>
                    <span className="text-red-600">+{formatPrice(order.total - itemSubtotal)}</span>
                  </div>
                )}
                {order.total < itemSubtotal && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giảm giá</span>
                    <span className="text-green-600">-{formatPrice(itemSubtotal - order.total)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-border/50">
                  <span className="font-bold">{t.total}</span>
                  <span className="font-extrabold text-xl text-red-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm ring-1 ring-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2.5 rounded-xl"><CreditCard className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="font-semibold text-sm">{t.paymentMethod}</p>
                  <p className="text-sm text-muted-foreground">{payLabel}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-6 text-center">
              <h3 className="font-bold text-red-900 dark:text-red-400 mb-2">{t.guestOrderPromptTitle}</h3>
              <p className="text-sm text-red-800 dark:text-red-300 mb-4">{t.guestOrderPromptBody}</p>
              <Link to="/auth?return=/profile">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20">{t.createAccount}</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
