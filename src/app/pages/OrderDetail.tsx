import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { MapPin, Clock, CreditCard, CheckCircle2, Bell, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { DesktopNav } from '../components/DesktopNav';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getOrder, postCancelOrder, ApiError, type ApiOrder } from '../lib/api';
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
  };
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const { refreshOrders, reorderFromOrder } = useCart();
  const { t } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!user || !id) { setLoading(false); setOrder(null); return; }
    let cancelled = false; setOrder(null); setLoading(true);
    getOrder(id)
      .then((o) => { if (!cancelled) setOrder(toOrder(o)); })
      .catch((e) => { if (!cancelled) { if (e instanceof ApiError && e.status === 404) setOrder(null); else setOrder(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authReady, user?.id, id]);

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

  if (!authReady || loading) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted pb-20 md:pt-16">
          <Header title={t.orderStatus} showBack />
          <div className="max-w-md mx-auto px-4 pt-20 text-center text-muted-foreground text-sm">{t.processing}</div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted pb-20 md:pt-16">
          <Header title={t.orderStatus} showBack />
          <div className="max-w-md mx-auto px-4 pt-20 text-center space-y-4">
            <p className="text-muted-foreground">{t.loginRequiredCheckout}</p>
            <Link to={`/auth?return=/order/${id}`} className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold">{t.loginTitle}</Link>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted pb-20 md:pt-16">
          <Header title={t.orderStatus} showBack />
          <div className="max-w-md mx-auto px-4 pt-20 text-center text-muted-foreground">{t.noOrdersDesc}</div>
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

  const deliveryFee = order.deliveryAddress ? 15000 : 0;
  const payLabel = order.paymentMethod === 'cash' ? t.cash : order.paymentMethod === 'card' ? t.cardPayment : t.cardPayment;

  return (
    <div className="min-h-screen bg-muted pb-36 md:pb-12 md:pt-16">
      <DesktopNav />
      <Header title={t.orderStatus} showBack />

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Page header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{t.myOrders}</p>
            <h1 className="font-bold text-xl md:text-2xl tracking-tight">{order.id}</h1>
            <p className="text-xs text-muted-foreground mt-1">{order.createdAt.toLocaleString('vi-VN')}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        {/* 2-col grid on desktop */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT COLUMN — Status + Notifications */}
          <div className="space-y-5">
            {/* Status timeline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-border/50">
              <h2 className="font-bold text-base mb-5 tracking-tight">{t.orderStatus}</h2>
              <div className="relative">
                {order.status === 'cancelled' ? (
                  <div className="flex items-start mb-4">
                    <div className="relative flex flex-col items-center mr-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        <X className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1"><p className="font-medium text-red-600">{t.cancelled}</p></div>
                  </div>
                ) : statusSteps.map((step, index) => {
                  const isActive = step.completed && (index === statusSteps.length - 1 || !statusSteps[index + 1].completed);
                  return (
                    <div key={step.label} className="flex items-start mb-4 last:mb-0">
                      <div className="relative flex flex-col items-center mr-4">
                        <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-red-600 text-white' : 'bg-accent text-gray-400'}`}>
                          {isActive && <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-75"></div>}
                          <div className="relative z-10 w-full h-full rounded-full flex items-center justify-center bg-[inherit] text-[inherit]">
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

            {/* Cancelled reason */}
            {order.status === 'cancelled' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-5">
                <p className="font-bold text-red-800 dark:text-red-400">{t.cancelled}</p>
                {order.cancelReason ? (
                  <p className="text-sm text-red-900 dark:text-red-300 mt-2"><span className="font-semibold">{t.orderDeclinedNote}:</span> {order.cancelReason}</p>
                ) : (
                  <p className="text-sm text-red-800/90 dark:text-red-400/90 mt-1">{t.cancelOrderHint}</p>
                )}
              </motion.div>
            )}

            {/* Notifications */}
            {order.notifications && order.notifications.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mb-4"><Bell className="w-5 h-5" />{t.orderUpdatesFromStore}</div>
                <ul className="space-y-3 text-sm text-amber-950 dark:text-amber-200">
                  {order.notifications.map((n) => (
                    <li key={n.id} className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40">
                      <p className="font-medium">{n.message}</p>
                      <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Location + Time */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm ring-1 ring-border/50 space-y-4">
              <div className="flex items-start gap-4">
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
                    <p className={`text-sm ${order.status === 'cancelled' || order.status === 'completed' ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>{order.estimatedTime}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN — Items + Summary + Payment + Cancel */}
          <div className="space-y-5">
            {/* Order items */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-border/50">
              <h2 className="font-bold text-base mb-5 tracking-tight">{t.orderSummary}</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 bg-muted/30 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-border/50">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{t.quantity}: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-right shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-border space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t.subtotal}</span><span className="font-medium">{formatPrice(order.total)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t.shippingFee}</span><span className="font-medium text-green-600">{deliveryFee === 0 ? t.free : formatPrice(deliveryFee)}</span></div>
                <div className="flex justify-between pt-3 border-t border-border/50"><span className="font-bold">{t.total}</span><span className="font-extrabold text-xl text-red-600">{formatPrice(order.total + deliveryFee)}</span></div>
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm ring-1 ring-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/40 p-2.5 rounded-xl"><CreditCard className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="font-semibold text-sm">{t.paymentMethod}</p>
                  <p className="text-sm text-muted-foreground">{payLabel}</p>
                </div>
              </div>
            </motion.div>

            {/* Reorder */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-600/30 transition-all"
              onClick={() => { reorderFromOrder(order); toast.success(t.reorderAdded); navigate('/cart'); }}>
              {t.reorderButton}
            </motion.button>

            {/* Cancel — inline, both mobile and desktop */}
            {(order.status === 'pending' || order.status === 'processing') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card text-card-foreground rounded-2xl p-5 ring-1 ring-border/50 shadow-sm">
                {!showCancel ? (
                  <button type="button" onClick={() => setShowCancel(true)}
                    className="w-full border border-red-200 text-red-600 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors">
                    {t.cancelOrder}
                  </button>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-semibold text-sm">{t.cancelOrder}</p>
                      <button onClick={() => setShowCancel(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{t.cancelOrderHint}</p>
                    <input type="text" className="w-full mb-3 px-3 py-2.5 border border-border rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none bg-background/50"
                      placeholder={t.orderCancelReasonLabel} value={cancelNote} onChange={(e) => setCancelNote(e.target.value)} />
                    <Button type="button" variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50 py-3 rounded-xl font-bold" disabled={cancelling}
                      onClick={async () => {
                        setCancelling(true);
                        try {
                          const u = await postCancelOrder(order.id, cancelNote);
                          setOrder(toOrder(u)); void refreshOrders();
                          toast.success(t.orderCancelledOk); setShowCancel(false);
                        } catch (e) {
                          if (e instanceof ApiError && e.code === 'cannot_cancel') toast.error(t.cannotCancelOrder);
                          else toast.error(t.orderError);
                        } finally { setCancelling(false); }
                      }}>{cancelling ? '...' : t.cancelOrder}</Button>
                    <button onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
                      className="block w-full text-center text-sm text-red-600 mt-2 font-medium hover:underline">{t.chatSupport}</button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

