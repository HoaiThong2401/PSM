import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  Clock,
  Flame,
  Sun,
  Trophy,
  Info,
  X,
} from 'lucide-react';
import type { AppNotification, NotificationType } from '../../types/notification';
import type { NavTab } from './Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  unreadCount: number;
  permission: NotificationPermission;
  onRequestPushPermission: () => Promise<NotificationPermission>;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemoveNotification: (id: string) => void;
  onClearAll: () => void;
  onSelectTab?: (tab: NavTab) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  permission,
  onRequestPushPermission,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
  onClearAll,
  onSelectTab,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif: AppNotification) => {
    onMarkAsRead(notif.id);
    if (notif.actionTab && onSelectTab) {
      onSelectTab(notif.actionTab);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'morning_shift':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'daily_missing_entry':
        return <Clock className="w-4 h-4 text-rose-500" />;
      case 'cycle_ending_soon':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'goal_achieved':
        return <Trophy className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const created = new Date(isoString).getTime();
      const diffMs = Date.now() - created;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return t.notifications.justNow;
      if (diffMins < 60) return t.notifications.minutesAgo.replace('{minutes}', diffMins.toString());
      if (diffHours < 24) return t.notifications.hoursAgo.replace('{hours}', diffHours.toString());
      return t.notifications.daysAgo.replace('{days}', diffDays.toString());
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={t.header.notifications}
        aria-label={t.header.notifications}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shadow-xs"
      >
        <Bell className="w-4 h-4 transition-transform active:scale-90" />

        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-xs animate-in zoom-in-75">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-400 animate-ping opacity-40 pointer-events-none" />
          </>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-11 w-[calc(100vw-16px)] sm:w-96 max-w-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t.notifications.title}
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                  {unreadCount} {t.notifications.unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  title={t.notifications.markAllRead}
                  className="p-1.5 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden sm:inline">{t.notifications.markAllRead}</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  title={t.notifications.clearAll}
                  className="p-1.5 text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Optional Push Notification Permission Prompt */}
          {permission === 'default' && (
            <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100/50 dark:border-indigo-900/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                  {t.notifications.enablePush}
                </span>
              </div>
              <button
                type="button"
                onClick={onRequestPushPermission}
                className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shrink-0 transition-transform cursor-pointer shadow-xs"
              >
                Bật / Enable
              </button>
            </div>
          )}

          {/* List of Notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/80 dark:divide-slate-800/60 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500">
                  <Bell className="w-6 h-6 opacity-60" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {t.notifications.empty}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">
                  {t.notifications.emptyDesc}
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative p-3 sm:p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                      notif.read
                        ? 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40 opacity-75 hover:opacity-100'
                        : 'bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40'
                    }`}
                  >
                    {/* Icon */}
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-xs shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className={`text-xs tracking-tight ${notif.read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'font-bold text-slate-900 dark:text-white'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 inline-block">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    {/* Delete item button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveNotification(notif.id);
                      }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-opacity rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                      title={t.common.delete}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
