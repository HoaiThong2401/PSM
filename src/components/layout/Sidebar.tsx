import React from 'react';
import {
  LayoutDashboard,
  WalletCards,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { UserProfile } from '../../types/auth';

import { useLanguage } from '../../contexts/LanguageContext';

export type NavTab = 'dashboard' | 'income' | 'analytics' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
}) => {
  const { t } = useLanguage();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'income',
      label: t.nav.income,
      icon: <WalletCards className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: t.nav.analytics,
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 p-4 shrink-0 h-screen sticky top-0 justify-between select-none">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                DailyIncome
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300 border dark:border-indigo-800/50">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
              {t.common.appSubtitle}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 pb-1">
            {t.nav.mainMenu}
          </p>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/50 to-sky-50/50 dark:from-slate-800/50 dark:to-indigo-950/30 border border-indigo-100/60 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300 space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.nav.proTipTitle}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {t.nav.proTipDesc}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0 bg-slate-200 dark:bg-slate-700"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user?.name || t.header.userFallback}
              </p>
              {user?.email && (
                <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onLogout}
            title={t.nav.logout}
            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
