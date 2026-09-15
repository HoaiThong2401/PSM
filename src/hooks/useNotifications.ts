import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AppNotification } from '../types/notification';
import type { IncomeRecord, IncomeCycle, CycleSummary } from '../types/income';
import { useLanguage } from '../contexts/LanguageContext';
import { getTodayISO } from '../utils/dateUtils';

const STORAGE_PREFIX = 'daily_income_notifs_';
const TRIGGERED_PREFIX = 'daily_income_notif_triggered_';

interface UseNotificationsProps {
  userId?: string;
  records: IncomeRecord[];
  currentCycle?: IncomeCycle | null;
  cycleSummary?: CycleSummary;
}

export function useNotifications({
  userId = 'default_user',
  records,
  currentCycle,
  cycleSummary,
}: UseNotificationsProps) {
  const { t } = useLanguage();
  const storageKey = `${STORAGE_PREFIX}${userId}`;
  const triggeredKey = `${TRIGGERED_PREFIX}${userId}`;

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Save notifications to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications, storageKey]);

  // Request browser push notification permission
  const requestPushPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      return perm;
    } catch {
      return 'denied';
    }
  }, []);

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
            return; // Already triggered
          }
          triggeredList.push(dedupKey);
          // Keep list bounded to last 200 keys
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

      setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]); // max 50 items
      sendPushNotification(newNotif.title, newNotif.message);
    },
    [sendPushNotification, triggeredKey]
  );

  // Mark a single notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Remove one notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Count unread
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Evaluate smart notification triggers
  useEffect(() => {
    const today = getTodayISO();
    const now = new Date();
    const currentHour = now.getHours();

    // 1. Morning Shift Reminder (~7h: 6:00 - 11:59)
    if (currentHour >= 6 && currentHour < 12) {
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

    // 2. Daily Missing Entry Reminder (Evening: >= 18:00)
    if (currentHour >= 18) {
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

    // 3. Cycle Ending Alerts (Last 3 days of cycle)
    if (currentCycle) {
      const todayDate = new Date(today);
      const endDate = new Date(currentCycle.endDate);
      const diffTime = endDate.getTime() - todayDate.getTime();
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (remainingDays >= 0 && remainingDays <= 3) {
        const daysText = remainingDays === 0 ? 'cuối cùng / last' : remainingDays.toString();

        // Morning Alert (6:00 - 11:59)
        if (currentHour >= 6 && currentHour < 12) {
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

        // Night Alert (19:00 - 23:59)
        if (currentHour >= 19) {
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
  }, [records, currentCycle, cycleSummary, t, addNotification]);

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
    requestPushPermission,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addNotification,
    notifyDailySuccess,
  };
}
