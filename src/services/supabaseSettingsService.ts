import { supabase } from './supabaseClient';
import type { UserSettings, NotificationPreferences } from '../types/settings';
import { DEFAULT_USER_SETTINGS } from '../types/settings';

export interface DbUserSettings {
  user_id: string;
  daily_target: number;
  weekend_target: number;
  currency: string;
  cycle_type: string;
  custom_cycle_start_day: number;
  theme: 'light' | 'dark' | 'system';
  notification_prefs?: NotificationPreferences;
  updated_at: string;
}

export const supabaseSettingsService = {
  async fetchSettings(userId: string): Promise<Partial<UserSettings>> {
    if (!supabase) return {};

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Lỗi tải cài đặt từ Supabase, dùng dữ liệu local:', error.message);
      return {};
    }

    if (!data) return {};

    const row = data as DbUserSettings & { notification_prefs?: NotificationPreferences };
    const dbCycleDay = Number(row.custom_cycle_start_day);
    return {
      weekdayTargetCash: Number(row.daily_target) || DEFAULT_USER_SETTINGS.weekdayTargetCash,
      weekendTargetCash: Number(row.weekend_target) || DEFAULT_USER_SETTINGS.weekendTargetCash,
      cycleStartDay: dbCycleDay >= 2 && dbCycleDay <= 28 ? dbCycleDay : 26,
      currency: row.currency || DEFAULT_USER_SETTINGS.currency,
      theme: row.theme || DEFAULT_USER_SETTINGS.theme,
      ...(row.notification_prefs ? { notificationPrefs: row.notification_prefs } : {}),
    };
  },

  async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    if (!supabase) return;

    const payloadWithPush = {
      user_id: userId,
      daily_target: Math.round(settings.weekdayTargetCash),
      weekend_target: Math.round(settings.weekendTargetCash),
      custom_cycle_start_day: settings.cycleStartDay,
      currency: settings.currency,
      theme: settings.theme,
      notification_prefs: settings.notificationPrefs,
    };

    const { error } = await supabase
      .from('user_settings')
      .upsert(payloadWithPush, { onConflict: 'user_id' });

    if (error) {
      // If notification_prefs column does not exist yet on Supabase, retry without it
      const fallbackPayload = {
        user_id: userId,
        daily_target: Math.round(settings.weekdayTargetCash),
        weekend_target: Math.round(settings.weekendTargetCash),
        custom_cycle_start_day: settings.cycleStartDay,
        currency: settings.currency,
        theme: settings.theme,
      };
      const { error: fallbackError } = await supabase
        .from('user_settings')
        .upsert(fallbackPayload, { onConflict: 'user_id' });
      if (fallbackError) throw fallbackError;
    }
  },
};
