import React, { useState, useRef, useEffect } from 'react';
import { Plus, Bell, Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { CycleSelector } from './CycleSelector';
import type { IncomeCycle } from '../../types/income';
import type { UserProfile } from '../../types/auth';
import type { UserSettings } from '../../types/settings';

import { useLanguage } from '../../contexts/LanguageContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  cycles: IncomeCycle[];
  selectedCycleId: string;
  onSelectCycle: (id: string) => void;
  onOpenAddModal: () => void;
  user: UserProfile | null;
  onLogout?: () => void;
  settings: UserSettings;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  cycles,
  selectedCycleId,
  onSelectCycle,
  onOpenAddModal,
  user,
  onLogout,
  settings,
  onToggleTheme,
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
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <CycleSelector
          cycles={cycles}
          selectedCycleId={selectedCycleId}
          onSelectCycle={onSelectCycle}
        />

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          title={t.header.languageToggle}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 shrink-0 border border-slate-200/60 dark:border-slate-700/60"
        >
          <span>{language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
        </button>

        <button
          onClick={onToggleTheme}
          title={t.header.themeToggle}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button
          title={t.header.notifications}
          className="hidden sm:inline-flex relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
        </button>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddModal}
          className="font-semibold shadow-indigo-500/20 px-2.5 sm:px-3.5 shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{t.header.addIncome}</span>
        </Button>

        {/* Mobile User Avatar & Logout Popover */}
        <div className="relative flex md:hidden items-center shrink-0 ml-0.5" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="relative p-0.5 rounded-full ring-2 ring-indigo-500/50 hover:ring-indigo-500 active:scale-95 transition-all cursor-pointer"
            title="Tài khoản & Đăng xuất"
          >
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover bg-slate-200 dark:bg-slate-700 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-11 w-60 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-slide-down">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                    alt={user?.name || 'User'}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name || 'Người dùng'}
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
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
