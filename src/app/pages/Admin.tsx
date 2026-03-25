import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, RefreshCw, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
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
  adminDeleteOrder,
  adminPatchOrder,
  adminPostOrderNotification,
  deleteAdminOrderNotification,
  deleteAdminUser,
  getAdminOrders,
  getAdminSupportMessages,
  getAdminSupportThreads,
  getAdminUsers,
  patchAdminUser,
  postAdminSupportMessage,
  type AdminUserRow,
  type ApiOrder,
  type SupportMessage,
  type SupportThread,
} from '../lib/api';
import { isNumericStudentId } from '../lib/authValidation';

const STATUSES = ['pending', 'processing', 'ready', 'completed', 'cancelled'] as const;

export default function Admin() {
  const { user, authReady } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState('orders');

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});
  const [draftEta, setDraftEta] = useState<Record<string, string>>({});
  const [draftMsg, setDraftMsg] = useState<Record<string, string>>({});
  const [draftCancelReason, setDraftCancelReason] = useState<Record<string, string>>({});
  const [draftDelivery, setDraftDelivery] = useState<Record<string, string>>({});
  const [draftPickup, setDraftPickup] = useState<Record<string, string>>({});
  const [draftPayment, setDraftPayment] = useState<Record<string, string>>({});

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserStudentId, setEditUserStudentId] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilter, setUserFilter] = useState<number | null>(null);

  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [threadsLoadError, setThreadsLoadError] = useState(false);
  const [chatUserId, setChatUserId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([]);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLoadError, setChatLoadError] = useState(false);

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
      for (const o of list) {
        st[o.id] = o.status;
        et[o.id] = o.estimatedTime || '';
        cr[o.id] = o.cancelReason || '';
        dd[o.id] = o.deliveryAddress || '';
        dp[o.id] = o.pickupLocation || '';
        pm[o.id] = o.paymentMethod || '';
      }
      setDraftStatus(st);
      setDraftEta(et);
      setDraftCancelReason(cr);
      setDraftDelivery(dd);
      setDraftPickup(dp);
      setDraftPayment(pm);
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

  useEffect(() => {
    if (!authReady || user?.role !== 'admin') return;
    void loadOrders();
  }, [authReady, user?.role, loadOrders]);

  useEffect(() => {
    if ((tab === 'users' || userFilter != null) && user?.role === 'admin') void loadUsers();
  }, [tab, userFilter, user?.role, loadUsers]);

  useEffect(() => {
    if (tab === 'chat' && user?.role === 'admin') {
      void loadThreads();
      const id = window.setInterval(() => void loadThreads(), 8000);
      return () => window.clearInterval(id);
    }
  }, [tab, user?.role, loadThreads]);

  useEffect(() => {
    if (tab === 'chat' && chatUserId != null) void loadChat(chatUserId);
  }, [tab, chatUserId, loadChat]);

  useEffect(() => {
    if (tab !== 'chat' || chatUserId == null) return;
    const id = window.setInterval(() => void loadChat(chatUserId), 5000);
    return () => window.clearInterval(id);
  }, [tab, chatUserId, loadChat]);

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
    return <Navigate to="/auth?return=/admin" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted pb-20 md:pt-16">
          <Header title={t.adminPanel} showBack />
          <div className="max-w-lg mx-auto px-4 pt-16 text-center space-y-4">
            <p className="text-muted-foreground">{t.adminAccessDenied}</p>
            <p className="text-sm text-muted-foreground">{t.adminSignInAsAdmin}</p>
            <Link to="/" className="text-red-600 font-medium underline">
              {t.home}
            </Link>
          </div>
        </div>
      </>
    );
  }

  const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  const statusLabel = (s: string) => {
    switch (s) {
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
        return s;
    }
  };

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
      };
      if (st === 'cancelled' && draftCancelReason[orderId]?.trim()) {
        patch.cancelReason = draftCancelReason[orderId].trim();
      }
      const updated = await adminPatchOrder(orderId, patch);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      toast.success(t.save);
    } catch {
      toast.error(t.orderError);
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
        prev.map((o) =>
          o.id === orderId ? { ...o, notifications: [...(o.notifications || []), note] } : o,
        ),
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
          o.id === orderId
            ? { ...o, notifications: (o.notifications || []).filter((x) => x.id !== noteId) }
            : o,
        ),
      );
      toast.success(t.delete);
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



  const removeUser = async (u: AdminUserRow) => {
    if (!window.confirm(`${t.delete} ${u.schoolEmail}?`)) return;
    try {
      await deleteAdminUser(u.id);
      setUsers((list) => list.filter((x) => x.id !== u.id));
      toast.success(t.delete);
    } catch {
      toast.error(t.orderError);
    }
  };

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

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-20 md:pt-16">
        <Header title={t.adminPanel} showBack />

        <div className="max-w-6xl mx-auto px-4 py-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
              <TabsTrigger value="orders">{t.adminTabOrders}</TabsTrigger>
              <TabsTrigger value="users">{t.adminTabUsers}</TabsTrigger>
              <TabsTrigger value="chat">{t.adminTabChat}</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              <div className="flex flex-wrap justify-between gap-3">
                <p className="text-sm text-muted-foreground">{t.adminOrdersHint}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void loadOrders()}
                  disabled={ordersLoading}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                  {t.apply}
                </Button>
              </div>

              {userFilter != null && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <span className="font-semibold">{t.adminFilteringByUser}:</span>
                    <span>
                      {users.find(u => u.id === userFilter)?.name || users.find(u => u.id === userFilter)?.schoolEmail || `ID: ${userFilter}`}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setUserFilter(null)}
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-100/50"
                  >
                    {t.adminClearFilter}
                  </Button>
                </div>
              )}

              {ordersLoading && orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">{t.processing}</p>
              ) : (
                <div className="space-y-3">
                  {orders
                    .filter(o => userFilter == null || o.userId === userFilter)
                    .map((o) => {
                    const open = openId === o.id;
                    return (
                      <div key={o.id} className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted"
                          onClick={() => setOpenId(open ? null : o.id)}
                        >
                          <div>
                            <p className="font-semibold">{o.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {[o.userName, o.userEmail].filter(Boolean).join(' · ')}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {statusLabel(o.status)} · {formatPrice(o.total)}
                            </p>
                          </div>
                          {open ? (
                            <ChevronUp className="w-5 h-5 shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 shrink-0" />
                          )}
                        </button>
                        {open && (
                          <div className="px-4 pb-4 pt-0 border-t border-border/50 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4 pt-4">
                              <div className="space-y-2 sm:col-span-2">
                                <Label>{t.adminDeliveryAddress}</Label>
                                <Input
                                  value={draftDelivery[o.id] ?? ''}
                                  onChange={(e) =>
                                    setDraftDelivery((d) => ({ ...d, [o.id]: e.target.value }))
                                  }
                                  placeholder="—"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t.adminPickupLocation}</Label>
                                <Input
                                  value={draftPickup[o.id] ?? ''}
                                  onChange={(e) =>
                                    setDraftPickup((d) => ({ ...d, [o.id]: e.target.value }))
                                  }
                                  placeholder="—"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t.adminPaymentMethod}</Label>
                                <Input
                                  value={draftPayment[o.id] ?? ''}
                                  onChange={(e) =>
                                    setDraftPayment((d) => ({ ...d, [o.id]: e.target.value }))
                                  }
                                  placeholder="cash / card"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t.orderStatus}</Label>
                                <select
                                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                  value={draftStatus[o.id] || o.status}
                                  onChange={(e) =>
                                    setDraftStatus((d) => ({ ...d, [o.id]: e.target.value }))
                                  }
                                >
                                  {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {statusLabel(s)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>{t.estimatedTime}</Label>
                                <Input
                                  value={draftEta[o.id] ?? ''}
                                  onChange={(e) =>
                                    setDraftEta((d) => ({ ...d, [o.id]: e.target.value }))
                                  }
                                  placeholder="15-30 mins"
                                />
                              </div>
                            </div>
                            {draftStatus[o.id] === 'cancelled' && (
                              <div className="space-y-2">
                                <Label>{t.orderDeclinedNote}</Label>
                                <Input
                                  value={draftCancelReason[o.id] ?? ''}
                                  onChange={(e) =>
                                    setDraftCancelReason((d) => ({
                                      ...d,
                                      [o.id]: e.target.value,
                                    }))
                                  }
                                  placeholder={t.orderCancelReasonLabel}
                                />
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                className="bg-red-600 hover:bg-red-700"
                                disabled={savingId === o.id}
                                onClick={() => void saveOrder(o.id)}
                              >
                                {t.save}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                disabled={savingId === o.id}
                                onClick={() => void removeOrder(o.id)}
                              >
                                {t.adminDeleteOrder}
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Label>{t.adminNotifyPlaceholder}</Label>
                              <textarea
                                className="w-full min-h-[88px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder={t.adminNotifyPlaceholder}
                                value={draftMsg[o.id] ?? ''}
                                onChange={(e) =>
                                  setDraftMsg((d) => ({ ...d, [o.id]: e.target.value }))
                                }
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                disabled={savingId === o.id}
                                onClick={() => void sendNote(o.id)}
                              >
                                {t.adminSendUpdate}
                              </Button>
                            </div>
                            {o.notifications && o.notifications.length > 0 && (
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p className="font-medium text-foreground">{t.orderUpdatesFromStore}</p>
                                <ul className="space-y-2 pl-0 list-none">
                                  {o.notifications.map((n) => (
                                    <li
                                      key={n.id}
                                      className="flex items-start justify-between gap-2 text-sm border border-border/50 rounded-md p-2 bg-muted/80"
                                    >
                                      <span>
                                        {n.message}
                                        <span className="text-xs text-gray-400 ml-2 block sm:inline">
                                          {new Date(n.createdAt).toLocaleString()}
                                        </span>
                                      </span>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                                        title={t.deleteNotification}
                                        onClick={() => void removeNotification(o.id, n.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users">
              {usersLoading ? (
                <p className="text-muted-foreground">{t.processing}</p>
              ) : (
                <div className="bg-card text-card-foreground rounded-xl border border-border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b">
                      <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">{t.schoolEmail}</th>
                        <th className="text-left p-3">{t.fullName}</th>
                        <th className="text-left p-3">{t.studentIdLabel}</th>
                        <th className="text-left p-3">{t.userRole}</th>
                        <th className="text-left p-3">{t.totalOrders}</th>
                        <th className="text-left p-3">{t.totalSpent}</th>
                        <th className="text-left p-3">{t.lastLogin}</th>
                        <th className="p-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-border/50">
                          <td className="p-3">{u.id}</td>
                          <td className="p-3 max-w-[140px] truncate">{u.schoolEmail}</td>
                          <td className="p-3">{u.name}</td>
                          <td className="p-3">{u.studentId}</td>
                          <td className="p-3">
                            <span
                              className={
                                u.role === 'admin' ? 'text-red-600 font-medium' : 'text-muted-foreground'
                              }
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">{u.orderCount}</td>
                          <td className="p-3">{formatPrice(u.totalSpent)}</td>
                          <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                            {u.lastLoginAt
                              ? new Date(u.lastLoginAt).toLocaleString()
                              : '—'}
                          </td>
                          <td className="p-3 space-x-1 whitespace-nowrap">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setEditingUser(u);
                                setEditUserName(u.name);
                                setEditUserStudentId(u.studentId);
                              }}
                            >
                              {t.adminEditUser}
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                setUserFilter(u.id);
                                setTab('orders');
                              }}
                            >
                              {t.adminViewOrders}
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => void removeUser(u)}
                            >
                              {t.delete}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat">
              <div className="grid md:grid-cols-3 gap-4 min-h-[420px]">
                <div className="md:col-span-1 bg-card text-card-foreground rounded-xl border border-border overflow-y-auto max-h-[480px]">
                  {threadsLoadError && (
                    <div className="p-3 border-b border-amber-100 bg-amber-50 text-xs text-amber-900 flex flex-col gap-2">
                      <span>{t.loadFailed}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-amber-300"
                        onClick={() => void loadThreads()}
                      >
                        {t.tryAgain}
                      </Button>
                    </div>
                  )}
                  {threads.length === 0 && !threadsLoadError && (
                    <p className="p-4 text-sm text-muted-foreground">{t.noThreadsYet}</p>
                  )}
                  {threads.map((th) => (
                      <button
                        key={th.userId}
                        type="button"
                        onClick={() => {
                          setChatUserId(th.userId);
                          void loadChat(th.userId);
                        }}
                        className={`w-full text-left p-3 border-b border-border/50 hover:bg-muted ${
                          chatUserId === th.userId ? 'bg-red-50' : ''
                        }`}
                      >
                        <p className="font-medium text-sm">{th.userName || th.userEmail}</p>
                        <p className="text-xs text-muted-foreground truncate">{th.lastMessage?.body}</p>
                      </button>
                    ))}
                </div>
                <div className="md:col-span-2 flex flex-col bg-card text-card-foreground rounded-xl border border-border p-3 min-h-[360px]">
                  {chatUserId == null ? (
                    <p className="text-sm text-muted-foreground">{t.noThreadsYet}</p>
                  ) : (
                    <>
                      {chatLoadError && (
                        <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 flex flex-wrap items-center gap-2">
                          <span className="flex-1 min-w-0">{t.loadFailed}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 h-7 border-amber-300"
                            onClick={() => void loadChat(chatUserId)}
                          >
                            {t.tryAgain}
                          </Button>
                        </div>
                      )}
                      <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[300px]">
                        {chatLoading && chatMessages.length === 0 ? (
                          <p className="text-sm text-muted-foreground">{t.processing}</p>
                        ) : (
                          chatMessages.map((m) => (
                            <div
                              key={m.id}
                              className={`flex ${m.fromAdmin ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                                  m.fromAdmin
                                    ? 'bg-red-600 text-white rounded-tr-sm'
                                    : 'bg-muted/50 text-foreground rounded-tl-sm'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{m.body}</p>
                                <p
                                  className={`text-[10px] mt-1 ${
                                    m.fromAdmin ? 'text-red-100' : 'text-muted-foreground'
                                  }`}
                                >
                                  {new Date(m.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          className="flex-1 min-h-[40px] rounded-lg border border-border px-3 py-2 text-sm"
                          placeholder={t.supportTypeMessage}
                          value={chatText}
                          onChange={(e) => setChatText(e.target.value)}
                        />
                        <Button
                          type="button"
                          className="bg-red-600 hover:bg-red-700 shrink-0"
                          onClick={() => void sendAdminChat()}
                        >
                          {t.supportSend}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={editingUser != null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-card text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.adminEditUser}</DialogTitle>
            <DialogDescription>{editingUser?.schoolEmail}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="adm-user-name">{t.fullName}</Label>
              <Input
                id="adm-user-name"
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adm-user-sid">{t.studentIdLabel}</Label>
              <Input
                id="adm-user-sid"
                inputMode="numeric"
                value={editUserStudentId}
                onChange={(e) => setEditUserStudentId(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
              {t.cancel}
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!editingUser) return;
                if (!editUserName.trim()) {
                  toast.error(t.authFillFields);
                  return;
                }
                if (!isNumericStudentId(editUserStudentId)) {
                  toast.error(t.authStudentIdNumbersOnly);
                  return;
                }
                try {
                  const updated = await patchAdminUser(editingUser.id, {
                    name: editUserName.trim(),
                    studentId: editUserStudentId.trim(),
                  });
                  setUsers((list) => list.map((x) => (x.id === editingUser.id ? { ...x, ...updated } : x)));
                  toast.success(t.save);
                  setEditingUser(null);
                } catch {
                  toast.error(t.orderError);
                }
              }}
            >
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
