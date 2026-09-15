import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useToast } from '../ui/Toast';
import { Smartphone, DownloadCloud } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const PwaInstallCard: React.FC = () => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      toast({ type: 'success', title: t.settings.pwaInstallSuccess });
    }
  };

  return (
    <Card className="p-5 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {t.settings.pwaTitle}
              </h3>
              {isInstalled && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                  {t.settings.pwaInstalled}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {t.settings.pwaSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInstallable && (
            <Button variant="success" size="sm" onClick={handleInstallClick} className="font-bold text-xs">
              <DownloadCloud className="w-4 h-4 mr-1" /> {t.settings.pwaInstallBtn}
            </Button>
          )}
          {!isInstallable && !isInstalled && (
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 italic bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              {t.settings.pwaIosGuide}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
