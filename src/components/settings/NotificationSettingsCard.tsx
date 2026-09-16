import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  Sun,
  Clock,
  Flame,
  Trophy,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  SlidersHorizontal,
  Edit3,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TimePickerModal } from '../ui/TimePickerModal';
import type { UserSettings, NotificationPreferences } from '../../types/settings';
import { DEFAULT_NOTIFICATION_PREFS } from '../../types/settings';
import { useToast } from '../ui/Toast';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  isPushNotificationSupported,
  getExistingPushSubscription,
  subscribeToWebPush,
  unsubscribeFromWebPush,
} from '../../services/webPushService';

interface NotificationSettingsCardProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const NotificationSettingsCard: React.FC<NotificationSettingsCardProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const prefs: NotificationPreferences = settings.notificationPrefs || DEFAULT_NOTIFICATION_PREFS;

  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom Time Picker Modal State
  const [timePickerConfig, setTimePickerConfig] = useState<{
    isOpen: boolean;
    type: 'morning' | 'evening';
    title: string;
    description: string;
    value: string;
    presets: string[];
  }>({
    isOpen: false,
    type: 'morning',
    title: '',
    description: '',
    value: '07:00',
    presets: [],
  });

  useEffect(() => {
    getExistingPushSubscription().then((sub) => {
      setIsPushSubscribed(Boolean(sub));
    });
  }, []);

  const updatePref = (updates: Partial<NotificationPreferences>) => {
    const updatedPrefs: NotificationPreferences = {
      ...prefs,
      ...updates,
    };
    onUpdateSettings({ notificationPrefs: updatedPrefs });
  };

  const handleMasterToggle = async (enabled: boolean) => {
    updatePref({ enabled });
    if (enabled) {
      if (!isPushSubscribed && isPushNotificationSupported()) {
        setIsPushLoading(true);
        const res = await subscribeToWebPush();
        setIsPushSubscribed(res.success);
        setIsPushLoading(false);
        if (res.success) {
          toast({ type: 'success', title: t.notifications.pushSubscribedSuccessToast });
        }
      } else {
        toast({ type: 'success', title: t.notifications.masterEnabledToast });
      }
    } else {
      toast({ type: 'info', title: t.notifications.masterDisabledToast });
    }
  };

  const handleToggleWebPushOnly = async () => {
    setIsPushLoading(true);
    if (isPushSubscribed) {
      const res = await unsubscribeFromWebPush();
      if (res.success) {
        setIsPushSubscribed(false);
        toast({ type: 'info', title: t.notifications.pushUnsubscribedToast });
      }
    } else {
      const res = await subscribeToWebPush();
      if (res.success) {
        setIsPushSubscribed(true);
        toast({ type: 'success', title: t.notifications.pushSubscribedSuccessToast });
      } else {
        toast({ type: 'error', title: res.error || t.notifications.pushSubscribeErrorToast });
      }
    }
    setIsPushLoading(false);
  };

  const openMorningTimePicker = () => {
    if (!prefs.morningShiftEnabled) return;
    setTimePickerConfig({
      isOpen: true,
      type: 'morning',
      title: t.notifications.morningPickerTitle,
      description: t.notifications.morningPickerDesc,
      value: prefs.morningShiftTime || '07:00',
      presets: ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30'],
    });
  };

  const openEveningTimePicker = () => {
    if (!prefs.missingEntryEnabled) return;
    setTimePickerConfig({
      isOpen: true,
      type: 'evening',
      title: t.notifications.eveningPickerTitle,
      description: t.notifications.eveningPickerDesc,
      value: prefs.missingEntryTime || '18:00',
      presets: ['17:30', '18:00', '19:00', '20:00', '21:00', '22:00'],
    });
  };

  const handleSaveCustomTime = (newTime: string) => {
    if (timePickerConfig.type === 'morning') {
      updatePref({ morningShiftTime: newTime });
      toast({
        type: 'success',
        title: t.notifications.morningTimeChangedToast.replace('{time}', newTime),
      });
    } else {
      updatePref({ missingEntryTime: newTime });
      toast({
        type: 'success',
        title: t.notifications.eveningTimeChangedToast.replace('{time}', newTime),
      });
    }
  };

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      {/* Header with Master Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/50 shadow-xs shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.notifications.notificationSettingsTitle}
              </h3>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  prefs.enabled && isPushSubscribed
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}
              >
                {prefs.enabled && isPushSubscribed ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{t.notifications.backgroundPushActive}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <span>
                      {prefs.enabled
                        ? t.notifications.backgroundPushInactive
                        : t.notifications.notificationsOff}
                    </span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {t.notifications.notificationSettingsSubtitle}
            </p>
          </div>
        </div>

        {/* Master Switch */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          {/* Master Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={prefs.enabled}
              onChange={(e) => handleMasterToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600 shadow-inner" />
          </label>
        </div>
      </div>

      {/* Web Push Permission Banner if not enabled */}
      {prefs.enabled && !isPushSubscribed && isPushNotificationSupported() && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                {t.notifications.activateWebPushBannerTitle}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400/90 leading-relaxed">
                {t.notifications.activateWebPushBannerDesc}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={handleToggleWebPushOnly}
            disabled={isPushLoading}
            className="shrink-0 text-xs py-1 px-3"
          >
            {isPushLoading ? t.common.loading : t.notifications.activateNow}
          </Button>
        </div>
      )}

      {/* Accordion Expand / Collapse Button */}
      {prefs.enabled && (
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-full py-2 px-3.5 bg-slate-50/80 dark:bg-zinc-900/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-zinc-800 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 group shadow-2xs"
            aria-expanded={isExpanded}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span>{t.notifications.customizeSchedule}</span>
            </div>
            <div className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-100/50 dark:group-hover:bg-indigo-950/60 transition-all">
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ease-out ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>
        </div>
      )}

      {/* Detailed Notification Rules List (Expandable) */}
      {prefs.enabled && isExpanded && (
        <div className="space-y-3 pt-1 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Item 1: Morning Shift Reminder */}
          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <Sun className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t.notifications.morningShiftRuleTitle}
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{t.notifications.reason}:</span>{' '}
                  {t.notifications.morningShiftRuleReason}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center pl-9 sm:pl-0">
              {/* Premium Custom Time Badge Button */}
              <button
                type="button"
                onClick={openMorningTimePicker}
                disabled={!prefs.morningShiftEnabled}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs cursor-pointer transition-all active:scale-95 ${
                  !prefs.morningShiftEnabled ? 'opacity-40 pointer-events-none' : ''
                }`}
                title={t.notifications.clickToEditMorningTime}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-slate-900 dark:text-zinc-100 font-mono">
                  {prefs.morningShiftTime || '07:00'}
                </span>
                <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-colors ml-0.5 opacity-60 group-hover:opacity-100" />
              </button>

              {/* Toggle */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefs.morningShiftEnabled}
                  onChange={(e) => updatePref({ morningShiftEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all dark:border-zinc-600 peer-checked:bg-amber-500 shadow-inner" />
              </label>
            </div>
          </div>

          {/* Item 2: Missing Entry Reminder */}
          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t.notifications.missingEntryRuleTitle}
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{t.notifications.reason}:</span>{' '}
                  {t.notifications.missingEntryRuleReason}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center pl-9 sm:pl-0">
              {/* Premium Custom Time Badge Button */}
              <button
                type="button"
                onClick={openEveningTimePicker}
                disabled={!prefs.missingEntryEnabled}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs cursor-pointer transition-all active:scale-95 ${
                  !prefs.missingEntryEnabled ? 'opacity-40 pointer-events-none' : ''
                }`}
                title={t.notifications.clickToEditEveningTime}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-slate-900 dark:text-zinc-100 font-mono">
                  {prefs.missingEntryTime || '18:00'}
                </span>
                <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-colors ml-0.5 opacity-60 group-hover:opacity-100" />
              </button>

              {/* Toggle */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefs.missingEntryEnabled}
                  onChange={(e) => updatePref({ missingEntryEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all dark:border-zinc-600 peer-checked:bg-rose-500 shadow-inner" />
              </label>
            </div>
          </div>

          {/* Item 3: Cycle Ending Alert */}
          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t.notifications.cycleEndingRuleTitle}
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{t.notifications.reason}:</span>{' '}
                  {t.notifications.cycleEndingRuleReason}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={prefs.cycleEndingEnabled}
                onChange={(e) => updatePref({ cycleEndingEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all dark:border-zinc-600 peer-checked:bg-orange-500 shadow-inner" />
            </label>
          </div>

          {/* Item 4: Goal Achieved Congratulations */}
          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t.notifications.goalAchievedRuleTitle}
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{t.notifications.reason}:</span>{' '}
                  {t.notifications.goalAchievedRuleReason}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={prefs.goalAchievedEnabled}
                onChange={(e) => updatePref({ goalAchievedEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500 shadow-inner" />
            </label>
          </div>
        </div>
      )}

      {/* Custom High-End Time Picker Modal */}
      <TimePickerModal
        isOpen={timePickerConfig.isOpen}
        onClose={() => setTimePickerConfig((prev) => ({ ...prev, isOpen: false }))}
        value={timePickerConfig.value}
        title={timePickerConfig.title}
        description={timePickerConfig.description}
        presets={timePickerConfig.presets}
        onSave={handleSaveCustomTime}
      />
    </Card>
  );
};
