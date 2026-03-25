import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAudioUnlockOnInteraction, useServerActivity } from '../hooks/useServerActivity';

/** Polls server activity: optional sound, in-app toasts, browser notifications (see Profile → Notifications). */
export function ActivitySoundBridge() {
  const { user, authReady, refreshSession } = useAuth();
  const { t } = useLanguage();

  const copy = useMemo(
    () => ({
      orderUpdate: t.toastOrderUpdate,
      supportReply: t.toastSupportReply,
      adminNewActivity: t.toastAdminActivity,
    }),
    [t],
  );

  const onCustomer = useCallback(() => {
    void refreshSession();
  }, [refreshSession]);

  useAudioUnlockOnInteraction();
  useServerActivity(Boolean(authReady && user), user?.role === 'admin', copy, onCustomer);

  return null;
}
