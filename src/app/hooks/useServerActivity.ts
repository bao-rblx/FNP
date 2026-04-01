import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getCustomerAlerts, getAdminAlerts, ApiError } from '../lib/api';
import { loadNotifyPrefs, showBrowserNotification } from '../lib/notificationPrefs';
import { playAdminIncomingSound, playCustomerIncomingSound, unlockAudio } from '../lib/sounds';

const POLL_MS = 5_000;

export interface ActivityToastCopy {
  orderUpdate: string;
  supportReply: string;
  adminNewActivity: string;
}

type OnCustomerActivity = () => void;

/**
 * Polls admin/customer alert endpoints: optional sounds, toasts, and browser notifications.
 */
export function useServerActivity(
  enabled: boolean,
  isAdmin: boolean,
  copy: ActivityToastCopy,
  onCustomerActivity?: OnCustomerActivity,
) {
  const ref = useRef<{
    orderCount: number;
    latestOrderAt: string | null;
    maxUserSupportId: number;
    maxNotificationId: number;
    maxAdminSupportId: number;
  } | null>(null);
  const first = useRef(true);

  useEffect(() => {
    ref.current = null;
    first.current = true;

    if (!enabled) {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      const prefs = loadNotifyPrefs();
      try {
        if (isAdmin) {
          const a = await getAdminAlerts();
          if (cancelled) return;
          const prev = ref.current;
          if (!prev) {
            ref.current = {
              orderCount: a.orderCount,
              latestOrderAt: a.latestOrderCreatedAt,
              maxUserSupportId: a.maxUserSupportId,
              maxNotificationId: 0,
              maxAdminSupportId: 0,
            };
            first.current = false;
            return;
          }
          if (!first.current) {
            const newOrder =
              a.orderCount > prev.orderCount || a.latestOrderCreatedAt !== prev.latestOrderAt;
            const newChat = a.maxUserSupportId > prev.maxUserSupportId;
            if ((newOrder || newChat) && prefs.soundEnabled) {
              playAdminIncomingSound();
            }
            if ((newOrder || newChat) && prefs.orders) {
              toast.message(copy.adminNewActivity);
            }
          }
          ref.current = {
            orderCount: a.orderCount,
            latestOrderAt: a.latestOrderCreatedAt,
            maxUserSupportId: a.maxUserSupportId,
            maxNotificationId: prev.maxNotificationId,
            maxAdminSupportId: prev.maxAdminSupportId,
          };
        } else {
          const c = await getCustomerAlerts();
          if (cancelled) return;
          const prev = ref.current;
          if (!prev) {
            ref.current = {
              orderCount: 0,
              latestOrderAt: null,
              maxUserSupportId: 0,
              maxNotificationId: c.maxNotificationId,
              maxAdminSupportId: c.maxAdminSupportId,
            };
            first.current = false;
            return;
          }
          if (!first.current) {
            const newNotif = c.maxNotificationId > prev.maxNotificationId;
            const newChat = c.maxAdminSupportId > prev.maxAdminSupportId;
            if (newNotif || newChat) {
              if (prefs.orders) {
                if (newNotif) {
                  toast.info(copy.orderUpdate, { duration: 8000 });
                  if (prefs.pushEnabled) showBrowserNotification('FlashNPrint', copy.orderUpdate);
                  onCustomerActivity?.();
                }
                if (newChat) {
                  toast.info(copy.supportReply, { duration: 8000 });
                  if (prefs.pushEnabled) showBrowserNotification('FlashNPrint', copy.supportReply);
                  onCustomerActivity?.();
                }
              }
              if (prefs.soundEnabled) playCustomerIncomingSound();
            }
          }
          ref.current = {
            ...prev,
            maxNotificationId: c.maxNotificationId,
            maxAdminSupportId: c.maxAdminSupportId,
          };
        }
        first.current = false;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          ref.current = null;
        }
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, isAdmin, copy.orderUpdate, copy.supportReply, copy.adminNewActivity, onCustomerActivity]);
}

export function useAudioUnlockOnInteraction() {
  useEffect(() => {
    const go = () => unlockAudio();
    window.addEventListener('pointerdown', go, { passive: true });
    window.addEventListener('keydown', go);
    return () => {
      window.removeEventListener('pointerdown', go);
      window.removeEventListener('keydown', go);
    };
  }, []);
}
