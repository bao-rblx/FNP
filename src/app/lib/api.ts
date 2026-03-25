import type { PublicUser } from './authValidation';

const TOKEN_KEY = 'fnp_token';

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
  studentId: string;
  password: string;
}): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getMe(): Promise<PublicUser> {
  return apiFetch<PublicUser>('/api/auth/me');
}

export async function patchMe(body: { name?: string; studentId?: string }): Promise<PublicUser> {
  return apiFetch<PublicUser>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export type OrderItemPayload = {
  id: string;
  name: string;
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
  cancelReason?: string;
  notifications?: OrderNotification[];
  userEmail?: string;
  userName?: string;
}

export async function postOrder(body: {
  items: OrderItemPayload[];
  total: number;
  deliveryAddress?: string;
  pickupLocation?: string;
  paymentMethod?: string;
  estimatedTime?: string;
}): Promise<ApiOrder> {
  return apiFetch<ApiOrder>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
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
  name: string;
  studentId: string;
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
  body: { name?: string; studentId?: string; role?: 'user' | 'admin' },
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
