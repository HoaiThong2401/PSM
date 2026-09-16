import { supabase } from './supabaseClient';
import type { AppNotification } from '../types/notification';

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  action_tab?: string | null;
  action_date?: string | null;
  action_cycle_id?: string | null;
  dedup_key?: string | null;
  created_at: string;
}

export const supabaseNotificationService = {
  async fetchNotifications(userId: string): Promise<AppNotification[]> {
    if (!supabase || !userId) return [];

    const { data, error } = await supabase
      .from('app_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Lỗi tải thông báo từ Supabase:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row: DbNotification) => ({
      id: row.id,
      type: row.type as any,
      title: row.title,
      message: row.message,
      read: row.read,
      actionTab: (row.action_tab as any) || undefined,
      actionDate: row.action_date || undefined,
      actionCycleId: row.action_cycle_id || undefined,
      createdAt: row.created_at,
    }));
  },

  async insertNotification(
    userId: string,
    notification: AppNotification,
    dedupKey?: string
  ): Promise<void> {
    if (!supabase || !userId) return;

    const payload: DbNotification = {
      id: notification.id,
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      action_tab: notification.actionTab || null,
      action_date: notification.actionDate || null,
      action_cycle_id: notification.actionCycleId || null,
      dedup_key: dedupKey || null,
      created_at: notification.createdAt,
    };

    const { error } = await supabase.from('app_notifications').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Không thể lưu thông báo lên Supabase:', error.message);
    }
  },

  async markAsRead(userId: string, id: string): Promise<void> {
    if (!supabase || !userId) return;

    const { error } = await supabase
      .from('app_notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('id', id);

    if (error) {
      console.warn('Lỗi cập nhật đã đọc trên Supabase:', error.message);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (!supabase || !userId) return;

    const { error } = await supabase
      .from('app_notifications')
      .update({ read: true })
      .eq('user_id', userId);

    if (error) {
      console.warn('Lỗi đánh dấu đọc tất cả trên Supabase:', error.message);
    }
  },

  async deleteNotification(userId: string, id: string): Promise<void> {
    if (!supabase || !userId) return;

    const { error } = await supabase
      .from('app_notifications')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);

    if (error) {
      console.warn('Lỗi xóa thông báo trên Supabase:', error.message);
    }
  },

  async clearAll(userId: string): Promise<void> {
    if (!supabase || !userId) return;

    const { error } = await supabase
      .from('app_notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.warn('Lỗi xóa tất cả thông báo trên Supabase:', error.message);
    }
  },
};
