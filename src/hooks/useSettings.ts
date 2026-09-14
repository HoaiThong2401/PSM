import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '../types/settings';
import { DEFAULT_USER_SETTINGS } from '../types/settings';
import { storageService } from '../services/storageService';
import { supabaseSettingsService } from '../services/supabaseSettingsService';
import { isSupabaseConfigured } from '../services/supabaseClient';

export function useSettings(userId?: string) {
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const isSupabaseLive = isSupabaseConfigured();

  // Tải cài đặt từ Supabase nếu có
  useEffect(() => {
    if (!isSupabaseLive || !userId) return;

    let isMounted = true;
    async function loadCloudSettings() {
      try {
        const cloudSettings = await supabaseSettingsService.fetchSettings(userId!);
        if (isMounted) {
          setSettings(cloudSettings);
          storageService.saveSettings(cloudSettings);
        }
      } catch (err) {
        console.warn('Lỗi tải cài đặt từ Supabase:', err);
      }
    }

    loadCloudSettings();
    return () => {
      isMounted = false;
    };
  }, [userId, isSupabaseLive]);

  // Áp dụng theme vào document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        storageService.saveSettings(updated);
        if (isSupabaseLive && userId) {
          supabaseSettingsService.saveSettings(userId, updated).catch(console.error);
        }
        return updated;
      });
    },
    [userId, isSupabaseLive]
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_USER_SETTINGS);
    storageService.saveSettings(DEFAULT_USER_SETTINGS);
    if (isSupabaseLive && userId) {
      supabaseSettingsService.saveSettings(userId, DEFAULT_USER_SETTINGS).catch(console.error);
    }
  }, [userId, isSupabaseLive]);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
