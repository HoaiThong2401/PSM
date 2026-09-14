import React from 'react';
import { Plus, Bell, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/Button';
import { CycleSelector } from './CycleSelector';
import type { IncomeCycle } from '../../types/income';
import type { UserProfile } from '../../types/auth';
import type { UserSettings } from '../../types/settings';

interface HeaderProps {
  title: string;
  subtitle?: string;
  cycles: IncomeCycle[];
  selectedCycleId: string;
  onSelectCycle: (id: string) => void;
  onOpenAddModal: () => void;
  user: UserProfile | null;
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
  settings,
  onToggleTheme,
}) => {
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

      <div className="flex items-center gap-2 sm:gap-3">
        <CycleSelector
          cycles={cycles}
          selectedCycleId={selectedCycleId}
          onSelectCycle={onSelectCycle}
        />

        <button
          onClick={onToggleTheme}
          title="Chuyển chế độ sáng/tối"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button
          title="Thông báo"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
        </button>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddModal}
          className="font-semibold shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden xs:inline">Thêm thu nhập</span>
        </Button>

        <div className="flex md:hidden items-center">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full ring-2 ring-indigo-500/30 object-cover"
          />
        </div>
      </div>
    </header>
  );
};
