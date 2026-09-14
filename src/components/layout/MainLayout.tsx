import React from 'react';
import { Sidebar } from './Sidebar';
import type { NavTab } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import type { IncomeCycle } from '../../types/income';
import type { UserProfile } from '../../types/auth';
import type { UserSettings } from '../../types/settings';

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
  children,
}) => {
  const pageTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Personal Income Dashboard',
      subtitle: 'Tổng quan tiến độ thu nhập và mục tiêu tài chính',
    },
    income: {
      title: 'Quản lý Thu nhập',
      subtitle: 'Xem và chỉnh sửa chi tiết các khoản thu theo từng ngày',
    },
    analytics: {
      title: 'Lịch sử & Thống kê',
      subtitle: 'Báo cáo chuyên sâu và phân tích hiệu suất kiếm tiền',
    },
    settings: {
      title: 'Cài đặt Tài chính',
      subtitle: 'Tùy chỉnh mục tiêu tiền mặt, chu kỳ và hệ thống',
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
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <MobileNavigation currentTab={currentTab} onSelectTab={onSelectTab} />
    </div>
  );
};
