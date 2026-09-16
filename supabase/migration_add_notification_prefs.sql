-- ==============================================================================
-- MIGRATION: BỔ SUNG CỘT NOTIFICATION_PREFS VÀO BẢNG USER_SETTINGS
-- Lưu trữ cấu hình giờ nhắc nhở cá nhân (ca sáng, ca tối, chu kỳ, mục tiêu)
-- ==============================================================================

-- 1. Thêm cột notification_prefs dạng JSONB nếu chưa tồn tại
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{
  "enabled": true,
  "morningShiftEnabled": true,
  "morningShiftTime": "07:00",
  "missingEntryEnabled": true,
  "missingEntryTime": "18:00",
  "cycleEndingEnabled": true,
  "goalAchievedEnabled": true
}'::jsonb;

-- 2. Cập nhật comment giải thích ý nghĩa cột
COMMENT ON COLUMN public.user_settings.notification_prefs IS 'Lưu trữ cấu hình bật/tắt và thời gian gửi các loại thông báo nhắc nhở của người dùng';
