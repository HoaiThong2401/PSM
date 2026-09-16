import React from 'react';
import { Sidebar } from './Sidebar';
import type { NavTab } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import type { IncomeCycle } from '../../types/income';
import type { UserProfile } from '../../types/auth';
import type { UserSettings } from '../../types/settings';
import type { AppNotification } from '../../types/notification';

import { useLanguage } from '../../contexts/LanguageContext';

interface MainLayoutProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  cycles: IncomeCycle[];
  selectedCycleId: string;
  onSelectCycle: (cycleId: string) => void;
  onOpenAddModal: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  settings: UserSettings;
  onToggleTheme: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  permission: NotificationPermission;
  isPushSubscribed?: boolean;
  onRequestPushPermission: () => Promise<NotificationPermission>;
  onTogglePush?: () => Promise<boolean | void>;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemoveNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentTab,
  onSelectTab,
  cycles,
  selectedCycleId,
  onSelectCycle,
  onOpenAddModal,
  user,
  onLogout,
  settings,
  onToggleTheme,
  notifications,
  unreadCount,
  permission,
  isPushSubscribed,
  onRequestPushPermission,
  onTogglePush,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
  onClearAllNotifications,
  children,
}) => {
  const { t, language } = useLanguage();

  const pageTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: t.nav.dashboard,
      subtitle: language === 'vi' ? 'Tổng quan tiến độ thu nhập & mục tiêu hàng ngày' : 'Daily income overview & target tracking',
    },
    income: {
      title: t.income.pageTitle,
      subtitle: t.income.pageSubtitle,
    },
    analytics: {
      title: t.analytics.pageTitle,
      subtitle: t.analytics.pageSubtitle,
    },
    settings: {
      title: t.settings.pageTitle,
      subtitle: t.settings.pageSubtitle,
    },
  };

  const { title, subtitle } = pageTitles[currentTab];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased relative selection:bg-indigo-500 selection:text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(0,0,0,0))] pointer-events-none" />
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        user={user}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative z-10">
        <Header
          title={title}
          subtitle={subtitle}
          cycles={cycles}
          selectedCycleId={selectedCycleId}
          onSelectCycle={onSelectCycle}
          onOpenAddModal={onOpenAddModal}
          user={user}
          onLogout={onLogout}
          settings={settings}
          onToggleTheme={onToggleTheme}
          notifications={notifications}
          unreadCount={unreadCount}
          permission={permission}
          isPushSubscribed={isPushSubscribed}
          onRequestPushPermission={onRequestPushPermission}
          onTogglePush={onTogglePush}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onRemoveNotification={onRemoveNotification}
          onClearAllNotifications={onClearAllNotifications}
          onSelectTab={onSelectTab}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <MobileNavigation currentTab={currentTab} onSelectTab={onSelectTab} />
    </div>
  );
};

