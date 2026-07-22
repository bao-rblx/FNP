import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { MapPin, Clock, CreditCard, CheckCircle2, Bell, X, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { BackButton } from '../components/BackButton';
import { DesktopNav } from '../components/DesktopNav';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { products } from '../data/products';
import { getOrder, postCancelOrder, postOrderReceived, postPaymentSubmitted, ApiError, type ApiOrder } from '../lib/api';
import { buildVietQrUrl, getVietQrConfig, buildTransferInfo } from '../lib/vietqr';
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
    paymentStatus: o.paymentStatus,
    receivedPoints: o.receivedPoints,
    cancelReason: o.cancelReason,
    notifications: o.notifications,
  };
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const { refreshOrders, reorderFromOrder } = useCart();
  const { t, language } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!user || !id) { setLoading(false); setOrder(null); return; }
    let cancelled = false;
    setOrder(null); setLoading(true); setNotFound(false); setLoadError(false);

    // A freshly created order may not be queryable for a few ms; retry
    // transient/network failures a couple of times before giving up.
    const load = async (attempt = 0): Promise<void> => {
      try {
        const o = await getOrder(id);
        if (!cancelled) setOrder(toOrder(o));
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 404) {
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 500));
            return load(attempt + 1);
          }
          setNotFound(true);
        } else {
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 500));
            return load(attempt + 1);
          }
          setLoadError(true);
        }
      }
    };

    load().finally(() => { if (!cancelled) setLoading(false); });
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
            <Link to={`/auth?return=/order/${id}`} className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold">{t.loginTitle}</Link>
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
          <div className="max-w-md mx-auto px-4 pt-20 text-center space-y-4">
            <p className="text-muted-foreground">
              {loadError ? (language === 'en' ? "Couldn't load this order. Check your connection and try again." : 'Không tải được đơn hàng. Kiểm tra kết nối rồi thử lại.') : t.noOrdersDesc}
            </p>
            {loadError && (
              <Button onClick={() => navigate(0)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {language === 'en' ? 'Retry' : 'Thử lại'}
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }

  const deliveryFee = order.deliveryAddress ? 15000 : 0;
  const payLabel = order.paymentMethod === 'cash' ? t.cash : order.paymentMethod === 'card' ? t.cardPayment : t.cardPayment;
  const payableTotal = order.total + deliveryFee;
  const paymentStatus = order.paymentStatus || (order.paymentMethod === 'cash' ? 'paid' : 'unpaid');
  const paymentLabel = paymentStatus === 'paid' ? 'Đã thanh toán' : paymentStatus === 'pending_verification' ? 'Chờ admin xác nhận' : 'Chưa thanh toán';

  return (
    <div className="min-h-screen bg-muted pb-36 md:pb-12 md:pt-16">
      <DesktopNav />
      <Header title={t.orderStatus} showBack />

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <BackButton />
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
            {/* Purchase status — digital delivery, no shipping timeline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-border/50">
              {order.status === 'cancelled' ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                    <X className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{t.cancelled}</p>
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'This order was cancelled.' : 'Đơn hàng này đã bị hủy.'}</p>
                  </div>
                </div>
              ) : paymentStatus === 'paid' ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-600 text-white shadow-md shadow-green-600/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{language === 'en' ? 'Purchase complete' : 'Thanh toán hoàn tất'}</p>
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'Your files are ready to download below.' : 'Tệp của bạn đã sẵn sàng tải xuống bên dưới.'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-500 text-white shadow-md shadow-amber-500/30">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{language === 'en' ? 'Awaiting payment' : 'Chờ thanh toán'}</p>
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'Complete payment to unlock your downloads.' : 'Hoàn tất thanh toán để mở khóa tải xuống.'}</p>
                  </div>
                </div>
              )}
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

            {/* Instant 3D Downloads Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm ring-1 ring-border/50 space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-500/10 p-2.5 rounded-xl"><CheckCircle2 className="w-5 h-5 text-indigo-500" /></div>
                <div>
                  <p className="font-bold text-sm">Instant Digital Delivery</p>
                  <p className="text-sm text-muted-foreground">High-Speed CDN Asset Access</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-border/50 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">{language === 'en' ? 'Download 3D Assets' : 'Tải tài nguyên 3D'}</p>
                {paymentStatus !== 'paid' && (
                  <p className="text-[11px] text-amber-600 font-medium">{language === 'en' ? 'Downloads unlock after payment is confirmed.' : 'Tải xuống mở khóa sau khi thanh toán được xác nhận.'}</p>
                )}
                {order.items.map((item) => {
                  const match = products.find(p => p.id === item.id);
                  const dlUrl = match?.downloadUrl || `https://poly.store/dl/${item.id}.zip`;
                  const locked = paymentStatus !== 'paid';
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                      <div>
                        <p className="text-xs font-bold truncate max-w-[200px]">{language === 'en' ? item.nameEn || item.name : item.name}</p>
                        <p className="text-[10px] text-muted-foreground">Formats: .GLB, .FBX, .OBJ, 4K PBR</p>
                      </div>
                      {locked ? (
                        <span className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-bold shrink-0 cursor-not-allowed select-none">
                          {language === 'en' ? 'Locked' : 'Đã khóa'}
                        </span>
                      ) : (
                        <a
                          href={dlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/20 shrink-0"
                        >
                          Download 3D
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
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
                      <p className="font-semibold text-sm truncate">{language === "en" ? (item.nameEn || products.find(p => p.id === item.id)?.nameEn || item.name) : item.name}</p>
                      <p className="text-xs text-muted-foreground">{t.quantity}: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-right shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-border space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t.subtotal}</span><span className="font-medium">{formatPrice(order.total)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t.shippingFee}</span><span className="font-medium text-green-500">{t.free}</span></div>
                <div className="flex justify-between pt-3 border-t border-border/50"><span className="font-bold">{t.total}</span><span className="font-extrabold text-xl text-indigo-500">{formatPrice(order.total)}</span></div>
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm ring-1 ring-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/40 p-2.5 rounded-xl"><CreditCard className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="font-semibold text-sm">{t.paymentMethod}</p>
                  <p className="text-sm text-muted-foreground">{payLabel}</p>
                  <p className={`text-xs font-bold mt-1 ${paymentStatus === 'paid' ? 'text-green-600' : paymentStatus === 'pending_verification' ? 'text-amber-600' : 'text-red-600'}`}>{paymentLabel}</p>
                </div>
              </div>
              {order.paymentMethod === 'card' && paymentStatus !== 'paid' && order.status !== 'cancelled' && (
                <div className="mt-5 pt-5 border-t border-border/50 text-center space-y-3">
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-primary"><QrCode className="w-4 h-4" /> VietQR chuyển khoản</div>
                  <img src={buildVietQrUrl(order.id, payableTotal)} alt={`VietQR ${order.id}`} className="mx-auto w-56 h-56 rounded-2xl border bg-white object-contain" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Ngân hàng: <span className="font-semibold text-foreground">TPBank</span></p>
                    <p>Số tài khoản: <span className="font-semibold text-foreground">{getVietQrConfig().accountNo}</span></p>
                    <p>Chủ tài khoản: <span className="font-semibold text-foreground">{getVietQrConfig().accountName}</span></p>
                    <p>Nội dung: <span className="font-semibold text-foreground">{buildTransferInfo(order.id)}</span></p>
                    <p>Số tiền: <span className="font-semibold text-foreground">{formatPrice(payableTotal)}</span></p>
                  </div>
                  <Button type="button" className="w-full bg-primary hover:bg-primary/90" disabled={actionLoading || paymentStatus === 'pending_verification'} onClick={async () => {
                    setActionLoading(true);
                    try {
                      const u = await postPaymentSubmitted(order.id);
                      setOrder(toOrder(u)); void refreshOrders();
                      toast.success('Đã gửi yêu cầu xác nhận thanh toán');
                    } catch { toast.error(t.orderError); }
                    finally { setActionLoading(false); }
                  }}>{paymentStatus === 'pending_verification' ? 'Đã gửi xác nhận' : 'Tôi đã thanh toán'}</Button>
                </div>
              )}
            </motion.div>

            {order.status === 'ready' && paymentStatus === 'paid' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-5 border border-green-200 dark:border-green-900">
                <p className="font-bold text-green-800 dark:text-green-300 mb-2">Xác nhận đã nhận hàng</p>
                <p className="text-sm text-green-700 dark:text-green-400 mb-4">Khi bạn xác nhận, đơn hàng sẽ được đánh dấu hoàn tất.</p>
                <Button type="button" className="w-full bg-green-600 hover:bg-green-700" disabled={actionLoading} onClick={async () => {
                  setActionLoading(true);
                  try {
                    const u = await postOrderReceived(order.id);
                    setOrder(toOrder(u)); void refreshOrders();
                    toast.success('Đã xác nhận nhận hàng');
                  } catch (e) {
                    if (e instanceof ApiError && e.code === 'payment_not_paid') toast.error('Đơn hàng chưa được xác nhận thanh toán');
                    else toast.error(t.orderError);
                  } finally { setActionLoading(false); }
                }}>Tôi đã nhận hàng</Button>
              </motion.div>
            )}

            {/* Reorder */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all"
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

