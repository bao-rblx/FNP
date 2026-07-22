import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
  Plus,
  Search,
  Pencil,
  LayoutDashboard,
  Package,
  Users as UsersIcon,
  Ticket,
  MessageSquare,
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  CartesianGrid,
} from 'recharts';
import { Header } from '../components/Header';
import { BackButton } from '../components/BackButton';
import { DesktopNav } from '../components/DesktopNav';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ApiError,
  adminConfirmPayment,
  adminDeleteOrder,
  adminPatchOrder,
  adminRejectPayment,
  adminPostOrderNotification,
  deleteAdminOrderNotification,
  deleteAdminUser,
  getAdminOrders,
  getAdminSupportMessages,
  getAdminSupportThreads,
  getAdminUsers,
  patchAdminUser,
  postAdminSupportMessage,
  getAdminProducts,
  adminPostProduct,
  adminPatchProduct,
  adminDeleteProduct,
  getAdminCoupons,
  adminPostCoupon,
  adminPatchCoupon,
  adminDeleteCoupon,
  getAdminStats,
  type AdminUserRow,
  type ApiOrder,
  type SupportMessage,
  type SupportThread,
  type ApiProduct,
  type ApiCoupon,
  type AdminStats,
} from '../lib/api';

const STATUSES = ['pending', 'processing', 'ready', 'completed', 'cancelled'] as const;

function formatPrice(v: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
}

