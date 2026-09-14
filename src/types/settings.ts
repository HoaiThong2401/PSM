export interface UserSettings {
  weekdayTargetCash: number; // Mặc định: 200,000đ (Thứ 2 - Thứ 5)
  weekendTargetCash: number; // Mặc định: 250,000đ (Thứ 6 - Chủ Nhật)
  cycleStartDay: number; // Mặc định: ngày 26 hàng tháng
  defaultBaseSalary: number; // Lương cơ bản mặc định mỗi ngày
  currency: string; // 'VND'
  theme: 'light' | 'dark' | 'system';
  enableSoundEffects: boolean;
  enableCelebrationConfetti: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  weekdayTargetCash: 200000,
  weekendTargetCash: 250000,
  cycleStartDay: 26,
  defaultBaseSalary: 200000,
  currency: 'VND',
  theme: 'dark',
  enableSoundEffects: true,
  enableCelebrationConfetti: true,
};
