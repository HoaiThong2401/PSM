import React, { useState } from 'react';
import type { UserSettings } from '../types/settings';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatNumber, parseVNDInput } from '../utils/currency';
import { exportSettingsToExcel } from '../utils/exportUtils';
import { useToast } from '../components/ui/Toast';
import { PwaInstallCard } from '../components/settings/PwaInstallCard';
import { NotificationSettingsCard } from '../components/settings/NotificationSettingsCard';
import { Sliders, Moon, Sun, Download, RotateCcw, Globe, Settings2 } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import { FlagIcon } from '../components/ui/FlagIcon';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetSettings: () => void;
  onResetSampleData: () => void;
  onClearAllData?: () => void;
  isLiveSync?: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onResetSampleData,
  onClearAllData,
  isLiveSync = false,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [weekdayTarget, setWeekdayTarget] = useState(formatNumber(settings.weekdayTargetCash));
  const [weekendTarget, setWeekendTarget] = useState(formatNumber(settings.weekendTargetCash));
  const [cycleStartDay, setCycleStartDay] = useState(String(settings.cycleStartDay));
  const [baseSalary, setBaseSalary] = useState(formatNumber(settings.defaultBaseSalary));

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const day = parseInt(cycleStartDay, 10);
    const safeDay = !isNaN(day) && day >= 2 && day <= 28 ? day : 26;
    onUpdateSettings({
      weekdayTargetCash: parseVNDInput(weekdayTarget) || 200000,
      weekendTargetCash: parseVNDInput(weekendTarget) || 250000,
      cycleStartDay: safeDay,
      defaultBaseSalary: parseVNDInput(baseSalary) || 200000,
    });
    setCycleStartDay(String(safeDay));
    toast({
      type: 'success',
      title: language === 'vi' ? 'Đã lưu cài đặt thành công' : 'Settings saved successfully',
    });
  };

  const handleExportBackup = () => {
    exportSettingsToExcel(settings, 'cai-dat-tai-chinh.xlsx');
    toast({ type: 'success', title: language === 'vi' ? 'Đã tải xuống bản sao lưu Excel' : 'Excel backup downloaded' });
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in pb-12">
      <div>
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{t.settings.pageTitle}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
          {t.settings.pageSubtitle}
        </p>
      </div>

      <PwaInstallCard />

      {/* Rules Config Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {t.settings.rulesTitle}
          </h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t.settings.weekdayTarget}
              value={weekdayTarget}
              onChange={(e) => setWeekdayTarget(formatNumber(parseVNDInput(e.target.value)))}
              helperText={t.settings.weekdayHelper}
            />

            <Input
              label={t.settings.weekendTarget}
              value={weekendTarget}
              onChange={(e) => setWeekendTarget(formatNumber(parseVNDInput(e.target.value)))}
              helperText={t.settings.weekendHelper}
            />

            <Input
              label={t.settings.cycleStartDay}
              type="number"
              min="2"
              max="28"
              value={cycleStartDay}
              onChange={(e) => setCycleStartDay(e.target.value)}
              helperText={t.settings.cycleHelper}
            />

            <Input
              label={t.settings.defaultBaseSalary}
              value={baseSalary}
              onChange={(e) => setBaseSalary(formatNumber(parseVNDInput(e.target.value)))}
              helperText={t.settings.defaultBaseSalaryHelper}
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
                toast({ type: 'info', title: t.settings.resetDefaults });
              }}
            >
              {t.settings.resetDefaults}
            </Button>
            <Button type="submit" variant="primary" size="md">
              {t.settings.saveChanges}
            </Button>
          </div>
        </form>
      </Card>

      {/* Streamlined Notification Settings Card with Toggles & Direct Time Pickers */}
      <NotificationSettingsCard
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />

      {/* Theme & Language Card */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <Globe className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{t.settings.appearanceTitle}</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{t.settings.languageTitle}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{t.settings.languageSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={language === 'vi' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLanguage('vi')}
              className="flex items-center gap-1.5"
            >
              <FlagIcon country="vn" className="w-4 h-3" />
              <span>VN</span>
            </Button>
            <Button
              variant={language === 'en' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
              className="flex items-center gap-1.5"
            >
              <FlagIcon country="en" className="w-4 h-3" />
              <span>EN</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/80">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{t.settings.themeMode}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{t.settings.themeSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={settings.theme === 'light' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onUpdateSettings({ theme: 'light' })}
            >
              <Sun className="w-4 h-4" /> {t.settings.light}
            </Button>
            <Button
              variant={settings.theme === 'dark' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onUpdateSettings({ theme: 'dark' })}
            >
              <Moon className="w-4 h-4" /> {t.settings.dark}
            </Button>
          </div>
        </div>
      </Card>

      {/* Backup Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{t.settings.dataTitle}</h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isLiveSync ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'}`}>
            {isLiveSync ? '☁️ Cloud Sync Active' : '💾 Local Storage'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportBackup}>
            <Download className="w-4 h-4" /> {t.settings.exportBackup}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onResetSampleData();
              toast({ type: 'info', title: t.settings.loadSampleData });
            }}
          >
            <RotateCcw className="w-4 h-4" /> {t.settings.loadSampleData}
          </Button>
          {onClearAllData && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onClearAllData();
                toast({ type: 'success', title: t.settings.clearAllData });
              }}
            >
              {t.settings.clearAllData}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
