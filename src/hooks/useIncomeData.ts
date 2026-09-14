import { useState, useEffect, useCallback, useRef } from 'react';
import type { IncomeRecord, DayStatus } from '../types/income';
import type { UserSettings } from '../types/settings';
import { storageService } from '../services/storageService';
import { supabaseIncomeService } from '../services/supabaseIncomeService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { computeRecordTotals } from '../utils/calculation';
import { INITIAL_INCOME_RECORDS } from '../constants/mockData';

export function useIncomeData(userId: string | undefined, settings: UserSettings) {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastDeletedRef = useRef<IncomeRecord | null>(null);
  const isSupabaseLive = isSupabaseConfigured();

  // Tải dữ liệu từ Supabase hoặc LocalStorage
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!userId) {
        if (isMounted) {
          setRecords([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      if (isSupabaseLive) {
        try {
          const dbRecords = await supabaseIncomeService.fetchRecords(userId, settings);
          if (isMounted) setRecords(dbRecords);
        } catch (err) {
          console.warn('Lỗi kết nối Supabase, chuyển sang cache local:', err);
          const local = storageService.getRecords(userId);
          if (isMounted) setRecords(local);
        }
      } else {
        const stored = storageService.getRecords(userId);
        const refreshed = stored.map((r) => computeRecordTotals(r, settings));
        if (isMounted) setRecords(refreshed);
      }

      if (isMounted) setIsLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId, settings, isSupabaseLive]);

  const persistLocal = useCallback(
    (newRecords: IncomeRecord[]) => {
      setRecords(newRecords);
      if (userId) {
        storageService.saveRecords(userId, newRecords);
      }
    },
    [userId]
  );

  const upsertRecord = useCallback(
    async (input: {
      date: string;
      cash: number;
      baseSalary?: number;
      tips?: number;
      bonus?: number;
      targetCash?: number;
      status?: DayStatus;
      isCustomStatus?: boolean;
      note?: string;
    }) => {
      if (!userId) return;

      const baseSalary = input.baseSalary ?? settings.defaultBaseSalary;
      const tips = input.tips ?? 0;
      const bonus = input.bonus ?? 0;
      const note = input.note ?? '';

      if (isSupabaseLive) {
        try {
          const saved = await supabaseIncomeService.upsertRecord(
            {
              userId,
              date: input.date,
              cash: input.cash,
              baseSalary,
              tips,
              bonus,
              status: input.status,
              isCustomStatus: input.isCustomStatus,
              note,
            },
            settings
          );

          setRecords((prev) => {
            const idx = prev.findIndex((r) => r.date === input.date);
            if (idx >= 0) {
              const clone = [...prev];
              clone[idx] = saved;
              return clone;
            }
            return [...prev, saved].sort((a, b) => a.date.localeCompare(b.date));
          });
          return saved;
        } catch (err) {
          console.error('Lỗi lưu Supabase:', err);
        }
      }

      // Fallback local
      const existingIndex = records.findIndex((r) => r.date === input.date);
      const now = new Date().toISOString();

      if (existingIndex >= 0) {
        const existing = records[existingIndex];
        const updated = computeRecordTotals(
          {
            ...existing,
            cash: input.cash,
            baseSalary: input.baseSalary ?? existing.baseSalary,
            tips: input.tips ?? existing.tips,
            bonus: input.bonus ?? existing.bonus,
            targetCash: input.targetCash ?? existing.targetCash,
            status: input.status ?? existing.status,
            isCustomStatus: input.isCustomStatus !== undefined ? input.isCustomStatus : existing.isCustomStatus,
            note: input.note !== undefined ? input.note : existing.note,
            updatedAt: now,
          },
          settings
        );

        const newRecords = [...records];
        newRecords[existingIndex] = updated;
        persistLocal(newRecords);
        return updated;
      } else {
        const newRecord = computeRecordTotals(
          {
            id: `rec_${Date.now()}`,
            userId,
            date: input.date,
            cash: input.cash,
            baseSalary,
            tips,
            bonus,
            targetCash: input.targetCash ?? 0,
            status: input.status,
            isCustomStatus: input.isCustomStatus || false,
            note,
            createdAt: now,
            updatedAt: now,
          },
          settings
        );

        const newRecords = [...records, newRecord].sort((a, b) => a.date.localeCompare(b.date));
        persistLocal(newRecords);
        return newRecord;
      }
    },
    [userId, records, settings, isSupabaseLive, persistLocal]
  );

  const updateInlineField = useCallback(
    (
      recordId: string,
      field: 'cash' | 'baseSalary' | 'tips' | 'bonus' | 'note' | 'status',
      value: number | string | DayStatus
    ) => {
      const target = records.find((r) => r.id === recordId);
      if (!target) return;

      const isStatus = field === 'status';
      upsertRecord({
        date: target.date,
        cash: field === 'cash' ? Number(value) : target.cash,
        baseSalary: field === 'baseSalary' ? Number(value) : target.baseSalary,
        tips: field === 'tips' ? Number(value) : target.tips,
        bonus: field === 'bonus' ? Number(value) : target.bonus,
        note: field === 'note' ? String(value) : target.note,
        status: isStatus ? (value as DayStatus) : target.status,
        isCustomStatus: isStatus ? true : target.isCustomStatus,
      });
    },
    [records, upsertRecord]
  );

  const deleteRecord = useCallback(
    async (recordId: string) => {
      const item = records.find((r) => r.id === recordId);
      if (item) lastDeletedRef.current = item;

      if (isSupabaseLive) {
        try {
          await supabaseIncomeService.deleteRecord(recordId);
        } catch (err) {
          console.error('Lỗi xóa Supabase:', err);
        }
      }

      const next = records.filter((r) => r.id !== recordId);
      persistLocal(next);
    },
    [records, isSupabaseLive, persistLocal]
  );

  const undoLastDelete = useCallback(() => {
    if (!lastDeletedRef.current) return false;
    const item = lastDeletedRef.current;
    lastDeletedRef.current = null;
    upsertRecord(item);
    return true;
  }, [upsertRecord]);

  const resetToSampleData = useCallback(async () => {
    if (!userId) return;
    if (isSupabaseLive) {
      const seeded = INITIAL_INCOME_RECORDS.map((r) => ({ ...r, userId }));
      const saved = await supabaseIncomeService.bulkUpsert(seeded, settings);
      setRecords(saved);
    } else {
      persistLocal(INITIAL_INCOME_RECORDS);
    }
  }, [userId, settings, isSupabaseLive, persistLocal]);

  const clearAllData = useCallback(async () => {
    if (!userId) return;
    if (isSupabaseLive) {
      await supabaseIncomeService.clearAllRecords(userId);
    }
    setRecords([]);
    storageService.clearAll(userId);
  }, [userId, isSupabaseLive]);

  return {
    records,
    isLoading,
    upsertRecord,
    updateInlineField,
    deleteRecord,
    undoLastDelete,
    resetToSampleData,
    clearAllData,
  };
}
