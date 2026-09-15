import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { CycleSelector } from './CycleSelector';
import { AppLogo } from '../ui/AppLogo';
import { NotificationDropdown } from './NotificationDropdown';
import type { IncomeCycle } from '../../types/income';
import type { UserProfile } from '../../types/auth';
import type { UserSettings } from '../../types/settings';
import type { AppNotification } from '../../types/notification';
import type { NavTab } from './Sidebar';

import { useLanguage } from '../../contexts/LanguageContext';
import { FlagIcon } from '../ui/FlagIcon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  cycles: IncomeCycle[];
  selectedCycleId: string;
  onSelectCycle: (id: string) => void;
  onOpenAddModal?: () => void;
  user: UserProfile | null;
  onLogout?: () => void;
  settings: UserSettings;
  onToggleTheme: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  permission: NotificationPermission;
  onRequestPushPermission: () => Promise<NotificationPermission>;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemoveNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onSelectTab?: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  cycles,
  selectedCycleId,
  onSelectCycle,
  user,
  onLogout,
  settings,
  onToggleTheme,
  notifications,
  unreadCount,
  permission,
  onRequestPushPermission,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
  onClearAllNotifications,
  onSelectTab,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Top Main Navigation Bar */}
      <div className="px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Desktop Page Title & Subtitle */}
        <div className="hidden md:block min-w-0 flex-1">
          <h1 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Mobile Brand Name & Slogan (Replaces sidebar on small screens) */}
        <div className="flex md:hidden items-center gap-2.5 min-w-0 flex-1">
          <AppLogo size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 truncate">
                DailyIncome
              </span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300 border dark:border-indigo-800/50 shrink-0">
                Pro
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate leading-tight">
              {t.common.appSubtitle}
            </p>
          </div>
        </div>

        {/* Controls & User Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Cycle Selector on Desktop */}
          <div className="hidden md:block">
            <CycleSelector
              cycles={cycles}
              selectedCycleId={selectedCycleId}
              onSelectCycle={onSelectCycle}
              compact
            />
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            title={t.header.languageToggle}
            className="px-2 py-1.5 sm:px-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 shrink-0 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
          >
            <FlagIcon country={language === 'vi' ? 'vn' : 'en'} className="w-3.5 h-2.5 sm:w-4 sm:h-3" />
            <span className="text-[11px] sm:text-xs">{language === 'vi' ? 'VN' : 'EN'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title={t.header.themeToggle}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Interactive Notifications (Desktop & Mobile) */}
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            permission={permission}
            onRequestPushPermission={onRequestPushPermission}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onRemoveNotification={onRemoveNotification}
            onClearAll={onClearAllNotifications}
            onSelectTab={onSelectTab}
          />

          {/* Mobile User Avatar & Logout Popover */}
          <div className="relative flex md:hidden items-center shrink-0 ml-0.5" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="relative p-0.5 rounded-full ring-2 ring-indigo-500/50 hover:ring-indigo-500 active:scale-95 transition-all cursor-pointer shrink-0"
              title={t.nav.logout}
            >
              <img
                src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                alt={user?.name || 'User'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-slate-200 dark:bg-slate-700 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-11 w-56 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-slide-down">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <img
                      src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                      alt={user?.name || 'User'}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user?.name || t.header.userFallback}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>{t.nav.logout}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Subheader: Centered Compact Cycle Selector */}
      <div className="flex md:hidden items-center justify-center px-3 py-1.5 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-100/90 dark:border-slate-800/60">
        <CycleSelector
          cycles={cycles}
          selectedCycleId={selectedCycleId}
          onSelectCycle={onSelectCycle}
        />
      </div>
    </header>
  );
};
