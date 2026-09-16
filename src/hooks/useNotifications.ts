import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { AppNotification } from '../types/notification';
import type { IncomeRecord, IncomeCycle, CycleSummary } from '../types/income';
import type { UserSettings } from '../types/settings';
import { DEFAULT_NOTIFICATION_PREFS } from '../types/settings';
import { useLanguage } from '../contexts/LanguageContext';
import { getTodayISO } from '../utils/dateUtils';
import {
  subscribeToWebPush,
  unsubscribeFromWebPush,
  getExistingPushSubscription,
} from '../services/webPushService';
import { supabaseNotificationService } from '../services/supabaseNotificationService';
import { isSupabaseConfigured } from '../services/supabaseClient';

const STORAGE_PREFIX = 'daily_income_notifs_';
const TRIGGERED_PREFIX = 'daily_income_notif_triggered_';

interface UseNotificationsProps {
  userId?: string;
  records: IncomeRecord[];
  currentCycle?: IncomeCycle | null;
  cycleSummary?: CycleSummary;
  settings?: UserSettings;
}

export function useNotifications({
  userId,
  records,
  currentCycle,
  cycleSummary,
  settings,
}: UseNotificationsProps) {
  const { t } = useLanguage();
  const effectiveUserId = userId || 'default_user';
  const storageKey = `${STORAGE_PREFIX}${effectiveUserId}`;
  const triggeredKey = `${TRIGGERED_PREFIX}${effectiveUserId}`;
  const isSupabaseLive = isSupabaseConfigured() && Boolean(userId) && userId !== 'demo_user' && userId !== 'default_user';

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const isLoadedRef = useRef(false);

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false);

  // Check existing Web Push subscription
  useEffect(() => {
    getExistingPushSubscription().then((sub) => {
      setIsPushSubscribed(Boolean(sub));
    });
  }, []);

  // 1. Tải thông báo từ Supabase hoặc LocalStorage khi userId thay đổi
  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      // Đọc trước từ LocalStorage để render tức thì
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved && isMounted) {
          setNotifications(JSON.parse(saved));
        }
      } catch {
        // ignore
      }

      // Nếu có Supabase, tải từ Cloud về để đồng bộ đa thiết bị
      if (isSupabaseLive && userId) {
        try {
          const cloudNotifs = await supabaseNotificationService.fetchNotifications(userId);
          if (isMounted && cloudNotifs && cloudNotifs.length > 0) {
            setNotifications(cloudNotifs);
            localStorage.setItem(storageKey, JSON.stringify(cloudNotifs));
          }
        } catch (err) {
          console.warn('Lỗi tải thông báo Supabase:', err);
        }
      }

      if (isMounted) {
        isLoadedRef.current = true;
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [userId, storageKey, isSupabaseLive]);

  // Request browser push notification permission and register Web Push
  const requestPushPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        const res = await subscribeToWebPush(effectiveUserId);
        setIsPushSubscribed(res.success);
      }
      return perm;
    } catch {
      return 'denied';
    }
  }, [effectiveUserId]);

  // Toggle Web Push Subscription
  const togglePushSubscription = useCallback(async () => {
    if (isPushSubscribed) {
      const res = await unsubscribeFromWebPush(effectiveUserId);
      if (res.success) setIsPushSubscribed(false);
      return false;
    } else {
      const res = await subscribeToWebPush(effectiveUserId);
      if (res.success) setIsPushSubscribed(true);
      return res.success;
    }
  }, [isPushSubscribed, effectiveUserId]);

  // Dispatch browser notification if permitted (supports mobile PWA via Service Worker)
  const sendPushNotification = useCallback(
    (title: string, body: string) => {
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready
              .then((reg) => {
                reg.showNotification(title, {
                  body,
                  icon: '/favicon.svg',
                  badge: '/favicon.svg',
                  tag: 'daily-income-notification',
                });
              })
              .catch(() => {
                new Notification(title, { body, icon: '/favicon.svg' });
              });
          } else {
            new Notification(title, { body, icon: '/favicon.svg' });
          }
        } catch {
          // ignore
        }
      }
    },
    []
  );

  // Add a new notification with deduplication
  const addNotification = useCallback(
    (
      notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>,
      dedupKey?: string
    ) => {
      if (dedupKey) {
        try {
          const triggeredRaw = localStorage.getItem(triggeredKey);
          const triggeredList: string[] = triggeredRaw ? JSON.parse(triggeredRaw) : [];
          if (triggeredList.includes(dedupKey)) {
            return; // Đã kích hoạt hôm nay rồi, không tạo lại nữa
          }
          triggeredList.push(dedupKey);
          if (triggeredList.length > 200) triggeredList.splice(0, triggeredList.length - 200);
          localStorage.setItem(triggeredKey, JSON.stringify(triggeredList));
        } catch {
          // ignore
        }
      }

      const newNotif: AppNotification = {
        ...notif,
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => {
        const next = [newNotif, ...prev.filter((n) => n.id !== newNotif.id).slice(0, 49)];
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      sendPushNotification(newNotif.title, newNotif.message);

      // Lưu lên Supabase nếu có kết nối
      if (isSupabaseLive && userId) {
        supabaseNotificationService.insertNotification(userId, newNotif, dedupKey).catch(console.error);
      }
    },
    [sendPushNotification, triggeredKey, storageKey, isSupabaseLive, userId]
  );

  // Mark a single notification as read
  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      if (isSupabaseLive && userId) {
        supabaseNotificationService.markAsRead(userId, id).catch(console.error);
      }
    },
    [storageKey, isSupabaseLive, userId]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    if (isSupabaseLive && userId) {
      supabaseNotificationService.markAllAsRead(userId).catch(console.error);
    }
  }, [storageKey, isSupabaseLive, userId]);

  // Remove one notification permanently
  const removeNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const next = prev.filter((n) => n.id !== id);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      if (isSupabaseLive && userId) {
        supabaseNotificationService.deleteNotification(userId, id).catch(console.error);
      }
    },
    [storageKey, isSupabaseLive, userId]
  );

  // Clear all notifications permanently
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }

    if (isSupabaseLive && userId) {
      supabaseNotificationService.clearAll(userId).catch(console.error);
    }
  }, [storageKey, isSupabaseLive, userId]);

  // Count unread
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Evaluate smart notification triggers
  useEffect(() => {
    if (!isLoadedRef.current) return;

    const prefs = settings?.notificationPrefs || DEFAULT_NOTIFICATION_PREFS;
    if (prefs.enabled === false) return;

    const today = getTodayISO();
    const now = new Date();
    const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();

    // Helper: Parse 'HH:mm' to minutes from midnight
    const parseTimeToMinutes = (timeStr?: string, defaultMinutes = 420) => {
      if (!timeStr) return defaultMinutes;
      const [h, m] = timeStr.split(':').map(Number);
      if (isNaN(h)) return defaultMinutes;
      return h * 60 + (isNaN(m) ? 0 : m);
    };

    const morningTargetMinutes = parseTimeToMinutes(prefs.morningShiftTime, 7 * 60); // default 07:00 (420m)
    const eveningTargetMinutes = parseTimeToMinutes(prefs.missingEntryTime, 18 * 60); // default 18:00 (1080m)

    // 1. Morning Shift Reminder (Từ giờ đã cấu hình đến 12:00 trưa)
    if (prefs.morningShiftEnabled !== false) {
      if (currentMinutesOfDay >= morningTargetMinutes && currentMinutesOfDay < 12 * 60) {
        addNotification(
          {
            type: 'morning_shift',
            title: t.notifications.morningShiftTitle,
            message: t.notifications.morningShiftMsg,
            actionTab: 'dashboard',
          },
          `morning_shift_${today}`
        );
      }
    }

    // 2. Daily Missing Entry Reminder (Từ giờ chiều đã cấu hình đến hết ngày)
    if (prefs.missingEntryEnabled !== false) {
      if (currentMinutesOfDay >= eveningTargetMinutes) {
        const todayRecord = records.find((r) => r.date === today);
        const hasIncomeLogged =
          todayRecord && (todayRecord.cash > 0 || todayRecord.totalCash > 0 || todayRecord.totalIncome > 0);

        if (!hasIncomeLogged) {
          addNotification(
            {
              type: 'daily_missing_entry',
              title: t.notifications.missingEntryTitle,
              message: t.notifications.missingEntryMsg,
              actionTab: 'income',
              actionDate: today,
            },
            `missing_entry_${today}`
          );
        }
      }
    }

    // 3. Cycle Ending Alerts (Last 3 days of cycle)
    if (prefs.cycleEndingEnabled !== false && currentCycle) {
      const todayDate = new Date(today);
      const endDate = new Date(currentCycle.endDate);
      const diffTime = endDate.getTime() - todayDate.getTime();
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (remainingDays >= 0 && remainingDays <= 3) {
        const daysText = remainingDays === 0 ? 'cuối cùng / last' : remainingDays.toString();

        // Morning Alert
        if (currentMinutesOfDay >= morningTargetMinutes && currentMinutesOfDay < 12 * 60) {
          addNotification(
            {
              type: 'cycle_ending_soon',
              title: t.notifications.cycleEndingMorningTitle.replace('{days}', daysText),
              message: t.notifications.cycleEndingMorningMsg.replace('{days}', daysText),
              actionTab: 'dashboard',
              actionCycleId: currentCycle.id,
            },
            `cycle_ending_morning_${currentCycle.id}_${today}`
          );
        }

        // Night Alert (từ 19:00)
        if (currentMinutesOfDay >= 19 * 60) {
          addNotification(
            {
              type: 'cycle_ending_soon',
              title: t.notifications.cycleEndingNightTitle.replace('{days}', daysText),
              message: t.notifications.cycleEndingNightMsg.replace('{days}', daysText),
              actionTab: 'analytics',
              actionCycleId: currentCycle.id,
            },
            `cycle_ending_night_${currentCycle.id}_${today}`
          );
        }
      }
    }

    // 4. Goal Achieved Congratulations (Cycle Target)
    if (
      prefs.goalAchievedEnabled !== false &&
      currentCycle &&
      cycleSummary &&
      cycleSummary.targetCashTotal > 0 &&
      cycleSummary.totalCash >= cycleSummary.targetCashTotal
    ) {
      addNotification(
        {
          type: 'goal_achieved',
          title: t.notifications.goalAchievedTitle,
          message: t.notifications.goalAchievedMsg.replace('{cycle}', currentCycle.label),
          actionTab: 'dashboard',
          actionCycleId: currentCycle.id,
        },
        `goal_achieved_cycle_${currentCycle.id}`
      );
    }

    // 5. Daily Goal Achieved (Today)
    if (prefs.goalAchievedEnabled !== false) {
      const todayRecord = records.find((r) => r.date === today);
      if (todayRecord && todayRecord.status === 'success') {
        addNotification(
          {
            type: 'goal_achieved',
            title: t.notifications.dailyGoalAchievedTitle.replace('{date}', today),
            message: t.notifications.dailyGoalAchievedMsg,
            actionTab: 'income',
            actionDate: today,
          },
          `goal_achieved_day_${today}`
        );
      }
    }
  }, [records, currentCycle, cycleSummary, settings, t, addNotification]);

  // Manually trigger a celebration notification upon saving a successful record
  const notifyDailySuccess = useCallback(
    (date: string) => {
      addNotification({
        type: 'goal_achieved',
        title: t.notifications.dailyGoalAchievedTitle.replace('{date}', date),
        message: t.notifications.dailyGoalAchievedMsg,
        actionTab: 'income',
        actionDate: date,
      });
    },
    [addNotification, t]
  );

  return {
    notifications,
    unreadCount,
    permission,
    isPushSubscribed,
    requestPushPermission,
    togglePushSubscription,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addNotification,
    notifyDailySuccess,
  };
}
