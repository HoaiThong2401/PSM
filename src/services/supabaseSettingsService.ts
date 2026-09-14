import { supabase } from './supabaseClient';
import type { UserSettings } from '../types/settings';
import { DEFAULT_USER_SETTINGS } from '../types/settings';

export interface DbUserSettings {
  user_id: string;
  daily_target: number;
  weekend_target: number;
  currency: string;
  cycle_type: string;
  custom_cycle_start_day: number;
  theme: 'light' | 'dark' | 'system';
  updated_at: string;
}

export const supabaseSettingsService = {
  async fetchSettings(userId: string): Promise<UserSettings> {
    if (!supabase) return DEFAULT_USER_SETTINGS;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Lỗi tải cài đặt từ Supabase, dùng mặc định:', error.message);
      return DEFAULT_USER_SETTINGS;
    }

    if (!data) return DEFAULT_USER_SETTINGS;

    const row = data as DbUserSettings;
    const dbCycleDay = Number(row.custom_cycle_start_day);
    return {
      ...DEFAULT_USER_SETTINGS,
      weekdayTargetCash: Number(row.daily_target) || DEFAULT_USER_SETTINGS.weekdayTargetCash,
      weekendTargetCash: Number(row.weekend_target) || DEFAULT_USER_SETTINGS.weekendTargetCash,
      cycleStartDay: dbCycleDay >= 2 && dbCycleDay <= 28 ? dbCycleDay : 26,
      currency: row.currency || DEFAULT_USER_SETTINGS.currency,
      theme: row.theme || DEFAULT_USER_SETTINGS.theme,
    };
  },

  async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    if (!supabase) return;

    const payload = {
      user_id: userId,
      daily_target: Math.round(settings.weekdayTargetCash),
      weekend_target: Math.round(settings.weekendTargetCash),
      custom_cycle_start_day: settings.cycleStartDay,
      currency: settings.currency,
      theme: settings.theme,
    };

    const { error } = await supabase
      .from('user_settings')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) throw error;
  },
};