function shortDate(s?: string | null): string {
  if (!s) return '—';
  const d = new Date(s.includes('T') || s.includes(' ') ? s.replace(' ', 'T') + 'Z' : s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  processing: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  ready: 'bg-violet-500/15 text-violet-500 border-violet-500/30',
  completed: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  pending_verification: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  unpaid: 'bg-muted text-muted-foreground border-border',
};

type EmptyProduct = Partial<ApiProduct>;

export default function Admin() {
  const { user, authReady } = useAuth();
  const { t, language } = useLanguage();
  const [tab, setTab] = useState('dashboard');

  // ---- Dashboard ----
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ---- Orders ----
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<number | null>(null);
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});
  const [draftEta, setDraftEta] = useState<Record<string, string>>({});
  const [draftMsg, setDraftMsg] = useState<Record<string, string>>({});
  const [draftCancelReason, setDraftCancelReason] = useState<Record<string, string>>({});
  const [draftDelivery, setDraftDelivery] = useState<Record<string, string>>({});
  const [draftPickup, setDraftPickup] = useState<Record<string, string>>({});
  const [draftPayment, setDraftPayment] = useState<Record<string, string>>({});
  const [draftPaymentStatus, setDraftPaymentStatus] = useState<Record<string, 'unpaid' | 'pending_verification' | 'paid'>>({});

  // ---- Users ----
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [userDraft, setUserDraft] = useState<{ name: string; role: 'user' | 'admin' }>({
    name: '', role: 'user',
  });
  const [savingUser, setSavingUser] = useState(false);

  // ---- Products ----
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<EmptyProduct | null>(null);
  const [isProductNew, setIsProductNew] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // ---- Coupons ----
  const [coupons, setCoupons] = useState<ApiCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Partial<ApiCoupon> | null>(null);
  const [isCouponNew, setIsCouponNew] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);

  // ---- Chat ----
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [chatUserId, setChatUserId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([]);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [threadsLoadError, setThreadsLoadError] = useState(false);
  const [chatLoadError, setChatLoadError] = useState(false);

  const isAdmin = user?.role === 'admin';

  // ---------- Loaders ----------
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await getAdminStats());
    } catch {
      // non-fatal
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const list = await getAdminOrders();
      setOrders(list);
      const st: Record<string, string> = {};
      const et: Record<string, string> = {};
      const cr: Record<string, string> = {};
      const dd: Record<string, string> = {};
      const dp: Record<string, string> = {};
      const pm: Record<string, string> = {};
      const ps: Record<string, 'unpaid' | 'pending_verification' | 'paid'> = {};
      for (const o of list) {
        st[o.id] = o.status;
        et[o.id] = o.estimatedTime || '';
        cr[o.id] = o.cancelReason || '';
        dd[o.id] = o.deliveryAddress || '';
        dp[o.id] = o.pickupLocation || '';
        pm[o.id] = o.paymentMethod || '';
        ps[o.id] = o.paymentStatus || (o.paymentMethod === 'cash' ? 'paid' : 'unpaid');
      }
      setDraftStatus(st);
      setDraftEta(et);
      setDraftCancelReason(cr);
      setDraftDelivery(dd);
      setDraftPickup(dp);
      setDraftPayment(pm);
      setDraftPaymentStatus(ps);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) toast.error(t.adminAccessDenied);
      else toast.error(t.orderError);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [t.adminAccessDenied, t.orderError]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      setUsers(await getAdminUsers());
    } catch {
      toast.error(t.orderError);
    } finally {
      setUsersLoading(false);
    }
  }, [t.orderError]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      setProducts(await getAdminProducts());
    } catch {
      toast.error(t.orderError);
    } finally {
      setProductsLoading(false);
    }
  }, [t.orderError]);

  const loadCoupons = useCallback(async () => {
    setCouponsLoading(true);
    try {
      setCoupons(await getAdminCoupons());
    } catch {
      toast.error(t.orderError);
    } finally {
      setCouponsLoading(false);
    }
  }, [t.orderError]);

  const loadThreads = useCallback(async () => {
    setThreadsLoadError(false);
    try {
      const th = await getAdminSupportThreads();
      setThreads(th);
      setChatUserId((prev) => (prev == null && th[0] ? th[0].userId : prev));
    } catch {
      setThreadsLoadError(true);
    }
  }, []);

  const loadChat = useCallback(async (uid: number) => {
    setChatLoading(true);
    setChatLoadError(false);
    try {
      setChatMessages(await getAdminSupportMessages(uid));
    } catch {
      setChatLoadError(true);
    } finally {
      setChatLoading(false);
    }
  }, []);

  // ---------- Effects ----------
  useEffect(() => {
    if (!authReady || !isAdmin) return;
    void loadStats();
    void loadOrders();
  }, [authReady, isAdmin, loadStats, loadOrders]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'dashboard') void loadStats();
    if (tab === 'users' || userFilter != null) void loadUsers();
    if (tab === 'products') void loadProducts();
    if (tab === 'coupons') void loadCoupons();
  }, [tab, userFilter, isAdmin, loadStats, loadUsers, loadProducts, loadCoupons]);

  useEffect(() => {
    if (tab === 'chat' && isAdmin) {
      void loadThreads();
      const id = window.setInterval(() => void loadThreads(), 8000);
      return () => window.clearInterval(id);
    }
  }, [tab, isAdmin, loadThreads]);

  useEffect(() => {
    if (tab === 'chat' && chatUserId != null) void loadChat(chatUserId);
  }, [tab, chatUserId, loadChat]);

  // ---------- Labels ----------
  const statusLabel = (s: string) => {
    switch (s) {
      case 'pending': return language === 'en' ? 'Pending' : 'Chờ xử lý';
      case 'processing': return language === 'en' ? 'Processing' : 'Đang xử lý';
      case 'ready': return language === 'en' ? 'Ready' : 'Sẵn sàng';
      case 'completed': return language === 'en' ? 'Completed' : 'Hoàn thành';
      case 'cancelled': return language === 'en' ? 'Cancelled' : 'Đã hủy';
      default: return s;
    }
  };

  const paymentStatusLabel = (s?: string) => {
    switch (s) {
      case 'paid': return language === 'en' ? 'Paid' : 'Đã thanh toán';
      case 'pending_verification': return language === 'en' ? 'Verifying' : 'Chờ xác nhận';
      case 'unpaid': return language === 'en' ? 'Unpaid' : 'Chưa thanh toán';
      default: return language === 'en' ? 'Unpaid' : 'Chưa thanh toán';
    }
  };

  // ---------- Order actions ----------
  const saveOrder = async (orderId: string) => {
    setSavingId(orderId);
    try {
      const st = draftStatus[orderId];
      const patch: Parameters<typeof adminPatchOrder>[1] = {
        status: st,
        estimatedTime: draftEta[orderId],
        deliveryAddress: draftDelivery[orderId] ?? '',
        pickupLocation: draftPickup[orderId] ?? '',
        paymentMethod: draftPayment[orderId] ?? '',
        paymentStatus: draftPaymentStatus[orderId],
      };
      if (st === 'cancelled' && draftCancelReason[orderId]?.trim()) {
        patch.cancelReason = draftCancelReason[orderId].trim();
      }
      const updated = await adminPatchOrder(orderId, patch);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      toast.success(t.adminSaved);
    } catch {
      toast.error(t.adminSaveFailed);
    } finally {
      setSavingId(null);
    }
  };

  const advanceStatus = async (orderId: string) => {
    const current = orders.find((o) => o.id === orderId)?.status || draftStatus[orderId] || 'pending';
    const flow = ['pending', 'processing', 'ready', 'completed'];
    const idx = flow.indexOf(current);
    if (idx < 0 || idx >= flow.length - 1) return;
    const next = flow[idx + 1];
    setSavingId(orderId);
    try {
      const updated = await adminPatchOrder(orderId, { status: next });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      setDraftStatus((d) => ({ ...d, [orderId]: next }));
      toast.success(t.adminSaved);
    } catch {
      toast.error(t.adminSaveFailed);
    } finally {
      setSavingId(null);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm(language === 'en' ? 'Cancel this order?' : 'Hủy đơn hàng này?')) return;
    setSavingId(orderId);
    try {
      const updated = await adminPatchOrder(orderId, { status: 'cancelled' });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      setDraftStatus((d) => ({ ...d, [orderId]: 'cancelled' }));
      toast.success(t.adminSaved);
    } catch {
      toast.error(t.adminSaveFailed);
    } finally {
      setSavingId(null);
    }
  };

  const setPaymentState = async (orderId: string, action: 'confirm' | 'reject') => {
    setSavingId(orderId);
    try {
      const updated = action === 'confirm' ? await adminConfirmPayment(orderId) : await adminRejectPayment(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      setDraftPaymentStatus((d) => ({ ...d, [orderId]: updated.paymentStatus || (action === 'confirm' ? 'paid' : 'unpaid') }));
      toast.success(t.adminSaved);
    } catch {
      toast.error(t.adminSaveFailed);
    } finally {
      setSavingId(null);
    }
  };

  const sendNote = async (orderId: string) => {
    const msg = (draftMsg[orderId] || '').trim();
    if (!msg) {
      toast.error(t.authFillFields);
      return;
    }
    setSavingId(orderId);
    try {
      const note = await adminPostOrderNotification(orderId, msg);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, notifications: [...(o.notifications || []), note] } : o)),
      );
      setDraftMsg((d) => ({ ...d, [orderId]: '' }));
      toast.success(t.adminSendUpdate);
    } catch {
      toast.error(t.orderError);
    } finally {
      setSavingId(null);
    }
  };

  const removeNotification = async (orderId: string, noteId: number) => {
    if (!window.confirm(`${t.deleteNotification}?`)) return;
    try {
      await deleteAdminOrderNotification(orderId, noteId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, notifications: (o.notifications || []).filter((x) => x.id !== noteId) } : o,
        ),
      );
    } catch {
      toast.error(t.orderError);
    }
  };

  const removeOrder = async (orderId: string) => {
    if (!window.confirm(t.deleteOrderConfirm)) return;
    try {
      await adminDeleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success(t.delete);
    } catch {
      toast.error(t.orderError);
    }
  };

  // ---------- User actions ----------
  const openUserEditor = (u: AdminUserRow) => {
    setEditingUser(u);
    setUserDraft({
      name: u.name,
      role: (u.role === 'admin' ? 'admin' : 'user'),
    });
  };

  const saveUser = async () => {
    if (!editingUser) return;
    if (!userDraft.name.trim()) {
      toast.error(t.authFillFields);
      return;
    }
    setSavingUser(true);
    try {
      const updated = await patchAdminUser(editingUser.id, {
        name: userDraft.name.trim(),
        role: userDraft.role,
      });
      setUsers((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      toast.success(t.adminSaved);
      setEditingUser(null);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'last_admin') toast.error(language === 'en' ? 'Cannot demote the last admin.' : 'Không thể hạ quyền admin cuối cùng.');
      else toast.error(t.adminSaveFailed);
    } finally {
      setSavingUser(false);
    }
  };

  const removeUser = async (u: AdminUserRow) => {
    if (!window.confirm(`${t.delete} ${u.schoolEmail}?`)) return;
    try {
      await deleteAdminUser(u.id);
      setUsers((list) => list.filter((x) => x.id !== u.id));
      toast.success(t.delete);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'last_admin') toast.error(language === 'en' ? 'Cannot delete the last admin.' : 'Không thể xóa admin cuối cùng.');
      else toast.error(t.orderError);
    }
  };

  // ---------- Product actions ----------
  const openProductEditor = (p: EmptyProduct | null) => {
    if (p) {
      setEditingProduct({ ...p });
      setIsProductNew(false);
    } else {
      setEditingProduct({ name: '', price: 0, category: 'models', image: '', unit: '', minQuantity: 1, stockLimit: -1, isPromotion: false, pickupOnly: false });
      setIsProductNew(true);
    }
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    if (!editingProduct.name?.trim()) {
      toast.error(t.authFillFields);
      return;
    }
    if (editingProduct.price === undefined || editingProduct.price === null || Number.isNaN(Number(editingProduct.price))) {
      toast.error(t.authFillFields);
      return;
    }
    if (!editingProduct.category?.trim()) {
      toast.error(t.authFillFields);
      return;
    }
    setSavingProduct(true);
    try {
      const payload: Partial<ApiProduct> = {
        ...editingProduct,
        price: Number(editingProduct.price),
        description: editingProduct.description || '',
        descriptionEn: editingProduct.descriptionEn || '',
        minQuantity: Number(editingProduct.minQuantity) || 1,
        stockLimit: editingProduct.stockLimit === undefined || editingProduct.stockLimit === null ? -1 : Number(editingProduct.stockLimit),
      };
      if (!isProductNew && editingProduct.id) {
        const updated = await adminPatchProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await adminPostProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      toast.success(t.adminSaved);
      setEditingProduct(null);
    } catch {
      toast.error(t.adminSaveFailed);
    } finally {
      setSavingProduct(false);
    }
  };

  const removeProduct = async (id: string) => {
    if (!window.confirm(t.delete + '?')) return;
    try {
      await adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(t.delete);
    } catch {
      toast.error(t.orderError);
    }
  };

  // ---------- Coupon actions ----------
  const openCouponEditor = (c: Partial<ApiCoupon> | null) => {
    if (c) {
      setEditingCoupon({ ...c });
      setIsCouponNew(false);
    } else {
      setEditingCoupon({ code: '', discount_percent: 10, max_uses: -1, expires_at: null, min_spent: 0 });
      setIsCouponNew(true);
    }
  };

  const saveCoupon = async () => {
    if (!editingCoupon) return;
    const pct = Number(editingCoupon.discount_percent);
    if (isCouponNew && !editingCoupon.code?.trim()) {
      toast.error(t.authFillFields);
      return;
    }
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      toast.error(t.authFillFields);
      return;
    }
    setSavingCoupon(true);
    try {
      const body = {
        discountPercent: Math.floor(pct),
        maxUses: editingCoupon.max_uses === undefined || editingCoupon.max_uses === null ? -1 : Number(editingCoupon.max_uses),
        expiresAt: editingCoupon.expires_at || null,
        minSpent: Number(editingCoupon.min_spent) || 0,
      };
      if (isCouponNew) {
        const created = await adminPostCoupon({ code: editingCoupon.code!.trim(), ...body });
        setCoupons((prev) => [created, ...prev]);
      } else {
        const updated = await adminPatchCoupon(editingCoupon.code!, body);
        setCoupons((prev) => prev.map((c) => (c.code === updated.code ? updated : c)));
      }
      toast.success(t.adminSaved);
      setEditingCoupon(null);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'coupon_exists') toast.error(language === 'en' ? 'Coupon code already exists.' : 'Mã giảm giá đã tồn tại.');
      else toast.error(t.adminSaveFailed);
    } finally {
      setSavingCoupon(false);
    }
  };

  const removeCoupon = async (code: string) => {
    if (!window.confirm(t.delete + '?')) return;
    try {
      await adminDeleteCoupon(code);
      setCoupons((prev) => prev.filter((c) => c.code !== code));
      toast.success(t.delete);
    } catch {
      toast.error(t.orderError);
    }
  };

  // ---------- Chat actions ----------
  const sendAdminChat = async () => {
    if (chatUserId == null) return;
    const b = chatText.trim();
    if (!b) return;
    try {
      const msg = await postAdminSupportMessage(chatUserId, b);
      setChatMessages((prev) => [...prev, msg]);
      setChatText('');
      void loadThreads();
    } catch {
      toast.error(t.orderError);
    }
  };

  // ---------- Derived ----------
  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      if (userFilter != null && o.userId !== userFilter) return false;
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.userName || '').toLowerCase().includes(q) ||
        (o.userEmail || '').toLowerCase().includes(q) ||
        (o.guestName || '').toLowerCase().includes(q) ||
        (o.guestPhone || '').toLowerCase().includes(q) ||
        (o.guestEmail || '').toLowerCase().includes(q)
      );
    });
  }, [orders, orderSearch, orderStatusFilter, userFilter]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.schoolEmail || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q),
    );
  }, [users, userSearch]);

  const productCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) set.add(p.category);
    return [...set].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (productCatFilter !== 'all' && p.category !== productCatFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.nameEn || '').toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    });
  }, [products, productSearch, productCatFilter]);

  // ---------- Guards ----------
  if (!authReady) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted">
        <p className="text-muted-foreground">{t.processing}</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen grid place-items-center bg-muted px-4 text-center">
          <div>
            <p className="text-lg font-semibold mb-2">{t.adminAccessDenied}</p>
            <p className="text-sm text-muted-foreground">{t.adminSignInAsAdmin}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-20 md:pt-16">
        <Header title={t.adminPanel} showBack />

        <div className="max-w-6xl mx-auto px-4 py-4">
          <BackButton />
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-4 h-auto">
              <TabsTrigger value="dashboard" className="gap-1.5 py-2"><LayoutDashboard className="w-4 h-4" />{t.adminTabDashboard}</TabsTrigger>
              <TabsTrigger value="orders" className="gap-1.5 py-2"><ShoppingBag className="w-4 h-4" />{t.adminTabOrders}</TabsTrigger>
              <TabsTrigger value="products" className="gap-1.5 py-2"><Package className="w-4 h-4" />{t.adminTabProducts}</TabsTrigger>
              <TabsTrigger value="users" className="gap-1.5 py-2"><UsersIcon className="w-4 h-4" />{t.adminTabUsers}</TabsTrigger>
              <TabsTrigger value="coupons" className="gap-1.5 py-2"><Ticket className="w-4 h-4" />{t.adminTabCoupons}</TabsTrigger>
              <TabsTrigger value="chat" className="gap-1.5 py-2"><MessageSquare className="w-4 h-4" />{t.adminTabChat}</TabsTrigger>
            </TabsList>

            {/* ============ DASHBOARD ============ */}
            <TabsContent value="dashboard" className="space-y-4">
              <DashboardPanel stats={stats} loading={statsLoading} t={t} statusLabel={statusLabel} paymentStatusLabel={paymentStatusLabel} onRefresh={() => void loadStats()} />
            </TabsContent>

            {/* ============ ORDERS ============ */}
            <TabsContent value="orders" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{t.adminOrdersHint}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void loadOrders()} disabled={ordersLoading} className="gap-2">
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />{t.apply}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder={t.adminSearchPlaceholder} className="pl-9" />
                </div>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="all">{t.adminFilterAll}</option>
                  {STATUSES.map((s) => (<option key={s} value={s}>{statusLabel(s)}</option>))}
                </select>
              </div>

              {userFilter != null && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-indigo-400">
                    <span className="font-semibold">{t.adminFilteringByUser}:</span>
                    <span>{users.find((u) => u.id === userFilter)?.name || `ID: ${userFilter}`}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setUserFilter(null)} className="h-8">{t.adminClearFilter}</Button>
                </div>
              )}

              {ordersLoading && orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">{t.processing}</p>
              ) : filteredOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">{t.adminNoResults}</p>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((o) => {
                    const open = openId === o.id;
                    const busy = savingId === o.id;
                    const payStatus = o.paymentStatus || 'unpaid';
                    const canAdvance = ['pending', 'processing', 'ready'].includes(o.status);
                    const nextStatusLabel = statusLabel(
                      { pending: 'processing', processing: 'ready', ready: 'completed' }[o.status] || o.status,
                    );
                    const isDone = o.status === 'completed' || o.status === 'cancelled';
                    return (
                      <div key={o.id} className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{o.id}</p>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status] || 'border-border'}`}>{statusLabel(o.status)}</span>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${PAYMENT_COLORS[payStatus]}`}>{paymentStatusLabel(payStatus)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {[o.userName || o.guestName, o.userEmail || o.guestEmail, o.guestPhone].filter(Boolean).join(' · ')} · {shortDate(o.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold text-lg">{formatPrice(o.total)}</span>
                          </div>
                        </div>

                        {/* Always-visible quick actions — the fast confirm path */}
                        <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
                          {payStatus !== 'paid' && (
                            <Button
                              type="button"
                              size="sm"
                              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                              disabled={busy}
                              onClick={() => void setPaymentState(o.id, 'confirm')}
                            >
                              <CheckCircle2 className="w-4 h-4" />{language === 'en' ? 'Confirm payment' : 'Xác nhận thanh toán'}
                            </Button>
                          )}
                          {canAdvance && (
                            <Button
                              type="button"
                              size="sm"
                              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                              disabled={busy}
                              onClick={() => void advanceStatus(o.id)}
                            >
                              <ArrowRight className="w-4 h-4" />{language === 'en' ? `Mark ${nextStatusLabel}` : `Chuyển: ${nextStatusLabel}`}
                            </Button>
                          )}
                          {!isDone && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-rose-500 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600"
                              disabled={busy}
                              onClick={() => void cancelOrder(o.id)}
                            >
                              <XCircle className="w-4 h-4" />{language === 'en' ? 'Cancel' : 'Hủy'}
                            </Button>
                          )}
                          <button
                            type="button"
                            className="ml-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => setOpenId(open ? null : o.id)}
                          >
                            {open ? (language === 'en' ? 'Less' : 'Thu gọn') : (language === 'en' ? 'Details' : 'Chi tiết')}
                            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Compact item summary always visible */}
                        <div className="px-4 pb-4 -mt-1">
                          <div className="rounded-lg border border-border divide-y bg-muted/30">
                            {o.items.map((item) => (
                              <div key={`sum-${o.id}-${item.id}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                                <span className="min-w-0 truncate">{language === 'en' ? item.nameEn || item.name : item.name} <span className="text-muted-foreground">× {item.quantity}</span></span>
                                <span className="font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {open && (
                          <div className="px-4 pb-4 pt-0 border-t border-border/50 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4 pt-4">
                              <div className="space-y-2 sm:col-span-2">
                                <Label>{t.adminDeliveryAddress}</Label>
                                <Input value={draftDelivery[o.id] ?? ''} onChange={(e) => setDraftDelivery((d) => ({ ...d, [o.id]: e.target.value }))} placeholder="—" />
                              </div>
                              <div className="space-y-2">
                                <Label>{t.adminPickupLocation}</Label>
                                <Input value={draftPickup[o.id] ?? ''} onChange={(e) => setDraftPickup((d) => ({ ...d, [o.id]: e.target.value }))} placeholder="—" />
                              </div>
                              <div className="space-y-2">
                                <Label>{t.adminPaymentMethod}</Label>
                                <Input value={draftPayment[o.id] ?? ''} onChange={(e) => setDraftPayment((d) => ({ ...d, [o.id]: e.target.value }))} placeholder="cash / card" />
                              </div>
                              <div className="space-y-2">
                                <Label>{t.adminStatPendingPayments}</Label>
                                <select
                                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                  value={draftPaymentStatus[o.id] || o.paymentStatus || 'unpaid'}
                                  onChange={(e) => setDraftPaymentStatus((d) => ({ ...d, [o.id]: e.target.value as 'unpaid' | 'pending_verification' | 'paid' }))}
                                >
                                  <option value="unpaid">{paymentStatusLabel('unpaid')}</option>
                                  <option value="pending_verification">{paymentStatusLabel('pending_verification')}</option>
                                  <option value="paid">{paymentStatusLabel('paid')}</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>{t.orderStatus}</Label>
                                <select
                                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                  value={draftStatus[o.id] || o.status}
                                  onChange={(e) => setDraftStatus((d) => ({ ...d, [o.id]: e.target.value }))}
                                >
                                  {STATUSES.map((s) => (<option key={s} value={s}>{statusLabel(s)}</option>))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>{t.estimatedTime}</Label>
                                <Input value={draftEta[o.id] ?? ''} onChange={(e) => setDraftEta((d) => ({ ...d, [o.id]: e.target.value }))} placeholder="15-30 mins" />
                              </div>
                            </div>
                            {draftStatus[o.id] === 'cancelled' && (
                              <div className="space-y-2">
                                <Label>{t.orderDeclinedNote}</Label>
                                <Input value={draftCancelReason[o.id] ?? ''} onChange={(e) => setDraftCancelReason((d) => ({ ...d, [o.id]: e.target.value }))} placeholder={t.orderCancelReasonLabel} />
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" className="bg-indigo-600 hover:bg-indigo-700 font-bold" disabled={savingId === o.id} onClick={() => void saveOrder(o.id)}>{t.save}</Button>
                              <Button type="button" variant="outline" disabled={savingId === o.id || o.paymentStatus === 'unpaid'} onClick={() => void setPaymentState(o.id, 'reject')}>{language === 'en' ? 'Reject payment' : 'Từ chối thanh toán'}</Button>
                              <Button type="button" variant="destructive" disabled={savingId === o.id} onClick={() => void removeOrder(o.id)}>{t.adminDeleteOrder}</Button>
                            </div>
                            {(o.notifications?.length ?? 0) > 0 && (
                              <div className="space-y-2">
                                <Label>{language === 'en' ? 'Sent notifications' : 'Thông báo đã gửi'}</Label>
                                <div className="space-y-1.5">
                                  {o.notifications!.map((n) => (
                                    <div key={n.id} className="flex items-center justify-between gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2">
                                      <span className="min-w-0 truncate">{n.message}</span>
                                      <button type="button" onClick={() => void removeNotification(o.id, n.id)} className="text-muted-foreground hover:text-rose-500 shrink-0"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label>{t.adminNotifyPlaceholder}</Label>
                              <textarea
                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder={t.adminNotifyPlaceholder}
                                value={draftMsg[o.id] ?? ''}
                                onChange={(e) => setDraftMsg((d) => ({ ...d, [o.id]: e.target.value }))}
                              />
                              <Button type="button" variant="secondary" disabled={savingId === o.id} onClick={() => void sendNote(o.id)}>{t.adminSendUpdate}</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ============ PRODUCTS ============ */}
            <TabsContent value="products" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder={t.adminSearchPlaceholder} className="pl-9" />
                  </div>
                  <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={productCatFilter} onChange={(e) => setProductCatFilter(e.target.value)}>
                    <option value="all">{t.adminFilterAll}</option>
                    {productCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <Button type="button" className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => openProductEditor(null)}><Plus className="w-4 h-4" />{t.adminAddProduct}</Button>
              </div>

              {productsLoading && products.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">{t.processing}</p>
              ) : filteredProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">{t.adminNoResults}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
                      <div className="aspect-video bg-muted overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-muted-foreground"><Package className="w-8 h-8" /></div>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm line-clamp-2">{p.name}</p>
                          {p.isPromotion && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500 border border-rose-500/30 shrink-0">SALE</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.category} · {p.unit || '—'}</p>
                        <p className="font-bold text-indigo-500 mt-1">{formatPrice(p.price)}</p>
                        <p className="text-[11px] text-muted-foreground">{language === 'en' ? 'Stock' : 'Kho'}: {p.stockLimit === -1 || p.stockLimit === undefined ? '∞' : p.stockLimit}</p>
                      </div>
                      <div className="flex border-t border-border">
                        <button type="button" onClick={() => openProductEditor(p)} className="flex-1 py-2 text-sm flex items-center justify-center gap-1.5 hover:bg-muted"><Pencil className="w-3.5 h-3.5" />{t.edit}</button>
                        <button type="button" onClick={() => void removeProduct(p.id)} className="flex-1 py-2 text-sm flex items-center justify-center gap-1.5 hover:bg-muted text-rose-500 border-l border-border"><Trash2 className="w-3.5 h-3.5" />{t.delete}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ============ USERS ============ */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder={t.adminSearchPlaceholder} className="pl-9" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => void loadUsers()} disabled={usersLoading} className="gap-2"><RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />{t.apply}</Button>
              </div>

              {usersLoading && users.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">{t.processing}</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">{t.adminNoResults}</p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{u.name}</p>
                            {u.role === 'admin' && <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">ADMIN</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{u.schoolEmail}{u.phone ? ` · ${u.phone}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => { setUserFilter(u.id); setTab('orders'); }} className="h-8">{t.adminViewOrders}</Button>
                          <Button variant="outline" size="sm" onClick={() => openUserEditor(u)} className="h-8 gap-1.5"><Pencil className="w-3.5 h-3.5" />{t.edit}</Button>
                          <Button variant="ghost" size="sm" onClick={() => void removeUser(u)} className="h-8 text-rose-500 hover:text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50 text-sm">
                        <div><p className="text-xs text-muted-foreground">{t.adminUserOrders}</p><p className="font-semibold">{u.orderCount}</p></div>
                        <div><p className="text-xs text-muted-foreground">{t.adminUserSpent}</p><p className="font-semibold">{formatPrice(u.totalSpent)}</p></div>
                        <div><p className="text-xs text-muted-foreground">{t.lastLogin}</p><p className="font-semibold">{shortDate(u.lastLoginAt)}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ============ COUPONS ============ */}
            <TabsContent value="coupons" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{t.adminTabCoupons}</p>
                <Button type="button" className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => openCouponEditor(null)}><Plus className="w-4 h-4" />{t.adminAddCoupon}</Button>
              </div>
              {couponsLoading && coupons.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">{t.processing}</p>
              ) : coupons.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">{t.adminNoResults}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {coupons.map((c) => (
                    <div key={c.code} className="bg-card text-card-foreground rounded-xl border border-dashed border-indigo-500/40 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono font-bold text-lg text-indigo-500">{c.code}</p>
                          <p className="text-2xl font-bold">{c.discount_percent}%</p>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => openCouponEditor(c)} className="p-1.5 rounded hover:bg-muted"><Pencil className="w-4 h-4" /></button>
                          <button type="button" onClick={() => void removeCoupon(c.code)} className="p-1.5 rounded hover:bg-muted text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-1 text-xs text-muted-foreground">
                        <p>{t.adminCouponMaxUses}: {c.max_uses === -1 ? '∞' : c.max_uses} ({c.used_count} {language === 'en' ? 'used' : 'đã dùng'})</p>
                        <p>{t.adminCouponMinSpent}: {formatPrice(c.min_spent)}</p>
                        <p>{t.adminCouponExpires}: {c.expires_at ? shortDate(c.expires_at) : (language === 'en' ? 'Never' : 'Không giới hạn')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ============ CHAT ============ */}
            <TabsContent value="chat" className="space-y-4">
              {threadsLoadError ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-3">{t.loadFailed}</p>
                  <Button variant="outline" onClick={() => void loadThreads()}>{t.tryAgain}</Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-[280px_1fr] gap-4">
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-3 border-b border-border font-semibold text-sm">{t.adminCustomer}</div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {threads.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4">{t.noThreadsYet}</p>
                      ) : (
                        threads.map((th) => (
                          <button
                            key={th.userId}
                            type="button"
                            onClick={() => setChatUserId(th.userId)}
                            className={`w-full text-left px-3 py-2.5 border-b border-border/50 hover:bg-muted ${chatUserId === th.userId ? 'bg-muted' : ''}`}
                          >
                            <p className="font-medium text-sm truncate">{th.name || th.email || `User #${th.userId}`}</p>
                            <p className="text-xs text-muted-foreground truncate">{th.lastMessage || ''}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="bg-card rounded-xl border border-border flex flex-col min-h-[60vh]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatLoadError ? (
                        <p className="text-sm text-muted-foreground text-center py-8">{t.loadFailed}</p>
                      ) : chatLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-8">{t.processing}</p>
                      ) : chatMessages.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">{t.noThreadsYet}</p>
                      ) : (
                        chatMessages.map((m) => (
                          <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.fromAdmin ? 'bg-indigo-600 text-white' : 'bg-muted'}`}>
                              {m.body}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {chatUserId != null && (
                      <div className="p-3 border-t border-border flex gap-2">
                        <Input
                          value={chatText}
                          onChange={(e) => setChatText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendAdminChat(); } }}
                          placeholder={t.adminNotifyPlaceholder}
                        />
                        <Button type="button" onClick={() => void sendAdminChat()} className="bg-indigo-600 hover:bg-indigo-700">{t.adminSendUpdate}</Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ---- User edit dialog ---- */}
      <Dialog open={editingUser != null} onOpenChange={(o) => { if (!o) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.adminEditUser}</DialogTitle>
            <DialogDescription>{editingUser?.schoolEmail}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>{language === 'en' ? 'Name' : 'Tên'}</Label><Input value={userDraft.name} onChange={(e) => setUserDraft((d) => ({ ...d, name: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>{t.userRole}</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={userDraft.role} onChange={(e) => setUserDraft((d) => ({ ...d, role: e.target.value as 'user' | 'admin' }))}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>{t.cancel}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={savingUser} onClick={() => void saveUser()}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Product edit dialog ---- */}
      <Dialog open={editingProduct != null} onOpenChange={(o) => { if (!o) setEditingProduct(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isProductNew ? t.adminAddProduct : t.adminEditProduct}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2"><Label>{t.adminProductName} (VI) *</Label><Input value={editingProduct.name ?? ''} onChange={(e) => setEditingProduct((p) => ({ ...p!, name: e.target.value }))} /></div>
                <div className="space-y-1.5 col-span-2"><Label>{t.adminProductName} (EN)</Label><Input value={editingProduct.nameEn ?? ''} onChange={(e) => setEditingProduct((p) => ({ ...p!, nameEn: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>{t.adminProductPrice} *</Label><Input type="number" value={editingProduct.price ?? 0} onChange={(e) => setEditingProduct((p) => ({ ...p!, price: Number(e.target.value) }))} /></div>
                <div className="space-y-1.5"><Label>{t.adminProductCategory} *</Label><Input value={editingProduct.category ?? ''} onChange={(e) => setEditingProduct((p) => ({ ...p!, category: e.target.value }))} placeholder="models / characters …" /></div>
                <div className="space-y-1.5"><Label>{language === 'en' ? 'Unit' : 'Đơn vị'}</Label><Input value={editingProduct.unit ?? ''} onChange={(e) => setEditingProduct((p) => ({ ...p!, unit: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>{t.adminProductStock}</Label><Input type="number" value={editingProduct.stockLimit ?? -1} onChange={(e) => setEditingProduct((p) => ({ ...p!, stockLimit: Number(e.target.value) }))} placeholder="-1 = ∞" /></div>
              </div>
              <div className="space-y-1.5"><Label>{t.adminProductImage} (URL)</Label><Input value={editingProduct.image ?? ''} onChange={(e) => setEditingProduct((p) => ({ ...p!, image: e.target.value }))} placeholder="https://…" /></div>
              {editingProduct.image && <img src={editingProduct.image} alt="" className="w-full h-32 object-cover rounded-lg border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <div className="space-y-1.5"><Label>{language === 'en' ? 'Description' : 'Mô tả'} (VI)</Label><textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={editingProduct.description ?? ''} onChange={(e) => setEditingProduct((p) => ({ ...p!, description: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>{language === 'en' ? '3D model URL' : 'Link model 3D'}</Label><Input value={editingProduct.modelViewerUrl ?? ''} onChange={(e) => setEditingProduct((p) => ({ ...p!, modelViewerUrl: e.target.value }))} placeholder="/polystore/models/…glb" /></div>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editingProduct.isPromotion} onChange={(e) => setEditingProduct((p) => ({ ...p!, isPromotion: e.target.checked }))} />{t.adminProductPromotion}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editingProduct.pickupOnly} onChange={(e) => setEditingProduct((p) => ({ ...p!, pickupOnly: e.target.checked }))} />{t.adminProductPickupOnly}</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>{t.cancel}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={savingProduct} onClick={() => void saveProduct()}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Coupon edit dialog ---- */}
      <Dialog open={editingCoupon != null} onOpenChange={(o) => { if (!o) setEditingCoupon(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCouponNew ? t.adminAddCoupon : t.adminEditCoupon}</DialogTitle>
          </DialogHeader>
          {editingCoupon && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>{t.adminCouponCode} *</Label>
                <Input value={editingCoupon.code ?? ''} disabled={!isCouponNew} onChange={(e) => setEditingCoupon((c) => ({ ...c!, code: e.target.value.toUpperCase() }))} className="font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>{t.adminCouponDiscount} (%)</Label><Input type="number" value={editingCoupon.discount_percent ?? 0} onChange={(e) => setEditingCoupon((c) => ({ ...c!, discount_percent: Number(e.target.value) }))} /></div>
                <div className="space-y-1.5"><Label>{t.adminCouponMaxUses}</Label><Input type="number" value={editingCoupon.max_uses ?? -1} onChange={(e) => setEditingCoupon((c) => ({ ...c!, max_uses: Number(e.target.value) }))} placeholder="-1 = ∞" /></div>
                <div className="space-y-1.5"><Label>{t.adminCouponMinSpent}</Label><Input type="number" value={editingCoupon.min_spent ?? 0} onChange={(e) => setEditingCoupon((c) => ({ ...c!, min_spent: Number(e.target.value) }))} /></div>
                <div className="space-y-1.5"><Label>{t.adminCouponExpires}</Label><Input type="date" value={editingCoupon.expires_at ? editingCoupon.expires_at.slice(0, 10) : ''} onChange={(e) => setEditingCoupon((c) => ({ ...c!, expires_at: e.target.value || null }))} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCoupon(null)}>{t.cancel}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={savingCoupon} onClick={() => void saveCoupon()}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============ Dashboard sub-component ============
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function DashboardPanel({
  stats,
  loading,
  t,
  statusLabel,
  paymentStatusLabel,
  onRefresh,
}: {
  stats: AdminStats | null;
  loading: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  statusLabel: (s: string) => string;
  paymentStatusLabel: (s?: string) => string;
  onRefresh: () => void;
}) {
  if (loading && !stats) {
    return <p className="text-center text-muted-foreground py-12">{t.processing}</p>;
  }
  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-3">{t.adminNoData}</p>
        <Button variant="outline" onClick={onRefresh}>{t.tryAgain}</Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2"><RefreshCw className="w-4 h-4" />{t.apply}</Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<DollarSign className="w-4 h-4" />} label={t.adminStatRevenue} value={formatPrice(stats.revenue.total)} sub={`${t.adminStatToday}: ${formatPrice(stats.revenue.today)}`} />
        <StatCard icon={<ShoppingBag className="w-4 h-4" />} label={t.adminStatOrders} value={String(stats.orders.total)} sub={`${t.adminStatAvgOrder}: ${formatPrice(stats.orders.averageValue)}`} />
        <StatCard icon={<UsersIcon className="w-4 h-4" />} label={t.adminStatUsers} value={String(stats.users.total)} sub={`${stats.users.admins} admin`} />
        <StatCard icon={<Clock className="w-4 h-4" />} label={t.adminStatPendingPayments} value={String(stats.orders.pendingPayments)} sub={`${stats.products.total} ${t.adminStatProducts.toLowerCase()}`} />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-indigo-500" /><p className="font-semibold text-sm">{t.adminRevenueTrend}</p></div>
        {stats.revenueSeries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">{t.adminNoData}</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.revenueSeries} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => String(v).slice(5)} stroke="currentColor" className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} stroke="currentColor" className="text-muted-foreground" width={40} />
              <RechartTooltip formatter={(v: number) => formatPrice(v)} labelFormatter={(l) => String(l)} contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <p className="font-semibold text-sm mb-3">{t.adminTopProducts}</p>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t.adminNoData}</p>
          ) : (
            <div className="space-y-2">
              {stats.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 grid place-items-center rounded-full bg-indigo-500/15 text-indigo-500 text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{p.quantity}×</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(p.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <p className="font-semibold text-sm mb-3">{t.adminOrdersByStatus}</p>
          <div className="space-y-2">
            {STATUSES.map((s) => {
              const count = stats.orders.byStatus[s] || 0;
              const pct = stats.orders.total ? Math.round((count / stats.orders.total) * 100) : 0;
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{statusLabel(s)}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <p className="font-semibold text-sm mb-3">{t.adminRecentOrders}</p>
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">{t.adminNoData}</p>
        ) : (
          <div className="divide-y divide-border/50">
            {stats.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{o.id}</p>
                  <p className="text-xs text-muted-foreground truncate">{o.userName || o.guestName || '—'} · {shortDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status] || 'border-border'}`}>{statusLabel(o.status)}</span>
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
