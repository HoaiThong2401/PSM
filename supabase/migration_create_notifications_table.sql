-- ==============================================================================
-- MIGRATION: TẠO BẢNG APP_NOTIFICATIONS LƯU TRỮ VÀ ĐỒNG BỘ THÔNG BÁO NGƯỜI DÙNG
-- Hỗ trợ đánh dấu đã đọc, xóa vĩnh viễn và đồng bộ đa thiết bị
-- ==============================================================================

-- 1. Tạo bảng app_notifications
CREATE TABLE IF NOT EXISTS public.app_notifications (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    action_tab TEXT,
    action_date TEXT,
    action_cycle_id TEXT,
    dedup_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Đặt Index tối ưu truy vấn theo user_id và thời gian tạo
CREATE INDEX IF NOT EXISTS idx_app_notifs_user_created ON public.app_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_notifs_user_dedup ON public.app_notifications(user_id, dedup_key);

-- 3. Bật Row Level Security (RLS)
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

-- 4. Thiết lập RLS Policies (Chỉ cho phép user thao tác trên thông báo của chính họ)
DROP POLICY IF EXISTS "Users can select their own notifications" ON public.app_notifications;
CREATE POLICY "Users can select their own notifications"
    ON public.app_notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.app_notifications;
CREATE POLICY "Users can insert their own notifications"
    ON public.app_notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.app_notifications;
CREATE POLICY "Users can update their own notifications"
    ON public.app_notifications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.app_notifications;
CREATE POLICY "Users can delete their own notifications"
    ON public.app_notifications FOR DELETE
    USING (auth.uid() = user_id);
