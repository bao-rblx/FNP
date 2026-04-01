import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { BackButton } from '../components/BackButton';
import { DesktopNav } from '../components/DesktopNav';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { products } from '../data/products';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, ordersLoading, ordersError, refreshOrders, reorderFromOrder } = useCart();
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');
  const [lookupId, setLookupId] = useState('');

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-muted/50 text-foreground';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted/50 text-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t.pending;
      case 'processing':
        return t.processing_status;
      case 'ready':
        return t.ready;
      case 'completed':
        return t.completed;
      case 'cancelled':
        return t.cancelled;
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'processing':
        return Package;
      case 'ready':
      case 'completed':
        return CheckCircle2;
      case 'cancelled':
        return XCircle;
      default:
        return Package;
    }
  };

  if (ordersLoading) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted pb-20 md:pb-8 md:pt-16">
          <Header title={t.myOrders} />
          <div className="max-w-6xl mx-auto px-4 pt-20 text-center text-muted-foreground text-sm">
            {t.processing}
          </div>
        </div>
      </>
    );
  }

  if (!user || (orders.length === 0 && !ordersLoading)) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted pb-20 md:pb-8 md:pt-16">
          <Header title={t.myOrders} />

          <div className="max-w-2xl mx-auto px-4 pt-12 text-center">
            {/* Guest Lookup Section */}
            {!user && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card text-card-foreground rounded-3xl p-8 shadow-xl shadow-black/5 ring-1 ring-border/50 mb-12"
              >
                <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Package className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t.guestOrderLookupTitle}</h2>
                <p className="text-muted-foreground mb-8">{t.guestOrderLookupDesc}</p>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (lookupId.trim()) navigate(`/order/guest/${lookupId.trim()}`);
                  }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value)}
                    placeholder="e.g. ord_12345"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-red-500 outline-none transition-all text-center font-mono"
                    required
                  />
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl font-bold text-lg shadow-lg shadow-red-600/20">
                    {t.guestOrderLookupBtn}
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-border/50 text-sm">
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Want to see all your orders in one place?' : 'Muốn xem toàn bộ đơn hàng ở cùng một nơi?'}
                  </p>
                  <Link to="/auth" className="text-red-600 font-bold hover:underline mt-1 inline-block">
                    {t.signIn}
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Empty State for Logged-in Users */}
            {user && orders.length === 0 && (
              <div className="space-y-6">
                <div className="bg-muted/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold">{t.noOrders}</h2>
                <p className="text-muted-foreground">{t.noOrdersDesc}</p>
                <Link
                  to="/services/printing"
                  className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
                >
                  {t.viewServices}
                </Link>
              </div>
            )}
            
            {ordersError && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 text-left flex flex-wrap items-center gap-3">
                <span className="flex-1 min-w-0">{t.loadFailed}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-amber-300"
                  disabled={ordersLoading}
                  onClick={() => void refreshOrders()}
                >
                  {t.tryAgain}
                </Button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-20 md:pb-8 md:pt-16">
        <Header title={t.myOrders} />

        <div className="max-w-6xl mx-auto px-4 py-4">
          <BackButton />
          {ordersError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-wrap items-center gap-3">
              <span className="flex-1 min-w-0">{t.loadFailed}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 border-amber-300"
                disabled={ordersLoading}
                onClick={() => void refreshOrders()}
              >
                {t.tryAgain}
              </Button>
            </div>
          )}
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {([
              { key: 'all', label: 'Tất cả / All' },
              { key: 'pending', label: t.pending },
              { key: 'processing', label: t.processing_status },
              { key: 'completed', label: t.completed },
              { key: 'cancelled', label: t.cancelled },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {orders
              .filter(o => filter === 'all' || o.status === filter)
              .map((order) => {
              const StatusIcon = getStatusIcon(order.status);

              return (
                <motion.div
                  key={order.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  className="rounded-2xl md:rounded-3xl border border-border bg-card text-card-foreground shadow-sm shadow-black/5 hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
                >
                  <Link to={`/order/${order.id}`} className="block p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt.toLocaleDateString('vi-VN')}{' '}
                          {order.createdAt.toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3 pb-3 border-b border-border">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{language === "en" ? (item.nameEn || products.find(p => p.id === item.id)?.nameEn || item.name) : item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t.total}</p>
                        <p className="font-bold text-red-600">{formatPrice(order.total)}</p>
                      </div>
                      {order.estimatedTime && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{t.estimatedTime}</p>
                          <p className={`text-sm font-medium ${order.status === 'cancelled' || order.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{order.estimatedTime}</p>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="px-4 pb-4">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-100 dark:border-red-500/30"
                      onClick={() => {
                        reorderFromOrder(order);
                        toast.success(t.reorderAdded);
                        navigate('/cart');
                      }}
                    >
                      {t.reorderButton}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          {orders.filter(o => filter === 'all' || o.status === filter).length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-3">
                {filter === 'cancelled' ? '❌' : filter === 'completed' ? '✅' : '📦'}
              </p>
              <p className="font-medium">No {filter === 'all' ? '' : filter} orders yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}