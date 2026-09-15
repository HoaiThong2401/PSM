export type NotificationType =
  | 'morning_shift'        // ~7h sáng: nhắc nhở đi làm kiếm doanh thu
  | 'daily_missing_entry'  // Tối: nhắc nhập tiền nếu hôm nay chưa nhập
  | 'cycle_ending_soon'    // 3 ngày cuối chu kỳ (7h sáng & 22h tối)
  | 'goal_achieved'        // Chúc mừng đạt mục tiêu (success)
  | 'system';              // Hệ thống / Cài đặt

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO string
  read: boolean;
  actionTab?: 'dashboard' | 'income' | 'analytics' | 'settings';
  actionCycleId?: string;
  actionDate?: string;
}
