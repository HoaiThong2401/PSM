import { supabase } from './supabaseClient';
import type { IncomeRecord } from '../types/income';
import { computeRecordTotals } from '../utils/calculation';
import type { UserSettings } from '../types/settings';

export interface DbIncomeRecord {
  id: string;
  user_id: string;
  date: string;
  cash: number;
  base_salary: number;
  tips: number;
  bonus: number;
  status: 'processing' | 'success' | 'failed' | 'not_started';
  is_custom_status: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export function fromDbRecord(row: DbIncomeRecord, settings: UserSettings): IncomeRecord {
  return computeRecordTotals(
    {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      cash: Number(row.cash) || 0,
      baseSalary: Number(row.base_salary) || 0,
      tips: Number(row.tips) || 0,
      bonus: Number(row.bonus) || 0,
      targetCash: 0,
      status: row.status,
      isCustomStatus: row.is_custom_status,
      note: row.note || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    settings
  );
}

export const supabaseIncomeService = {
  async fetchRecords(userId: string, settings: UserSettings): Promise<IncomeRecord[]> {
    if (!supabase) throw new Error('Supabase client chưa được cấu hình');

    const { data, error } = await supabase
      .from('income_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data as DbIncomeRecord[]).map((r) => fromDbRecord(r, settings));
  },

  async upsertRecord(record: Partial<IncomeRecord> & { date: string; userId: string }, settings: UserSettings): Promise<IncomeRecord> {
    if (!supabase) throw new Error('Supabase client chưa được cấu hình');

    const payload = {
      user_id: record.userId,
      date: record.date,
      cash: Math.round(record.cash ?? 0),
      base_salary: Math.round(record.baseSalary ?? 0),
      tips: Math.round(record.tips ?? 0),
      bonus: Math.round(record.bonus ?? 0),
      status: record.status ?? 'not_started',
      is_custom_status: !!record.isCustomStatus,
      note: record.note ?? '',
    };

    const { data, error } = await supabase
      .from('income_records')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw error;
    return fromDbRecord(data as DbIncomeRecord, settings);
  },

  async deleteRecord(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client chưa được cấu hình');

    const { error } = await supabase.from('income_records').delete().eq('id', id);
    if (error) throw error;
  },

  async bulkUpsert(records: IncomeRecord[], settings: UserSettings): Promise<IncomeRecord[]> {
    if (!supabase) throw new Error('Supabase client chưa được cấu hình');

    const payloads = records.map((r) => ({
      user_id: r.userId,
      date: r.date,
      cash: Math.round(r.cash),
      base_salary: Math.round(r.baseSalary),
      tips: Math.round(r.tips),
      bonus: Math.round(r.bonus),
      status: r.status,
      is_custom_status: !!r.isCustomStatus,
      note: r.note || '',
    }));

    const { data, error } = await supabase
      .from('income_records')
      .upsert(payloads, { onConflict: 'user_id,date' })
      .select();

    if (error) throw error;
    return (data as DbIncomeRecord[]).map((r) => fromDbRecord(r, settings));
  },

  async clearAllRecords(userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client chưa được cấu hình');
    const { error } = await supabase.from('income_records').delete().eq('user_id', userId);
    if (error) throw error;
  },
};
