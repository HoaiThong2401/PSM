-- ==============================================================================
-- SCHEMA BẢNG PUSH SUBSCRIPTIONS & PHÂN QUYỀN TRÊN SUPABASE
-- Dành cho hệ thống gửi thông báo Web Push chạy ngầm khi tắt app
-- ==============================================================================

-- 1. Tạo bảng lưu trữ thông tin đăng ký nhận thông báo của người dùng
-- Khóa ngoại: user_id liên kết trực tiếp với auth.users(id), tự động xóa khi user bị xóa (CASCADE)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Đặt Index để tối ưu tìm kiếm theo user_id và endpoint
CREATE INDEX IF NOT EXISTS idx_push_sub_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_sub_endpoint ON public.push_subscriptions(endpoint);

-- 3. Bật RLS (Row Level Security)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Policies cho bảng push_subscriptions (Chỉ cho phép user thao tác trên thiết bị của chính họ)
DROP POLICY IF EXISTS "Users can select their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can select their own push subscriptions"
    ON public.push_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert their own push subscriptions"
    ON public.push_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update their own push subscriptions"
    ON public.push_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete their own push subscriptions"
    ON public.push_subscriptions FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Bổ sung cột lưu cài đặt thông báo cá nhân vào user_settings
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{}'::jsonb;

-- ==============================================================================
-- TỰ ĐỘNG GỬI LỜI NHẮC ĐỊNH KỲ (07:00 & 18:00) VỚI SUPABASE PG_CRON
-- (Cần bật extension pg_cron và pg_net trong Supabase Dashboard -> Extensions)
-- ==============================================================================

-- Bật các extensions nếu chưa có
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Đặt lịch nhắc ca sáng 07:00 (Giờ Việt Nam UTC+7 là 00:00 UTC)
SELECT cron.schedule(
  'send-morning-reminder-07h00',
  '0 0 * * *', -- 00:00 UTC = 07:00 VN
  $$
  SELECT net.http_post(
    url := 'https://<YOUR-PROJECT-REF>.supabase.co/functions/v1/send-daily-reminder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <YOUR-SERVICE-ROLE-KEY>"}'::jsonb,
    body := '{"type": "morning_reminder", "title": "🌅 Chúc bạn ngày mới năng suất!", "body": "Đừng quên chuẩn bị mục tiêu doanh thu hôm nay nhé."}'::jsonb
  );
  $$
);

-- Đặt lịch nhắc ghi nhận thu nhập 18:00 (Giờ Việt Nam UTC+7 là 11:00 UTC)
SELECT cron.schedule(
  'send-evening-missing-reminder-18h00',
  '0 11 * * *', -- 11:00 UTC = 18:00 VN
  $$
  SELECT net.http_post(
    url := 'https://<YOUR-PROJECT-REF>.supabase.co/functions/v1/send-daily-reminder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <YOUR-SERVICE-ROLE-KEY>"}'::jsonb,
    body := '{"type": "evening_reminder", "title": "📝 Nhắc nhở ghi nhận thu nhập", "body": "Hôm nay bạn đã vào ca chưa? Hãy dành 30 giây ghi nhận tiền mặt và tiền bo nhé!"}'::jsonb
  );
  $$
);
