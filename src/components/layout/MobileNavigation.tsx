import React from 'react';
import { LayoutDashboard, WalletCards, BarChart3, Settings } from 'lucide-react';
import type { NavTab } from './Sidebar';

import { useLanguage } from '../../contexts/LanguageContext';

interface MobileNavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { t } = useLanguage();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'income', label: t.nav.income, icon: <WalletCards className="w-5 h-5" /> },
    { id: 'analytics', label: t.nav.analytics, icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: t.nav.settings, icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-zinc-800 px-4 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 dark:text-zinc-400 font-medium'
            }`}
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
