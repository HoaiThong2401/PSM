-- ==============================================================================
-- SALARY MANAGEMENT APPLICATION - SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================
-- Copy toàn bộ nội dung file này và dán vào Supabase SQL Editor -> Bấm RUN.
-- Hệ thống sẽ tự động tạo bảng, thiết lập khóa ngoại, chỉ mục và Row Level Security.
-- ==============================================================================

-- 1. Bật extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tạo bảng income_records (Các bản ghi thu nhập từng ngày)
CREATE TABLE IF NOT EXISTS public.income_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    cash BIGINT NOT NULL DEFAULT 0,
    base_salary BIGINT NOT NULL DEFAULT 0,
    tips BIGINT NOT NULL DEFAULT 0,
    bonus BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('processing', 'success', 'failed', 'not_started')),
    is_custom_status BOOLEAN NOT NULL DEFAULT false,
    note TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, date)
);

-- 3. Tạo bảng user_settings (Cài đặt mục tiêu tài chính & chu kỳ của người dùng)
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_target BIGINT NOT NULL DEFAULT 500000,
    weekend_target BIGINT NOT NULL DEFAULT 700000,
    currency TEXT NOT NULL DEFAULT 'VND',
    cycle_type TEXT NOT NULL DEFAULT 'monthly' CHECK (cycle_type IN ('monthly', 'biweekly', 'weekly', 'custom')),
    custom_cycle_start_day INTEGER NOT NULL DEFAULT 1 CHECK (custom_cycle_start_day BETWEEN 1 AND 31),
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tạo Indexes tối ưu tốc độ truy vấn
CREATE INDEX IF NOT EXISTS idx_income_records_user_date ON public.income_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_income_records_status ON public.income_records(user_id, status);

-- 5. Thiết lập Trigger tự động cập nhật cột updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_income_records_updated_at ON public.income_records;
CREATE TRIGGER set_income_records_updated_at
    BEFORE UPDATE ON public.income_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Thiết lập Trigger tự động khởi tạo user_settings khi có user mới đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_settings();

-- 7. Bật Row Level Security (RLS) - Bảo mật cấp dòng tuyệt đối
ALTER TABLE public.income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policies cho bảng income_records
DROP POLICY IF EXISTS "Users can select their own income records" ON public.income_records;
CREATE POLICY "Users can select their own income records"
    ON public.income_records FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own income records" ON public.income_records;
CREATE POLICY "Users can insert their own income records"
    ON public.income_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own income records" ON public.income_records;
CREATE POLICY "Users can update their own income records"
    ON public.income_records FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own income records" ON public.income_records;
CREATE POLICY "Users can delete their own income records"
    ON public.income_records FOR DELETE
    USING (auth.uid() = user_id);

-- Policies cho bảng user_settings
DROP POLICY IF EXISTS "Users can select their own settings" ON public.user_settings;
CREATE POLICY "Users can select their own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);
