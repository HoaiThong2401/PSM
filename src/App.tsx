import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useSettings } from './hooks/useSettings';
import { useIncomeData } from './hooks/useIncomeData';
import { useCycleFilter } from './hooks/useCycleFilter';
import { MainLayout } from './components/layout/MainLayout';
import type { NavTab } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { IncomeManagementPage } from './pages/IncomeManagementPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { IncomeFormModal } from './components/income/IncomeFormModal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import type { IncomeRecord, DayStatus } from './types/income';

function AppContent() {
  const { user, isAuthenticated, isLoading: authLoading, logout, isSupabaseLive } = useAuth();
  const { settings, updateSettings, resetSettings } = useSettings(user?.id);
  const { toast } = useToast();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    records,
    upsertRecord,
    updateInlineField,
    deleteRecord,
    undoLastDelete,
    resetToSampleData,
    clearAllData,
  } = useIncomeData(user?.id, settings);

  const {
    availableCycles,
    selectedCycleId,
    setSelectedCycleId,
    currentCycle,
    cycleRecords,
    cycleSummary,
  } = useCycleFilter(records, settings);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleOpenAddModal = (record?: IncomeRecord) => {
    setEditingRecord(record || null);
    setModalOpen(true);
  };

  const handleSaveIncome = (data: {
    date: string;
    cash: number;
    baseSalary: number;
    tips: number;
    bonus: number;
    status?: DayStatus;
    isCustomStatus?: boolean;
    note?: string;
  }) => {
    upsertRecord(data);
    toast({
      type: 'success',
      title: 'Đã lưu thu nhập',
      description: `Thu nhập ngày ${data.date} đã được cập nhật thành công.`,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    deleteRecord(deleteConfirmId);
    setDeleteConfirmId(null);
    toast({
      type: 'info',
      title: 'Đã xóa bản ghi thu nhập',
      action: {
        label: 'Hoàn tác',
        onClick: () => {
          undoLastDelete();
          toast({ type: 'success', title: 'Đã khôi phục bản ghi' });
        },
      },
    });
  };

  const handleToggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <MainLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      cycles={availableCycles}
      selectedCycleId={selectedCycleId}
      onSelectCycle={setSelectedCycleId}
      onOpenAddModal={() => handleOpenAddModal()}
      user={user}
      onLogout={logout}
      settings={settings}
      onToggleTheme={handleToggleTheme}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          records={records}
          cycleRecords={cycleRecords}
          summary={cycleSummary}
          currentCycle={currentCycle}
          settings={settings}
          onOpenAddModal={handleOpenAddModal}
          onSelectTab={setCurrentTab}
          onDeleteRecord={(id) => setDeleteConfirmId(id)}
          onInlineUpdate={updateInlineField}
        />
      )}

      {currentTab === 'income' && (
        <IncomeManagementPage
          cycleRecords={cycleRecords}
          onOpenAddModal={handleOpenAddModal}
          onDeleteRecord={(id) => setDeleteConfirmId(id)}
          onInlineUpdate={updateInlineField}
        />
      )}

      {currentTab === 'analytics' && (
        <AnalyticsPage cycleRecords={cycleRecords} summary={cycleSummary} />
      )}

      {currentTab === 'settings' && (
        <SettingsPage
          settings={settings}
          onUpdateSettings={updateSettings}
          onResetSettings={resetSettings}
          onResetSampleData={resetToSampleData}
          onClearAllData={clearAllData}
          isLiveSync={isSupabaseLive && user?.role !== 'Demo' && user?.id !== 'demo_user'}
        />
      )}

      <IncomeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        record={editingRecord}
        settings={settings}
        onSave={handleSaveIncome}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bản ghi"
        message="Bạn có chắc chắn muốn xóa bản ghi thu nhập này không? Bạn vẫn có thể hoàn tác ngay sau khi xóa."
        confirmText="Xóa bản ghi"
        variant="danger"
      />
    </MainLayout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
