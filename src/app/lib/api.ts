import type { PublicUser } from './authValidation';
import { polystoreProducts } from '../data/polystoreProducts';

const TOKEN_KEY = 'polystore_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  return base ? `${base.replace(/\/$/, '')}${path}` : path;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let res: Response;
  try {
    res = await fetch(apiUrl(path), { ...init, headers });
  } catch {
    throw new ApiError('Network error', 0, 'network');
  }
  const data = await parseJson<{ error?: string } & T>(res);
  if (!res.ok) {
    const code = data && typeof data === 'object' && 'error' in data ? String(data.error) : undefined;
    throw new ApiError(res.statusText || 'Request failed', res.status, code);
  }
  return data as T;
}

export interface LoginResponse {
  token: string;
  user: PublicUser;
}

export async function postLogin(body: { email: string; password: string }): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function postRegister(body: {
  name: string;
  schoolEmail: string;
  phone?: string;
  password: string;
}): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function postForgotPassword(email: string): Promise<{ ok: boolean; debug_token?: string }> {
  return apiFetch<{ ok: boolean; debug_token?: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function postResetPassword(token: string, newPassword: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function postChangePassword(oldPassword: string, newPassword: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function getMe(): Promise<PublicUser> {
  return apiFetch<PublicUser>('/api/auth/me');
}

export async function patchMe(body: { name?: string; phone?: string }): Promise<PublicUser> {
  return apiFetch<PublicUser>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export interface ProductVariant {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
}

export interface ApiProduct {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  category: string;
  image: string;
  unit: string;
  minQuantity: number;
  pickupOnly: boolean;
  variants?: ProductVariant[];
  isPromotion: boolean;
  stockLimit: number;
  modelViewerUrl?: string;
  subName?: string;
  rating?: number;
  reviewCount?: number;
  polyCount?: string;
  vertexCount?: string;
  textures?: string;
  rigged?: boolean;
  animated?: boolean;
  formats?: string[];
  accentColor?: string;
  tags?: string[];
}

export async function getProducts(): Promise<ApiProduct[]> {
  return polystoreProducts;
}

/**
 * Admin catalog source of truth: the SQLite-backed products table.
 * The public storefront intentionally reads the static `polystoreProducts`
 * catalog (see getProducts), so admin CRUD operates on the DB via this call.
 */
export async function getAdminProducts(): Promise<ApiProduct[]> {
  return apiFetch<ApiProduct[]>('/api/products');
}

export async function adminPostProduct(product: Partial<ApiProduct>): Promise<ApiProduct> {
  return apiFetch<ApiProduct>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function adminPatchProduct(id: string, product: Partial<ApiProduct>): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(product),
  });
}

export async function adminDeleteProduct(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export interface ApiCoupon {
  code: string;
  discount_percent: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  min_spent: number;
}

export async function getAdminCoupons(): Promise<ApiCoupon[]> {
  return apiFetch<ApiCoupon[]>('/api/admin/coupons');
}

export interface CouponInput {
  discountPercent: number;
  maxUses?: number;
  expiresAt?: string | null;
  minSpent?: number;
}

export async function adminPostCoupon(coupon: CouponInput & { code: string }): Promise<ApiCoupon> {
  return apiFetch<ApiCoupon>('/api/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(coupon),
  });
}

export async function adminPatchCoupon(code: string, body: Partial<CouponInput>): Promise<ApiCoupon> {
  return apiFetch<ApiCoupon>(`/api/admin/coupons/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function adminDeleteCoupon(code: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/admin/coupons/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  });
}

export async function postValidateCoupon(code: string, totalSpent: number): Promise<{ code: string; discountPercent: number }> {
  return apiFetch<{ code: string; discountPercent: number }>('/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, totalSpent }),
  });
}

export type OrderItemPayload = {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
  unit: string;
  minQuantity?: number;
  fileNames?: string[];
};

export interface OrderNotification {
  id: number;
  message: string;
  createdAt: string;
}

export interface ApiOrder {
  id: string;
  userId?: number;
  items: OrderItemPayload[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  estimatedTime?: string;
  deliveryAddress?: string;
  pickupLocation?: string;
  paymentMethod?: string;
  paymentStatus?: 'unpaid' | 'pending_verification' | 'paid';
  deliveryDate?: string;
  deliveryTime?: string;
  receivedPoints?: number;
  cancelReason?: string;
  notifications?: OrderNotification[];
  userEmail?: string;
  userName?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
}

export async function postOrder(body: {
  items: OrderItemPayload[];
  total: number;
  deliveryAddress?: string;
  pickupLocation?: string;
  paymentMethod?: string;
  estimatedTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
}): Promise<ApiOrder> {
  return apiFetch<ApiOrder>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function postGuestOrder(body: {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  items: OrderItemPayload[];
  total: number;
  deliveryAddress?: string;
  pickupLocation?: string;
  paymentMethod?: string;
  estimatedTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
}): Promise<ApiOrder> {
  return apiFetch<ApiOrder>('/api/orders/guest', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getGuestOrder(id: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/api/orders/guest/${encodeURIComponent(id)}`);
}

export async function getOrders(): Promise<ApiOrder[]> {
  return apiFetch<ApiOrder[]>('/api/orders');
}

export async function getOrder(id: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/api/orders/${encodeURIComponent(id)}`);
}

export async function getAdminOrders(): Promise<ApiOrder[]> {
  return apiFetch<ApiOrder[]>('/api/admin/orders');
}

export async function adminPatchOrder(
  id: string,
  body: {
    status?: string;
    estimatedTime?: string;
    cancelReason?: string;
    deliveryAddress?: string;
    pickupLocation?: string;
    paymentMethod?: string;
    paymentStatus?: 'unpaid' | 'pending_verification' | 'paid';
  },
): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function adminPostOrderNotification(
  orderId: string,
  message: string,
): Promise<OrderNotification> {
  return apiFetch<OrderNotification>(`/api/admin/orders/${encodeURIComponent(orderId)}/notifications`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function deleteAdminOrderNotification(
  orderId: string,
  noteId: number,
 ): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(
    `/api/admin/orders/${encodeURIComponent(orderId)}/notifications/${noteId}`,
    { method: 'DELETE' },
  );
}

export interface CustomerAlerts {
  maxNotificationId: number;
  maxAdminSupportId: number;
}

export async function getCustomerAlerts(): Promise<CustomerAlerts> {
  return apiFetch<CustomerAlerts>('/api/customer/alerts');
}

export interface AdminAlerts {
  orderCount: number;
  latestOrderCreatedAt: string | null;
  maxUserSupportId: number;
}

export async function getAdminAlerts(): Promise<AdminAlerts> {
  return apiFetch<AdminAlerts>('/api/admin/alerts');
}

export async function postCancelOrder(orderId: string, reason?: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || '' }),
  });
}

export async function postPaymentSubmitted(orderId: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/api/orders/${encodeURIComponent(orderId)}/payment-submitted`, {
    method: 'POST',
  });
}

export async function postGuestPaymentSubmitted(orderId: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/api/orders/guest/${encodeURIComponent(orderId)}/payment-submitted`, {
    method: 'POST',
  });
}

export async function postOrderReceived(orderId: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/api/orders/${encodeURIComponent(orderId)}/received`, {
    method: 'POST',
  });
}

export async function adminConfirmPayment(orderId: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/api/admin/orders/${encodeURIComponent(orderId)}/confirm-payment`, {
    method: 'POST',
  });
}

export async function adminRejectPayment(orderId: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/api/admin/orders/${encodeURIComponent(orderId)}/reject-payment`, {
    method: 'POST',
  });
}

