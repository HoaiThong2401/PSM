import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Sparkles, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string; // 'HH:mm'
  onSave: (newTime: string) => void;
  title?: string;
  description?: string;
  presets?: string[];
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  value,
  onSave,
  title,
  description,
  presets = ['06:30', '07:00', '07:30', '08:00', '18:00', '19:00', '20:00'],
}) => {
  const { t } = useLanguage();

  const parseTime = (timeStr: string) => {
    const [h, m] = (timeStr || '07:00').split(':').map(Number);
    return {
      hours: isNaN(h) ? 7 : Math.max(0, Math.min(23, h)),
      minutes: isNaN(m) ? 0 : Math.max(0, Math.min(59, m)),
    };
  };

  const [selectedHours, setSelectedHours] = useState(7);
  const [selectedMinutes, setSelectedMinutes] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const { hours, minutes } = parseTime(value);
      setSelectedHours(hours);
      setSelectedMinutes(minutes);
    }
  }, [isOpen, value]);

  const adjustHours = (delta: number) => {
    setSelectedHours((prev) => (prev + delta + 24) % 24);
  };

  const adjustMinutes = (delta: number) => {
    setSelectedMinutes((prev) => (prev + delta + 60) % 60);
  };

  const handlePresetSelect = (timeStr: string) => {
    const { hours, minutes } = parseTime(timeStr);
    setSelectedHours(hours);
    setSelectedMinutes(minutes);
  };

  const handleConfirm = () => {
    const formattedHour = String(selectedHours).padStart(2, '0');
    const formattedMinute = String(selectedMinutes).padStart(2, '0');
    onSave(`${formattedHour}:${formattedMinute}`);
    onClose();
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t.notifications.timePickerTitle}
      description={description}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4"
          >
            <Check className="w-4 h-4" />
            <span>{t.notifications.applyBtn}</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Quick Presets (1-tap selection) */}
        {presets && presets.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.notifications.quickPresets}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => {
                const isActive = `${pad(selectedHours)}:${pad(selectedMinutes)}` === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs scale-105 ring-2 ring-indigo-400/40'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-zinc-700 border border-slate-200/60 dark:border-zinc-700/60'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Clean, iOS-Style Time Adjuster */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center gap-4 sm:gap-6 select-none shadow-xs">
          {/* Hour Stepper Column */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustHours(1)}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl transition-all active:scale-90 shadow-2xs hover:border-indigo-300"
              title={t.notifications.increaseTime}
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Hour Select Dropdown / Direct View */}
            <div className="relative">
              <select
                value={selectedHours}
                onChange={(e) => setSelectedHours(Number(e.target.value))}
                className="w-20 h-16 bg-white dark:bg-zinc-800 rounded-2xl border-2 border-indigo-500/80 dark:border-indigo-500 text-center text-3xl font-black font-mono text-slate-900 dark:text-white cursor-pointer shadow-xs appearance-none outline-none focus:ring-4 focus:ring-indigo-500/20"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} className="text-base font-sans bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                    {pad(i)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => adjustHours(-1)}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl transition-all active:scale-90 shadow-2xs hover:border-indigo-300"
              title={t.notifications.decreaseTime}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Colon */}
          <span className="text-3xl font-black text-slate-300 dark:text-zinc-600">
            :
          </span>

          {/* Minute Stepper Column */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustMinutes(5)}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl transition-all active:scale-90 shadow-2xs hover:border-indigo-300"
              title={t.notifications.increaseTime}
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Minute Select Dropdown / Direct View */}
            <div className="relative">
              <select
                value={selectedMinutes}
                onChange={(e) => setSelectedMinutes(Number(e.target.value))}
                className="w-20 h-16 bg-white dark:bg-zinc-800 rounded-2xl border-2 border-indigo-500/80 dark:border-indigo-500 text-center text-3xl font-black font-mono text-slate-900 dark:text-white cursor-pointer shadow-xs appearance-none outline-none focus:ring-4 focus:ring-indigo-500/20"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i} className="text-base font-sans bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                    {pad(i)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => adjustMinutes(-5)}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl transition-all active:scale-90 shadow-2xs hover:border-indigo-300"
              title={t.notifications.decreaseTime}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
