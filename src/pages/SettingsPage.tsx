import React, { useState } from 'react';
import type { UserSettings } from '../types/settings';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatNumber, parseVNDInput } from '../utils/currency';
import { exportToJSON } from '../utils/exportUtils';
import { useToast } from '../components/ui/Toast';
import { PwaInstallCard } from '../components/settings/PwaInstallCard';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { Sliders, Moon, Sun, Download, RotateCcw, Database, CheckCircle, AlertCircle } from 'lucide-react';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetSettings: () => void;
  onResetSampleData: () => void;
  onClearAllData?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onResetSampleData,
  onClearAllData,
}) => {
  const { toast } = useToast();
  const [weekdayTarget, setWeekdayTarget] = useState(formatNumber(settings.weekdayTargetCash));
  const [weekendTarget, setWeekendTarget] = useState(formatNumber(settings.weekendTargetCash));
  const [cycleStartDay, setCycleStartDay] = useState(String(settings.cycleStartDay));
  const [baseSalary, setBaseSalary] = useState(formatNumber(settings.defaultBaseSalary));
  const isSupabaseLive = isSupabaseConfigured();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      weekdayTargetCash: parseVNDInput(weekdayTarget) || 200000,
      weekendTargetCash: parseVNDInput(weekendTarget) || 250000,
      cycleStartDay: parseInt(cycleStartDay, 10) || 26,
      defaultBaseSalary: parseVNDInput(baseSalary) || 200000,
    });
    toast({
      type: 'success',
      title: 'Đã lưu cài đặt thành công',
      description: 'Mục tiêu tiền mặt và quy tắc chu kỳ đã được cập nhật.',
    });
  };

  const handleExportBackup = () => {
    exportToJSON({ settings, exportedAt: new Date().toISOString() }, 'cai-dat-tai-chinh.json');
    toast({ type: 'success', title: 'Đã tải xuống bản sao lưu' });
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
          Cài đặt & Tùy chỉnh Quy tắc
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Cấu hình mục tiêu tiền mặt, cơ sở dữ liệu PostgreSQL và cài đặt ứng dụng
        </p>
      </div>

      <PwaInstallCard />

      {/* Database Connection Card */}
      <Card className="p-5 border-l-4 border-l-indigo-600">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Cơ sở dữ liệu PostgreSQL (Supabase)
                </h3>
                {isSupabaseLive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle className="w-3 h-3" /> Đang kết nối Live DB
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold">
                    <AlertCircle className="w-3 h-3" /> Chế độ Demo (LocalStorage)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {isSupabaseLive
                  ? 'Dữ liệu thu nhập và cài đặt được lưu trữ đồng bộ trực tiếp trên PostgreSQL Cloud.'
                  : 'Để kết nối PostgreSQL: Mở file .env, điền VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY từ Supabase.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Rules Config Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            Quy tắc Mục tiêu Tiền mặt
          </h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mục tiêu Thứ 2 - Thứ 5 (VNĐ)"
              value={weekdayTarget}
              onChange={(e) => setWeekdayTarget(formatNumber(parseVNDInput(e.target.value)))}
              helperText="Áp dụng cho ngày trong tuần (Mặc định 200.000 ₫)"
            />

            <Input
              label="Mục tiêu Thứ 6 - Chủ Nhật (VNĐ)"
              value={weekendTarget}
              onChange={(e) => setWeekendTarget(formatNumber(parseVNDInput(e.target.value)))}
              helperText="Áp dụng cho cuối tuần (Mặc định 250.000 ₫)"
            />

            <Input
              label="Ngày bắt đầu chu kỳ tháng"
              type="number"
              min="1"
              max="28"
              value={cycleStartDay}
              onChange={(e) => setCycleStartDay(e.target.value)}
              helperText="Mặc định ngày 26 (Kỳ: 26 tháng trước đến 25 tháng này)"
            />

            <Input
              label="Lương cơ bản mặc định mỗi ngày (VNĐ)"
              value={baseSalary}
              onChange={(e) => setBaseSalary(formatNumber(parseVNDInput(e.target.value)))}
              helperText="Tự điền sẵn khi thêm ngày làm việc mới"
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onResetSettings();
                setWeekdayTarget('200.000');
                setWeekendTarget('250.000');
                setCycleStartDay('26');
                setBaseSalary('200.000');
                toast({ type: 'info', title: 'Đã đặt lại về mặc định' });
              }}
            >
              Đặt lại mặc định
            </Button>
            <Button type="submit" variant="primary" size="md">
              Lưu thay đổi cài đặt
            </Button>
          </div>
        </form>
      </Card>

      {/* Theme Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <Moon className="w-5 h-5 text-sky-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Giao diện hiển thị</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Chế độ màu</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Chọn giao diện sáng (Light) hoặc tối (Dark Modern)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={settings.theme === 'light' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onUpdateSettings({ theme: 'light' })}
            >
              <Sun className="w-4 h-4" /> Sáng
            </Button>
            <Button
              variant={settings.theme === 'dark' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onUpdateSettings({ theme: 'dark' })}
            >
              <Moon className="w-4 h-4" /> Tối
            </Button>
          </div>
        </div>
      </Card>

      {/* Backup Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <Download className="w-5 h-5 text-slate-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Dữ liệu & Sao lưu</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportBackup}>
            <Download className="w-4 h-4" /> Xuất bản sao lưu (JSON)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onResetSampleData();
              toast({ type: 'info', title: 'Đã nạp lại dữ liệu mẫu kỳ 09/2026' });
            }}
          >
            <RotateCcw className="w-4 h-4" /> Nạp dữ liệu mẫu
          </Button>
          {onClearAllData && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onClearAllData();
                toast({ type: 'success', title: 'Đã xóa sạch dữ liệu, sẵn sàng nhập mới!' });
              }}
            >
              Xóa sạch dữ liệu (Nhập mới)
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
