const KEY = 'fnp_notify_prefs_v1';

export interface NotifyPrefs {
  orders: boolean;
  promos: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
}

const defaults: NotifyPrefs = {
  orders: true,
  promos: true,
  soundEnabled: true,
  pushEnabled: false,
};

export function loadNotifyPrefs(): NotifyPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      orders: p.orders !== false,
      promos: p.promos !== false,
      soundEnabled: p.soundEnabled !== false,
      pushEnabled: p.pushEnabled === true,
    };
  } catch {
    return { ...defaults };
  }
}

export function saveNotifyPrefs(p: NotifyPrefs): void {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied';
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, body: string): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, tag: 'fnp-activity' });
  } catch {
    /* ignore */
  }
}
