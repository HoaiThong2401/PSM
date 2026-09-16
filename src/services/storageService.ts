import type { IncomeRecord } from '../types/income';
import type { UserSettings } from '../types/settings';
import { DEFAULT_USER_SETTINGS } from '../types/settings';
import { INITIAL_INCOME_RECORDS } from '../constants/mockData';

const INCOME_STORAGE_KEY = 'daily_income_records_v1';
const SETTINGS_STORAGE_KEY = 'user_salary_settings_v1';

export const storageService = {
  getRecords(userId: string): IncomeRecord[] {
    try {
      const data = localStorage.getItem(`${INCOME_STORAGE_KEY}_${userId}`);
      if (!data) {
        if (userId === 'user_01' || userId === 'demo') {
          this.saveRecords(userId, INITIAL_INCOME_RECORDS);
          return INITIAL_INCOME_RECORDS;
        }
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load records from storage', e);
      return [];
    }
  },

  saveRecords(userId: string, records: IncomeRecord[]): void {
    try {
      localStorage.setItem(`${INCOME_STORAGE_KEY}_${userId}`, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to storage', e);
    }
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_USER_SETTINGS;
      const parsed = JSON.parse(data);
      const cycleDay = Number(parsed.cycleStartDay);
      return {
        ...DEFAULT_USER_SETTINGS,
        ...parsed,
        notificationPrefs: {
          ...(DEFAULT_USER_SETTINGS.notificationPrefs || {}),
          ...(parsed.notificationPrefs || {}),
        },
        cycleStartDay: cycleDay >= 2 && cycleDay <= 28 ? cycleDay : 26,
      };
    } catch (e) {
      console.error('Failed to load settings', e);
      return DEFAULT_USER_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  clearAll(userId: string): void {
    localStorage.removeItem(`${INCOME_STORAGE_KEY}_${userId}`);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  },
};
