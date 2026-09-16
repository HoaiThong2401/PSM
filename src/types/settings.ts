export interface NotificationPreferences {
  enabled: boolean; // Bật/tắt tổng tất cả thông báo
  morningShiftEnabled: boolean; // Nhắc nhở ca sáng / mục tiêu ngày
  morningShiftTime: string; // '07:00'
  missingEntryEnabled: boolean; // Nhắc nhở nhập thu nhập chưa ghi nhận
  missingEntryTime: string; // '18:00'
  cycleEndingEnabled: boolean; // Nhắc nhở 3 ngày cuối chu kỳ
  goalAchievedEnabled: boolean; // Chúc mừng khi đạt mục tiêu
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: true,
  morningShiftEnabled: true,
  morningShiftTime: '07:00',
  missingEntryEnabled: true,
  missingEntryTime: '18:00',
  cycleEndingEnabled: true,
  goalAchievedEnabled: true,
};

export interface UserSettings {
  weekdayTargetCash: number; // Mặc định: 200,000đ (Thứ 2 - Thứ 5)
  weekendTargetCash: number; // Mặc định: 250,000đ (Thứ 6 - Chủ Nhật)
  cycleStartDay: number; // Mặc định: ngày 26 hàng tháng
  defaultBaseSalary: number; // Lương cơ bản mặc định mỗi ngày
  currency: string; // 'VND'
  theme: 'light' | 'dark' | 'system';
  language?: 'vi' | 'en';
  enableSoundEffects: boolean;
  enableCelebrationConfetti: boolean;
  notificationPrefs?: NotificationPreferences;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  weekdayTargetCash: 200000,
  weekendTargetCash: 250000,
  cycleStartDay: 26,
  defaultBaseSalary: 204000,
  currency: 'VND',
  theme: 'dark',
  language: 'vi',
  enableSoundEffects: true,
  enableCelebrationConfetti: true,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
};