export async function adminDeleteOrder(orderId: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
  });
}

export interface SupportMessage {
  id: number;
  orderId?: string | null;
  fromAdmin: boolean;
  body: string;
  createdAt: string;
}

export async function getSupportMessages(): Promise<SupportMessage[]> {
  return apiFetch<SupportMessage[]>('/api/support/messages');
}

export async function postSupportMessage(body: string, orderId?: string): Promise<SupportMessage> {
  return apiFetch<SupportMessage>('/api/support/messages', {
    method: 'POST',
    body: JSON.stringify({ body, orderId }),
  });
}

export interface SupportThread {
  userId: number;
  userEmail?: string;
  userName?: string;
  lastMessage: SupportMessage;
}

export async function getAdminSupportThreads(): Promise<SupportThread[]> {
  return apiFetch<SupportThread[]>('/api/admin/support/threads');
}

export async function getAdminSupportMessages(userId: number): Promise<SupportMessage[]> {
  return apiFetch<SupportMessage[]>(`/api/admin/support/messages?userId=${userId}`);
}

export async function postAdminSupportMessage(
  userId: number,
  body: string,
  orderId?: string,
): Promise<SupportMessage> {
  return apiFetch<SupportMessage>('/api/admin/support/messages', {
    method: 'POST',
    body: JSON.stringify({ userId, body, orderId }),
  });
}

export interface AdminUserRow {
  id: number;
  schoolEmail: string;
  phone?: string | null;
  name: string;
  role: string;
  createdAt?: string;
  lastLoginAt?: string | null;
  orderCount: number;
  totalSpent: number;
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  return apiFetch<AdminUserRow[]>('/api/admin/users');
}

export async function patchAdminUser(
  id: number,
  body: {
    name?: string;
    role?: 'user' | 'admin';
  },
): Promise<AdminUserRow> {
  return apiFetch<AdminUserRow>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteAdminUser(id: number): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/admin/users/${id}`, {
    method: 'DELETE',
  });
}

export interface AdminStatRecentOrder {
  id: string;
  total: number;
  status: string;
  paymentStatus: 'unpaid' | 'pending_verification' | 'paid';
  createdAt: string;
  userName?: string | null;
  guestName?: string | null;
}

export interface AdminStats {
  revenue: { total: number; last30Days: number; today: number };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    pendingPayments: number;
    last30Days: number;
    averageValue: number;
  };
  users: { total: number; admins: number; newLast30Days: number };
  products: { total: number };
  coupons: { total: number };
  recentOrders: AdminStatRecentOrder[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  revenueSeries: { date: string; revenue: number; orders: number }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/api/admin/stats');
}
